import { graphData } from '../data/graphData.js';
import { getTruppsData, addTrupp } from '../data/appData.js';

// Constants and caches
const shortestPathDistanceCache = new Map();
const pathCache = new Map();
const defaultChargingStations = ['Wannsee', 'Bahnitz'];
const defaultChargingDurationMs = 2 * 60 * 60 * 1000; // 2 hours

// Helper Functions
function formatCounter() {
  return String(Math.floor(Math.random() * 100)).padStart(2, '0');
}

function findAccompanyingTrupp(batteryTrupp, workingTrupps, currentTime) {
  return workingTrupps.find(t =>
    t.ausruestung !== 'Batterie' &&
    t.geschwindigkeit > 0 &&
    t.naechsteVerfuegbarkeit <= currentTime &&
    t.aktuellerEinsatzpunkt === batteryTrupp.aktuellerEinsatzpunkt
  );
}

class PriorityQueue {
  constructor() {
    this.collection = [];
  }

  enqueue(element, priority) {
    const entry = { element, priority };
    if (this.isEmpty() || priority < this.collection[0].priority) {
      this.collection.unshift(entry);
    } else {
      let added = false;
      for (let i = 0; i < this.collection.length; i++) {
        if (priority < this.collection[i].priority) {
          this.collection.splice(i, 0, entry);
          added = true;
          break;
        }
      }
      if (!added) {
        this.collection.push(entry);
      }
    }
  }

  dequeue() {
    return this.collection.shift();
  }

  isEmpty() {
    return this.collection.length === 0;
  }
}

function getShortestPathDistance(startNodeLabel, endNodeLabel) {
  const cacheKey = `${startNodeLabel}-${endNodeLabel}`;
  if (shortestPathDistanceCache.has(cacheKey)) {
    return shortestPathDistanceCache.get(cacheKey);
  }

  const distances = new Map();
  const previous = new Map(); // To reconstruct the path
  const pq = new PriorityQueue();

  graphData.nodes.forEach(node => {
    distances.set(node.label, Infinity);
    previous.set(node.label, null);
  });

  distances.set(startNodeLabel, 0);
  pq.enqueue(startNodeLabel, 0);

  while (!pq.isEmpty()) {
    const { element: currentLabel, priority: currentDistance } = pq.dequeue();

    if (currentDistance > distances.get(currentLabel)) {
      continue;
    }

    const neighbors = graphData.edges.filter(edge =>
      graphData.nodes[edge.source].label === currentLabel || graphData.nodes[edge.target].label === currentLabel
    );

    for (const edge of neighbors) {
      const neighborNode = graphData.nodes[edge.source].label === currentLabel ? graphData.nodes[edge.target] : graphData.nodes[edge.source];
      const distance = parseInt(edge.label.replace('km', ''));
      const risk = edge.risk || 1; // Default risk to 1 if not defined
      const weight = distance * risk; // Incorporate risk into weight

      const newDistance = currentDistance + weight;

      if (newDistance < distances.get(neighborNode.label)) {
        distances.set(neighborNode.label, newDistance);
        previous.set(neighborNode.label, { node: currentLabel, edge: edge }); // Store previous node and the edge used
        pq.enqueue(neighborNode.label, newDistance);
      }
    }
  }

  const distance = distances.get(endNodeLabel);
  if (distance === Infinity) {
    shortestPathDistanceCache.set(cacheKey, { distance: Infinity, path: null });
    return { distance: Infinity, path: null };
  }

  // Reconstruct path
  const path = [];
  let current = endNodeLabel;
  while (previous.get(current) && previous.get(current).node !== null) {
    const { node: prevNode, edge } = previous.get(current);
    path.unshift({
      source: prevNode,
      target: current,
      edge: edge
    });
    current = prevNode;
  }

  shortestPathDistanceCache.set(cacheKey, { distance: distance, path: path });
  return { distance: distance, path: path };
}

function findPath(startNodeLabel, endNodeLabel) {
  const result = getShortestPathDistance(startNodeLabel, endNodeLabel);
  return result.path;
}

