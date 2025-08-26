import { graphData } from '../data/graphData.js';
import { getTruppsData, addTrupp } from '../data/appData.js';

// Constants and caches
const shortestPathDistanceCache = new Map();
const pathCache = new Map();
const chargingStations = ["Wannsee", "Bahnitz"];

// Helper Functions
function formatCounter() {
    return String(Math.floor(Math.random() * 100)).padStart(2, '0');
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
    const pq = new PriorityQueue();

    graphData.nodes.forEach(node => {
        distances.set(node.label, Infinity);
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
            const weight = parseInt(edge.label.replace('km', ''));
            const newDistance = currentDistance + weight;

            if (newDistance < distances.get(neighborNode.label)) {
                distances.set(neighborNode.label, newDistance);
                pq.enqueue(neighborNode.label, newDistance);
            }
        }
    }
    const distance = distances.get(endNodeLabel);
    shortestPathDistanceCache.set(cacheKey, distance);
    return distance;
}

function findPath(startNodeLabel, endNodeLabel) {
    const cacheKey = `${startNodeLabel}-${endNodeLabel}`;
    if (pathCache.has(cacheKey)) {
        return pathCache.get(cacheKey);
    }

    const queue = [];
    const visited = new Set();
    const parentMap = new Map();
    const edgeMap = new Map();

    const startNode = graphData.nodes.find(node => node.label === startNodeLabel);
    const endNode = graphData.nodes.find(node => node.label === endNodeLabel);

    if (!startNode || !endNode) {
        console.error("Start or end node not found!");
        return null;
    }

    queue.push(startNode);
    visited.add(startNode.label);
    parentMap.set(startNode.label, null);

    while (queue.length > 0) {
        const currentNode = queue.shift();

        if (currentNode.label === endNode.label) {
            const path = [];
            let tempNodeLabel = endNode.label;
            while (parentMap.get(tempNodeLabel) !== null) {
                const prevNodeLabel = parentMap.get(tempNodeLabel);
                const edge = edgeMap.get(`${prevNodeLabel}-${tempNodeLabel}`);
                path.unshift({
                    source: prevNodeLabel,
                    target: tempNodeLabel,
                    edge: edge
                });
                tempNodeLabel = prevNodeLabel;
            }
            pathCache.set(cacheKey, path);
            return path;
        }

        for (const edge of graphData.edges) {
            let connectedNode = null;
            let currentEdge = null;

            if (graphData.nodes[edge.source].label === currentNode.label) {
                connectedNode = graphData.nodes[edge.target];
                currentEdge = edge;
            } else if (graphData.nodes[edge.target].label === currentNode.label) {
                connectedNode = graphData.nodes[edge.source];
                currentEdge = edge;
            }

            if (connectedNode && !visited.has(connectedNode.label)) {
                visited.add(connectedNode.label);
                parentMap.set(connectedNode.label, currentNode.label);
                edgeMap.set(`${currentNode.label}-${connectedNode.label}`, currentEdge);
                queue.push(connectedNode);
            }
        }
    }

    console.log("No path found.");
    pathCache.set(cacheKey, null);
    return null;
}

function addMovementMissionsForPath(trupp, pathSegments, currentStartTime, missionTypeDescription, plannedMissions, currentEinsatzId) {
    let travelTimeAccumulatedMs = 0;
    const speedKmPerMs = trupp.geschwindigkeit / (60 * 60 * 1000);

    for (const segment of pathSegments) {
        const segmentStartLabel = segment.source;
        const segmentEndLabel = segment.target;
        const segmentDistance = parseInt(segment.edge.label.replace('km', ''));
        const segmentTravelTimeMs = segmentDistance / speedKmPerMs;

        const missionStartTime = new Date(currentStartTime.getTime() + travelTimeAccumulatedMs);
        const missionEndTime = new Date(missionStartTime.getTime() + segmentTravelTimeMs);

        plannedMissions.push({
            id: currentEinsatzId++,
            truppname: trupp.name,
            startzeit: missionStartTime.toISOString().slice(0, 16),
            startort: segmentStartLabel,
            endort: segmentEndLabel,
            endzeit: missionEndTime.toISOString().slice(0, 16),
            type: "Bewegung",
            description: `${trupp.name} bewegt sich von ${segmentStartLabel} nach ${segmentEndLabel} (${missionTypeDescription}).`
        });
        travelTimeAccumulatedMs += segmentTravelTimeMs;
        trupp.aktuellerEinsatzpunkt = segmentEndLabel;
    }
    return {
        missions: plannedMissions,
        finalTime: new Date(currentStartTime.getTime() + travelTimeAccumulatedMs),
        currentEinsatzId: currentEinsatzId
    };
}

