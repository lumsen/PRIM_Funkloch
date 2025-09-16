import { graphData } from '../data/graphData.js';
import { getTruppsData } from '../data/appData.js';

// Constants and caches
const shortestPathDistanceCache = new Map();
const pathCache = new Map();
const defaultChargingStations = ['Wannsee', 'Bahnitz'];
const defaultChargingDurationMs = 2 * 60 * 60 * 1000; // 2 hours

// Helper Functions



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

  const numSegments = pathWithEdges.length;

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

  // Deploy technik trupps to segments
  let deploymentTime = new Date(startDate);
  for (let i = 0; i < Math.min(filteredTechnikTrupps.length, numSegments); i++) {
    const segment = pathWithEdges[i];
    const segmentKey = `${segment.source}-${segment.target}`;
    if (!segmentStates.get(segmentKey).covered) {
      const trupp = workingTrupps.find(t => t.ausruestung === 'Batterie' && t.naechsteVerfuegbarkeit <= deploymentTime);
      if (trupp) {
        // Move trupp to the segment start if not already there
        if (trupp.aktuellerEinsatzpunkt !== segment.source) {
          const pathToSegment = findPath(trupp.aktuellerEinsatzpunkt, segment.source);
          if (pathToSegment && pathToSegment.length > 0) {
            const result = addMovementMissionsForPath([trupp], pathToSegment, deploymentTime, 'zum Einsatzpunkt', plannedMissions, currentEinsatzId);
            plannedMissions = result.missions;
            currentEinsatzId = result.currentEinsatzId;
            deploymentTime = result.finalTime;
            trupp.naechsteVerfuegbarkeit = deploymentTime;
          }
        }
        // Assign to segment
        segmentStates.get(segmentKey).trupp = trupp;
        segmentStates.get(segmentKey).endTime = endDate;
        segmentStates.get(segmentKey).covered = true;
        bridgeSegments.push({
          source: segment.source,
          target: segment.target,
          truppname: trupp.name,
          startzeit: deploymentTime.toISOString().slice(0, 16),
          endzeit: endDate.toISOString().slice(0, 16),
          type: 'Relay'
        });
        plannedMissions.push({
          id: currentEinsatzId++,
          truppname: trupp.name,
          startzeit: deploymentTime.toISOString().slice(0, 16),
          startort: segment.source,
          endort: segment.target,
          endzeit: endDate.toISOString().slice(0, 16),
          type: 'Relay',
          description: `${trupp.name} betreibt Relais von ${segment.source} nach ${segment.target}.`
        });
        trupp.naechsteVerfuegbarkeit = endDate;
      }
    }
  }

  while (currentTime < endDate) {
    let nextEventTime = endDate.getTime();
    let activityThisIteration = false;

    // Segments to cover but not used in current logic
    // const segmentsToCover = pathWithEdges.filter(segment => {
    //   const segmentKey = `${segment.source}-${segment.target}`;
    //   const state = segmentStates.get(segmentKey);
    //   return !state.covered || state.endTime <= currentTime;
    // });

    // Loop through segments but no action required in current logic

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