function getCombinedSpeedKmPerMs(trupps) {
  if (!trupps || trupps.length === 0) {
    return 0;
  }
  const speeds = trupps.map(t => parseFloat(t.geschwindigkeit)).filter(s => !isNaN(s));
  if (speeds.length === 0) {
    return 0;
  }
  const slowestSpeedKmH = Math.min(...speeds);
  return slowestSpeedKmH / (60 * 60 * 1000);
}

function addMovementMissionsForPath(movingTrupps, pathSegments, currentStartTime, missionTypeDescription, plannedMissions, currentEinsatzId) {
  let travelTimeAccumulatedMs = 0;
  const combinedSpeedKmPerMs = getCombinedSpeedKmPerMs(movingTrupps);

  for (const segment of pathSegments) {
    const segmentStartLabel = segment.source;
    const segmentEndLabel = segment.target;
    const segmentDistance = parseInt(segment.edge.label.replace('km', ''));

    let segmentTravelTimeMs;
    if (combinedSpeedKmPerMs === 0) {
      throw new Error(`CRITICAL ERROR: Eine Gruppe von Trupps mit kombinierter Geschwindigkeit 0 wurde an addMovementMissionsForPath übergeben, obwohl Bewegung erwartet wurde. Segment: ${segmentStartLabel}-${segmentEndLabel}`);
    } else {
      segmentTravelTimeMs = segmentDistance / combinedSpeedKmPerMs;
    }

    const missionStartTime = new Date(currentStartTime.getTime() + travelTimeAccumulatedMs);
    const missionEndTime = new Date(missionStartTime.getTime() + segmentTravelTimeMs);

    movingTrupps.forEach(trupp => {
      plannedMissions.push({
        id: currentEinsatzId++,
        truppname: trupp.name,
        startzeit: missionStartTime.toISOString().slice(0, 16),
        startort: segmentStartLabel,
        endort: segmentEndLabel,
        endzeit: missionEndTime.toISOString().slice(0, 16),
        type: 'Bewegung',
        description: `${trupp.name} bewegt sich von ${segmentStartLabel} nach ${segmentEndLabel} (Bewegung: ${missionTypeDescription}).`
      });
      trupp.aktuellerEinsatzpunkt = segmentEndLabel;
    });
    
    travelTimeAccumulatedMs += segmentTravelTimeMs;
  }
  return {
    missions: plannedMissions,
    finalTime: new Date(currentStartTime.getTime() + travelTimeAccumulatedMs),
    currentEinsatzId: currentEinsatzId
  };
}