function handleBatterySupplyMission(technikTrupp, workingTrupps, currentTime, missions, einsatzId) {
    const supplyTrupp = workingTrupps.find(t =>
        t.ausruestung !== 'Batterie' && 
        t.naechsteVerfuegbarkeit <= currentTime && 
        t.geschwindigkeit > 0
    );

    if (!supplyTrupp) {
        return { success: false };
    }

    let currentSupplyTime = new Date(currentTime);

    // Move to technik trupp
    const pathToTechnik = findPath(supplyTrupp.aktuellerEinsatzpunkt, technikTrupp.aktuellerEinsatzpunkt);
    if (!pathToTechnik || pathToTechnik.length === 0) {
        return { success: false };
    }

    let result = addMovementMissionsForPath(
        supplyTrupp,
        pathToTechnik,
        currentSupplyTime,
        "Batterie abholen",
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
        const dist = getShortestPathDistance(supplyTrupp.aktuellerEinsatzpunkt, station);
        if (dist !== Infinity && dist < minDistance) {
            minDistance = dist;
            closestStation = station;
        }
    }

    if (!closestStation) {
        return { success: false };
    }

    const pathToStation = findPath(supplyTrupp.aktuellerEinsatzpunkt, closestStation);
    if (!pathToStation || pathToStation.length === 0) {
        return { success: false };
    }

    result = addMovementMissionsForPath(
        supplyTrupp,
        pathToStation,
        currentSupplyTime,
        "zur Ladestation",
        missions,
        einsatzId
    );

    missions = result.missions;
    einsatzId = result.currentEinsatzId;
    currentSupplyTime = result.finalTime;

    // Charge battery
    const chargingDurationMs = 2 * 60 * 60 * 1000;
    missions.push({
        id: einsatzId++,
        truppname: supplyTrupp.name,
        startzeit: currentSupplyTime.toISOString().slice(0, 16),
        startort: closestStation,
        endort: closestStation,
        endzeit: new Date(currentSupplyTime.getTime() + chargingDurationMs).toISOString().slice(0, 16),
        type: "Batterie aufladen",
        description: `${supplyTrupp.name} lädt eine Batterie an ${closestStation} auf.`
    });

    currentSupplyTime = new Date(currentSupplyTime.getTime() + chargingDurationMs);

    // Return to technik trupp
    const pathBack = findPath(closestStation, technikTrupp.aktuellerEinsatzpunkt);
    if (!pathBack || pathBack.length === 0) {
        return { success: false };
    }

    result = addMovementMissionsForPath(
        supplyTrupp,
        pathBack,
        currentSupplyTime,
        "Batterie liefern",
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
            const travelDistance = getShortestPathDistance(trupp.aktuellerEinsatzpunkt, segment.source);
            if (travelDistance === Infinity) continue;
            const speedKmPerMs = trupp.geschwindigkeit / (60 * 60 * 1000);
            potentialTravelTimeMs = travelDistance / speedKmPerMs;
        }

        const potentialStartTime = new Date(Math.max(
            currentTime.getTime(),
            trupp.naechsteVerfuegbarkeit.getTime() + potentialTravelTimeMs
        ));

        if (trupp.ausruestung === 'Batterie') {
            if (!trupp.benoetigtBatterie && 
                trupp.aktuellerEinsatzpunkt === segment.source) {
                candidateTrupps.push({ trupp, potentialStartTime });
            }
        } else if (trupp.geschwindigkeit > 0 && trupp.reichweite >= distance && distance <= 25) {
            const minStaerke = risk * 2;
            if (trupp.staerke < minStaerke) continue;
            if (risk >= 4 && trupp.ausruestung !== 'CombatMedic' && trupp.ausruestung !== 'Überwachung') continue;
            if (risk === 5 && trupp.ausruestung !== 'Veteran') continue;
            candidateTrupps.push({ trupp, potentialStartTime });
        }
    }

    candidateTrupps.sort((a, b) => a.potentialStartTime.getTime() - b.potentialStartTime.getTime());
    return candidateTrupps;
}