function handleBatterySupplyMission(technikTrupp, workingTrupps, currentTime, missions, einsatzId, chargingStations, chargingDurationMs) {
  const supplyTrupp = workingTrupps.find(t =>
    t.ausruestung !== 'Batterie' && 
    t.naechsteVerfuegbarkeit <= currentTime && 
    t.geschwindigkeit > 0
  );

  if (!supplyTrupp) {
    console.warn('handleBatterySupplyMission: Kein geeigneter Versorgungs-Trupp gefunden.');
    return { success: false };
  }

  let currentSupplyTime = new Date(currentTime);

  // Move to technik trupp
  const pathToTechnik = findPath(supplyTrupp.aktuellerEinsatzpunkt, technikTrupp.aktuellerEinsatzpunkt);
  if (!pathToTechnik || pathToTechnik.length === 0) {
    console.warn(`handleBatterySupplyMission: Kein Pfad für Versorgungs-Trupp ${supplyTrupp.name} zum Technik-Trupp ${technikTrupp.name} gefunden.`);
    return { success: false };
  }

  let result = addMovementMissionsForPath(
    [supplyTrupp], // supplyTrupp als Array übergeben
    pathToTechnik,
    currentSupplyTime,
    'Batterie abholen',
    missions,
    einsatzId
  );

  missions = result.missions;
  einsatzId = result.currentEinsatzId;
  currentSupplyTime = result.finalTime;

  // Find and move to charging station
  let closestStation = null;
  let minDistance = Infinity;
    
  for (const station of chargingStations) {
    const result = getShortestPathDistance(supplyTrupp.aktuellerEinsatzpunkt, station);
    if (result.distance !== Infinity && result.distance < minDistance) {
      minDistance = result.distance;
      closestStation = station;
    }
  }

  if (!closestStation) {
    console.warn(`handleBatterySupplyMission: Kein nächster Ladestation für Versorgungs-Trupp ${supplyTrupp.name} gefunden.`);
    return { success: false };
  }

  const pathToStation = findPath(supplyTrupp.aktuellerEinsatzpunkt, closestStation);
  if (!pathToStation || pathToStation.length === 0) {
    console.warn(`handleBatterySupplyMission: Kein Pfad für Versorgungs-Trupp ${supplyTrupp.name} zur Ladestation ${closestStation} gefunden.`);
    return { success: false };
  }

  result = addMovementMissionsForPath(
    [supplyTrupp], // supplyTrupp als Array übergeben
    pathToStation,
    currentSupplyTime,
    'zur Ladestation',
    missions,
    einsatzId
  );

  missions = result.missions;
  einsatzId = result.currentEinsatzId;
  currentSupplyTime = result.finalTime;

  // Charge battery
  missions.push({
    id: einsatzId++,
    truppname: supplyTrupp.name,
    startzeit: currentSupplyTime.toISOString().slice(0, 16),
    startort: closestStation,
    endort: closestStation,
    endzeit: new Date(currentSupplyTime.getTime() + chargingDurationMs).toISOString().slice(0, 16),
    type: 'Batterie aufladen',
    description: `${supplyTrupp.name} lädt eine Batterie an ${closestStation} auf.`
  });

  currentSupplyTime = new Date(currentSupplyTime.getTime() + chargingDurationMs);

  // Return to technik trupp
  const pathBack = findPath(closestStation, technikTrupp.aktuellerEinsatzpunkt);
  if (!pathBack || pathBack.length === 0) {
    console.warn(`handleBatterySupplyMission: Kein Pfad für Versorgungs-Trupp ${supplyTrupp.name} zurück zum Technik-Trupp ${technikTrupp.name} gefunden.`);
    return { success: false };
  }

  result = addMovementMissionsForPath(
    [supplyTrupp], // supplyTrupp als Array übergeben
    pathBack,
    currentSupplyTime,
    'Batterie liefern',
    missions,
    einsatzId
  );

  technikTrupp.verbleibendeBatteriezeit = technikTrupp.einsatzzeitMax;
  technikTrupp.benoetigtBatterie = false;
  technikTrupp.naechsteVerfuegbarkeit = result.finalTime;

  supplyTrupp.naechsteVerfuegbarkeit = new Date(result.finalTime.getTime() + (supplyTrupp.ruhezeit * 60 * 60 * 1000));

  return {
    success: true,
    missions: result.missions,
    currentEinsatzId: result.currentEinsatzId
  };
}

function findSuitableTrupps(segment, currentTime, workingTrupps, distance, risk) {
  const candidateTrupps = [];

  for (const trupp of workingTrupps) {
    if (trupp.naechsteVerfuegbarkeit > currentTime) continue;

    let potentialTravelTimeMs = 0;
    if (trupp.aktuellerEinsatzpunkt !== segment.source) {
      const travelInfo = getShortestPathDistance(trupp.aktuellerEinsatzpunkt, segment.source);
      if (travelInfo.distance === Infinity) continue;
      const speedKmPerMs = trupp.geschwindigkeit / (60 * 60 * 1000);
      potentialTravelTimeMs = travelInfo.distance / speedKmPerMs;
    }

    const potentialStartTime = new Date(Math.max(
      currentTime.getTime(),
      trupp.naechsteVerfuegbarkeit.getTime() + potentialTravelTimeMs
    ));

    if (trupp.geschwindigkeit > 0 && trupp.reichweite >= distance) {
      const minStaerke = risk * 2;
      const strengthMet = trupp.staerke >= minStaerke;

      let equipmentMet = false;
      if (risk < 4) {
        equipmentMet = true; // No special equipment needed for risk < 4
      } else if (risk >= 4) { // For risk 4 and 5, special equipment is needed
        equipmentMet = trupp.ausruestung === 'CombatMedic' || trupp.ausruestung === 'Überwachung' || trupp.ausruestung === 'Veteran';
      }

      // Apply the OR condition: strength OR equipment
      if (strengthMet || equipmentMet) {
        candidateTrupps.push({ trupp, potentialStartTime });
      }
    }
  }

  candidateTrupps.sort((a, b) => a.potentialStartTime.getTime() - b.potentialStartTime.getTime());
  return candidateTrupps;
}

function generateNewTrupp(location, startTime, specs) {
  const isBatteryTrupp = specs.type === 'Batterie';

  const einsatzdauer = 1 + Math.floor(Math.random() * 5);
  const ruhezeit = isBatteryTrupp ? 0 : (einsatzdauer <= 2 ? 1 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3));

  let staerke;
  if (isBatteryTrupp) {
    staerke = 3; // Techniktrupps have a fixed strength of 3
  } else {
    const minStaerke = 4;
    const maxStaerke = 10;
    staerke = minStaerke + Math.floor(Math.random() * (maxStaerke - minStaerke + 1));
  }
  
  const reichweite = isBatteryTrupp ? 50 : 25;

  const prefixes = ['WD-', 'BER-', 'BAST-'];
  const prefix = isBatteryTrupp ? 'BeROp-' : prefixes[Math.floor(Math.random() * prefixes.length)];
  const truppName = `${prefix}${formatCounter()}`;

  return {
    id: `gen-Trupp-${Math.floor(Math.random() * 100000)}`,
    name: truppName,
    staerke: staerke,
    einsatzdauer: einsatzdauer,
    reichweite: reichweite,
    geschwindigkeit: isBatteryTrupp ? 10 : (4 + Math.floor(Math.random() * 5)),
    ruhezeit: ruhezeit,
    ausruestung: specs.type,
    aktuellerEinsatzpunkt: location,
    naechsteVerfuegbarkeit: new Date(startTime),
    einsatzzeitMax: isBatteryTrupp ? 8 : 0,
    verbleibendeBatteriezeit: isBatteryTrupp ? 8 : 0,
    benoetigtBatterie: false
  };
}

function createRelayMission(relayTrupps, segment, startTime, missions, einsatzId) {
  const mainTrupp = relayTrupps.find(t => t.ausruestung === 'Batterie') || relayTrupps[0];
  const truppNames = relayTrupps.map(t => t.name).join(', ');

  const truupsNeedingMovement = relayTrupps.filter(t => t.aktuellerEinsatzpunkt !== segment.source);
  if (truupsNeedingMovement.length > 0) {
    const fastestMovingTrupp = truupsNeedingMovement.reduce((prev, current) => (prev.geschwindigkeit > current.geschwindigkeit ? prev : current));
    const pathToStart = findPath(fastestMovingTrupp.aktuellerEinsatzpunkt, segment.source);
    if (!pathToStart || pathToStart.length === 0) {
      return { success: false };
    }

    const result = addMovementMissionsForPath(
      truupsNeedingMovement,
      pathToStart,
      startTime,
      'zum Relaispunkt',
      missions,
      einsatzId
    );

    missions = result.missions;
    einsatzId = result.currentEinsatzId;
    startTime = result.finalTime;
  }

  const duration = (mainTrupp.einsatzdauer || 1) * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + duration);

  missions.push({
    id: einsatzId++,
    truppname: truppNames,
    startzeit: startTime.toISOString().slice(0, 16),
    startort: segment.source,
    endort: segment.target,
    endzeit: endTime.toISOString().slice(0, 16),
    type: 'Relay',
    description: `${mainTrupp.ausruestung === 'Batterie' ? 'Techniktrupp ' : ''}${truppNames} stellen eine Relais-Verbindung zwischen ${segment.source} und ${segment.target} her.`
  });

  relayTrupps.forEach(trupp => {
    if (trupp.ausruestung === 'Batterie') {
      trupp.verbleibendeBatteriezeit -= (mainTrupp.einsatzdauer || 1);
      if (trupp.verbleibendeBatteriezeit <= 0) {
        trupp.benoetigtBatterie = true;
        trupp.naechsteVerfuegbarkeit = new Date(endTime.getTime() + (1 * 60 * 60 * 1000));
      } else {
        trupp.naechsteVerfuegbarkeit = endTime;
      }
    }
    else {
      trupp.naechsteVerfuegbarkeit = new Date(endTime.getTime() + (trupp.ruhezeit * 60 * 60 * 1000));
    }
    trupp.aktuellerEinsatzpunkt = segment.target;
  });

  return {
    success: true,
    currentEinsatzId: einsatzId,
    endTime: endTime
  };
}