function generateNewTrupp(location, startTime, specs) {
    const einsatzdauer = 1 + Math.floor(Math.random() * 4);
    const ruhezeit = einsatzdauer <= 2 ? 
        1 + Math.floor(Math.random() * 2) :
        2 + Math.floor(Math.random() * 3);

    const staerke = specs.minStaerke + Math.floor(Math.random() * (specs.maxStaerke - specs.minStaerke + 1));
    const reichweite = specs.minReichweite + Math.floor(Math.random() * (specs.maxReichweite - specs.minReichweite + 1));

    const prefixes = ['WD-', 'BER-', 'BAST-'];
    const prefix = specs.type === 'Batterie' ? 'BeROp-' : prefixes[Math.floor(Math.random() * prefixes.length)];
    const truppName = `${prefix}${formatCounter()}`;

    return {
        id: `gen-Trupp-${Math.floor(Math.random() * 100000)}`,
        name: truppName,
        staerke: staerke,
        einsatzdauer: einsatzdauer,
        reichweite: reichweite,
        geschwindigkeit: 3 + Math.floor(Math.random() * 4),
        ruhezeit: ruhezeit,
        ausruestung: specs.type,
        aktuellerEinsatzpunkt: location,
        naechsteVerfuegbarkeit: new Date(startTime),
        einsatzzeitMax: specs.type === 'Batterie' ? 8 : 0,
        verbleibendeBatteriezeit: specs.type === 'Batterie' ? 8 : 0,
        benoetigtBatterie: false
    };
}

function createRelayMission(trupp, segment, startTime, missions, einsatzId) {
    if (trupp.aktuellerEinsatzpunkt !== segment.source) {
        const pathToStart = findPath(trupp.aktuellerEinsatzpunkt, segment.source);
        if (!pathToStart || pathToStart.length === 0) {
            return { success: false };
        }

        const result = addMovementMissionsForPath(
            trupp,
            pathToStart,
            startTime,
            "zum Relaispunkt",
            missions,
            einsatzId
        );
        
        missions = result.missions;
        einsatzId = result.currentEinsatzId;
        startTime = result.finalTime;
    }

    const duration = (trupp.einsatzdauer || 1) * 60 * 60 * 1000;
    const endTime = new Date(startTime.getTime() + duration);

    missions.push({
        id: einsatzId++,
        truppname: trupp.name,
        startzeit: startTime.toISOString().slice(0, 16),
        startort: segment.source,
        endort: segment.target,
        endzeit: endTime.toISOString().slice(0, 16),
        type: "Relay",
        description: `${trupp.name} stellt eine Relais-Verbindung zwischen ${segment.source} und ${segment.target} her.`
    });

    if (trupp.ausruestung === 'Batterie') {
        trupp.verbleibendeBatteriezeit -= trupp.einsatzdauer;
        if (trupp.verbleibendeBatteriezeit <= 0) {
            trupp.benoetigtBatterie = true;
            trupp.naechsteVerfuegbarkeit = new Date(endTime.getTime() + (1 * 60 * 60 * 1000));
        } else {
            trupp.naechsteVerfuegbarkeit = endTime;
        }
    } else {
        trupp.naechsteVerfuegbarkeit = new Date(endTime.getTime() + (trupp.ruhezeit * 60 * 60 * 1000));
    }

    return {
        success: true,
        currentEinsatzId: einsatzId,
        endTime: endTime
    };
}