function generateCommunicationBridgePlan(startNodeLabel, endNodeLabel, startTimeStr, endTimeStr, chargingStations = defaultChargingStations, chargingDurationMs = defaultChargingDurationMs) {
  console.log(`Generating communication bridge plan from ${startNodeLabel} to ${endNodeLabel} between ${startTimeStr} and ${endTimeStr}`);

  shortestPathDistanceCache.clear();
  pathCache.clear();

  const pathWithEdges = findPath(startNodeLabel, endNodeLabel);
  if (!pathWithEdges) {
    console.warn('Could not find a path for communication bridge.');
    return { missions: [], bridgeSegments: [] };
  }

  let plannedMissions = [];
  let bridgeSegments = [];
  let currentEinsatzId = 200;

  const startDate = new Date(startTimeStr);
  const endDate = new Date(endTimeStr);
  let currentTime = new Date(startDate);

  const maxRisk = Math.max(...pathWithEdges.map(segment => segment.edge.risk || 0));
  const numSegments = pathWithEdges.length;

  const minTechnikTrupps = Math.ceil(numSegments / 3);
  // const minMobileTrupps = Math.ceil(numSegments / 2) + minTechnikTrupps; // Removed as troop generation is removed
  const minSupplyTrupps = Math.ceil(minTechnikTrupps / 4);

  const allExistingTrupps = getTruppsData();
  
  // Filter Techniktrupps to enforce the limit of 5
  const maxAllowedTechnikTrupps = 5;
  let filteredTechnikTrupps = allExistingTrupps.filter(t => t.ausruestung === 'Batterie');
  if (filteredTechnikTrupps.length > maxAllowedTechnikTrupps) {
    console.warn(`Warning: More than ${maxAllowedTechnikTrupps} Techniktrupps exist. Using only the first ${maxAllowedTechnikTrupps}.`);
    filteredTechnikTrupps = filteredTechnikTrupps.slice(0, maxAllowedTechnikTrupps);
  }

  // Filter regular troops to enforce the limit of 12
  const maxAllowedMobileTrupps = 12;
  let filteredMobileTrupps = allExistingTrupps.filter(t => t.ausruestung !== 'Batterie' && t.geschwindigkeit > 0);
  if (filteredMobileTrupps.length > maxAllowedMobileTrupps) {
    console.warn(`Warning: More than ${maxAllowedMobileTrupps} regular troops exist. Using only the first ${maxAllowedMobileTrupps}.`);
    filteredMobileTrupps = filteredMobileTrupps.slice(0, maxAllowedMobileTrupps);
  }

  // Removed troop generation logic as per feedback.
  // The planner must now rely solely on existing troops.

  const workingTrupps = [...filteredTechnikTrupps, ...filteredMobileTrupps].map(trupp => {
    let naechsteVerfuegbarkeit = new Date(trupp.naechsteVerfuegbarkeit || startDate);
    if (isNaN(naechsteVerfuegbarkeit.getTime())) {
      naechsteVerfuegbarkeit = new Date(startDate);
    }
    const geschwindigkeit = parseFloat(trupp.geschwindigkeit);
    return {
      ...trupp,
      naechsteVerfuegbarkeit,
      geschwindigkeit: isNaN(geschwindigkeit) ? 0 : geschwindigkeit,
      einsatzzeitGesamt: 0,
      einsatzzeitMax: trupp.einsatzzeitMax || (trupp.ausruestung === 'Batterie' ? 8 : 0),
      verbleibendeBatteriezeit: trupp.verbleibendeBatteriezeit || (trupp.ausruestung === 'Batterie' ? 8 : 0),
      benoetigtBatterie: trupp.benoetigtBatterie || false,
    };
  });

  const timeStepMs = 15 * 60 * 1000;
  const segmentStates = new Map();

  for (const segment of pathWithEdges) {
    const segmentKey = `${segment.source}-${segment.target}`;
    segmentStates.set(segmentKey, { trupp: null, endTime: null, covered: false });
  }

  while (currentTime < endDate) {
    let nextEventTime = endDate.getTime();
    let activityThisIteration = false;

    const segmentsToCover = pathWithEdges.filter(segment => {
      const segmentKey = `${segment.source}-${segment.target}`;
      const state = segmentStates.get(segmentKey);
      return !state.covered || state.endTime <= currentTime;
    });

    for (const segment of segmentsToCover) {
      const segmentKey = `${segment.source}-${segment.target}`;
      const distance = parseInt(segment.edge.label.replace('km', ''));
      const risk = segment.edge.risk;



    const technikTruppsNeedingSupply = workingTrupps.filter(t =>
      t.ausruestung === 'Batterie' &&
            t.benoetigtBatterie &&
            t.naechsteVerfuegbarkeit <= currentTime
    );

    for (const technikTrupp of technikTruppsNeedingSupply) {
      const supplyResult = handleBatterySupplyMission(technikTrupp, workingTrupps, currentTime, plannedMissions, currentEinsatzId, chargingStations, chargingDurationMs);
      if (supplyResult.success) {
        currentEinsatzId = supplyResult.currentEinsatzId;
        activityThisIteration = true;
      }
    }

    if (!activityThisIteration) {
      let earliestNextEvent = endDate.getTime();

      for (const trupp of workingTrupps) {
        if (trupp.naechsteVerfuegbarkeit.getTime() > currentTime.getTime()) {
          earliestNextEvent = Math.min(earliestNextEvent, trupp.naechsteVerfuegbarkeit.getTime());
        }
      }

      for (const [, state] of segmentStates.entries()) {
        if (state.covered && state.endTime.getTime() > currentTime.getTime()) {
          earliestNextEvent = Math.min(earliestNextEvent, state.endTime.getTime());
        }
      }

      if (earliestNextEvent === endDate.getTime()) {
        currentTime = new Date(currentTime.getTime() + timeStepMs);
      } else {
        currentTime = new Date(earliestNextEvent);
      }
    } else {
      currentTime = new Date(nextEventTime);
    }
  }

  plannedMissions.sort((a, b) => new Date(a.startzeit).getTime() - new Date(b.startzeit).getTime());
  bridgeSegments.sort((a, b) => new Date(a.startzeit).getTime() - new Date(b.startzeit).getTime());

  return {
    missions: plannedMissions,
    bridgeSegments: bridgeSegments
  };
}

function generateMissionPlan() {
  console.log('generateMissionPlan called - generating 18h communication bridge plan');
  const startNode = 'Mahlwinkel';
  const endNode = 'Berlin-Alexanderplatz';
  const startTime = '2025-08-26T04:00';
  const endTime = '2025-08-26T22:00';
  return generateCommunicationBridgePlan(startNode, endNode, startTime, endTime, defaultChargingStations, defaultChargingDurationMs);
}

export { generateMissionPlan, generateCommunicationBridgePlan, findPath };