function generateCommunicationBridgePlan(startNodeLabel, endNodeLabel, startTimeStr, endTimeStr) {
    console.log(`Generating communication bridge plan from ${startNodeLabel} to ${endNodeLabel} between ${startTimeStr} and ${endTimeStr}`);

    shortestPathDistanceCache.clear();
    pathCache.clear();

    const pathWithEdges = findPath(startNodeLabel, endNodeLabel);
    if (!pathWithEdges) {
        console.warn("Could not find a path for communication bridge.");
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

    // Calculate minimum required troops
    const minTechnikTrupps = Math.ceil(numSegments / 3);
    const minMobileTrupps = Math.ceil(numSegments / 2);
    const minSupplyTrupps = Math.ceil(minTechnikTrupps / 4);

    // Get existing troops
    const existingTrupps = getTruppsData();
    const existingTechnikTrupps = existingTrupps.filter(t => t.ausruestung === 'Batterie');
    const existingMobileTrupps = existingTrupps.filter(t => t.ausruestung !== 'Batterie' && t.geschwindigkeit > 0);
    const existingSupplyTrupps = existingTrupps.filter(t => t.ausruestung !== 'Batterie' && t.geschwindigkeit > 0 && t.staerke >= 4);

    // Generate additional troops if needed
    const additionalTechnikTrupps = Math.max(0, minTechnikTrupps - existingTechnikTrupps.length);
    const additionalMobileTrupps = Math.max(0, minMobileTrupps - existingMobileTrupps.length);
    const additionalSupplyTrupps = Math.max(0, minSupplyTrupps - existingSupplyTrupps.length);

    for (let i = 0; i < additionalTechnikTrupps; i++) {
        const trupp = generateNewTrupp(startNodeLabel, startDate, {
            type: 'Batterie',
            minStaerke: 3,
            maxStaerke: 5,
            minReichweite: 15,
            maxReichweite: 25
        });
        existingTrupps.push(trupp);
        addTrupp(trupp);
    }

    for (let i = 0; i < additionalMobileTrupps; i++) {
        const trupp = generateNewTrupp(startNodeLabel, startDate, {
            type: maxRisk >= 4 ? (Math.random() > 0.5 ? 'CombatMedic' : 'Überwachung') : 'None',
            minStaerke: maxRisk * 2,
            maxStaerke: maxRisk * 3,
            minReichweite: 20,
            maxReichweite: 25
        });
        existingTrupps.push(trupp);
        addTrupp(trupp);
    }

    for (let i = 0; i < additionalSupplyTrupps; i++) {
        const trupp = generateNewTrupp(startNodeLabel, startDate, {
            type: 'None',
            minStaerke: 4,
            maxStaerke: 6,
            minReichweite: 25,
            maxReichweite: 25
        });
        existingTrupps.push(trupp);
        addTrupp(trupp);
    }

    const workingTrupps = existingTrupps.map(trupp => ({
        ...trupp,
        naechsteVerfuegbarkeit: trupp.naechsteVerfuegbarkeit || new Date(startDate),
        einsatzzeitGesamt: 0,
        einsatzzeitMax: trupp.einsatzzeitMax || (trupp.ausruestung === 'Batterie' ? 8 : 0),
        verbleibendeBatteriezeit: trupp.verbleibendeBatteriezeit || (trupp.ausruestung === 'Batterie' ? 8 : 0),
        benoetigtBatterie: trupp.benoetigtBatterie || false,
    }));

    // Main planning loop
    const timeStepMs = 15 * 60 * 1000;
    const segmentStates = new Map(); // Map<segmentKey, { trupp: Trupp, endTime: Date, covered: boolean }>

    // Initialize all segments as not covered
    for (const segment of pathWithEdges) {
        const segmentKey = `${segment.source}-${segment.target}`;
        segmentStates.set(segmentKey, { trupp: null, endTime: null, covered: false });
    }

    while (currentTime < endDate) {
        let nextEventTime = endDate.getTime();
        let activityThisIteration = false; // Track if any mission was planned or battery supplied

        // Identify segments that need coverage
        const segmentsToCover = pathWithEdges.filter(segment => {
            const segmentKey = `${segment.source}-${segment.target}`;
            const state = segmentStates.get(segmentKey);
            return !state.covered || state.endTime <= currentTime; // Needs coverage if not covered or current mission ended
        });

        // Try to cover segments
        for (const segment of segmentsToCover) {
            const segmentKey = `${segment.source}-${segment.target}`;
            const distance = parseInt(segment.edge.label.replace('km', ''));
            const risk = segment.edge.risk;

            const candidateTrupps = findSuitableTrupps(segment, currentTime, workingTrupps, distance, risk);

            let candidateTrupps = findSuitableTrupps(segment, currentTime, workingTrupps, distance, risk);

            // If no suitable truup found, try to generate a new one
            if (candidateTrupps.length === 0) {
                console.log(`No suitable truup found for segment ${segmentKey}. Attempting to generate a new one.`);
                const newTrupp = generateNewTrupp(segment.source, currentTime, {
                    type: 'None', // Default type, can be refined based on segment needs
                    minStaerke: risk * 2, // Based on segment risk
                    maxStaerke: risk * 3, // Based on segment risk
                    minReichweite: Math.min(distance, 25), // Match segment distance, capped at 25
                    maxReichweite: 25 // Capped at 25
                });
                workingTrupps.push(newTrupp);
                addTrupp(newTrupp); // Add to appData
                activityThisIteration = true; // Generating a truup is an activity

                // Re-evaluate candidate truups with the newly generated one
                candidateTrupps = findSuitableTrupps(segment, currentTime, workingTrupps, distance, risk);
            }

            if (candidateTrupps.length > 0) {
                const { trupp, potentialStartTime } = candidateTrupps[0];
                const result = createRelayMission(trupp, segment, potentialStartTime, plannedMissions, currentEinsatzId);

                if (result.success) {
                    currentEinsatzId = result.currentEinsatzId;
                    nextEventTime = Math.min(nextEventTime, result.endTime.getTime());
                    activityThisIteration = true;

                    segmentStates.set(segmentKey, {
                        trupp: trupp,
                        endTime: result.endTime,
                        covered: true // Mark as covered
                    });

                    bridgeSegments.push({
                        source: segment.source,
                        target: segment.target,
                        truppname: trupp.name,
                        startzeit: potentialStartTime.toISOString().slice(0, 16),
                        endzeit: result.endTime.toISOString().slice(0, 16)
                    });
                }
            }
        }

        // Handle battery supply needs
        const technikTruppsNeedingSupply = workingTrupps.filter(t =>
            t.ausruestung === 'Batterie' &&
            t.benoetigtBatterie &&
            t.naechsteVerfuegbarkeit <= currentTime
        );

        for (const technikTrupp of technikTruppsNeedingSupply) {
            const supplyResult = handleBatterySupplyMission(technikTrupp, workingTrupps, currentTime, plannedMissions, currentEinsatzId);
            if (supplyResult.success) {
                currentEinsatzId = supplyResult.currentEinsatzId;
                activityThisIteration = true;
            }
        }

        // Advance time
        if (!activityThisIteration) {
            // If no activity, find the next earliest event (trupp availability or end of a mission)
            let earliestNextEvent = endDate.getTime();

            // Check truup availability
            for (const trupp of workingTrupps) {
                if (trupp.naechsteVerfuegbarkeit.getTime() > currentTime.getTime()) {
                    earliestNextEvent = Math.min(earliestNextEvent, trupp.naechsteVerfuegbarkeit.getTime());
                }
            }

            // Check end of current segment missions
            for (const [key, state] of segmentStates.entries()) {
                if (state.covered && state.endTime.getTime() > currentTime.getTime()) {
                    earliestNextEvent = Math.min(earliestNextEvent, state.endTime.getTime());
                }
            }

            if (earliestNextEvent === endDate.getTime()) { // No future events found, advance by timeStepMs
                currentTime = new Date(currentTime.getTime() + timeStepMs);
            } else {
                currentTime = new Date(earliestNextEvent);
            }
        } else {
            // If activity, advance time to the earliest next event that was planned or truup became available
            currentTime = new Date(nextEventTime);
        }
    }

    // Sort chronologically
    plannedMissions.sort((a, b) => new Date(a.startzeit).getTime() - new Date(b.startzeit).getTime());
    bridgeSegments.sort((a, b) => new Date(a.startzeit).getTime() - new Date(b.startzeit).getTime());

    return {
        missions: plannedMissions,
        bridgeSegments: bridgeSegments
    };
}

function generateMissionPlan() {
    console.log("generateMissionPlan called - generating 18h communication bridge plan");
    const startNode = "Mahlwinkel";
    const endNode = "Berlin-Alexanderplatz";
    const startTime = "2025-08-26T04:00";
    const endTime = "2025-08-26T22:00";

    return generateCommunicationBridgePlan(startNode, endNode, startTime, endTime);
}

// Export everything needed by other modules
export { generateMissionPlan, generateCommunicationBridgePlan, findPath };
