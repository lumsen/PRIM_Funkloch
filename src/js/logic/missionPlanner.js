import { graphData } from '../data/graphData.js';
import { getTruppsData, addTrupp } from '../data/appData.js';

// Dijkstra's algorithm to find the shortest path distance between two nodes
function getShortestPathDistance(startNodeLabel, endNodeLabel) {
    const distances = new Map();
    const previous = new Map();
    const pq = new PriorityQueue(); // Min-priority queue

    // Initialize distances
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

        const currentNode = graphData.nodes.find(node => node.label === currentLabel);

        // Find neighbors
        const neighbors = graphData.edges.filter(edge =>
            graphData.nodes[edge.source].label === currentLabel || graphData.nodes[edge.target].label === currentLabel
        );

        for (const edge of neighbors) {
            const neighborNode = graphData.nodes[edge.source].label === currentLabel ? graphData.nodes[edge.target] : graphData.nodes[edge.source];
            const weight = parseInt(edge.label.replace('km', ''));
            const newDistance = currentDistance + weight;

            if (newDistance < distances.get(neighborNode.label)) {
                distances.set(neighborNode.label, newDistance);
                previous.set(neighborNode.label, currentLabel);
                pq.enqueue(neighborNode.label, newDistance);
            }
        }
    }

    return distances.get(endNodeLabel);
}

// Simple Priority Queue implementation (min-heap)
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

export function findPath(startNodeLabel, endNodeLabel) {
    console.log(`Finding path from ${startNodeLabel} to ${endNodeLabel}`);
    const queue = [];
    const visited = new Set();
    const parentMap = new Map(); // To reconstruct the path
    const edgeMap = new Map(); // To store the edge used to reach a node

    // Find start and end nodes by label
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
            // Path found, reconstruct it with edges
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
            console.log("Path found:", path);
            return path;
        }

        // Find neighbors using labels
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

            if (connectedNode) {
                if (!visited.has(connectedNode.label)) {
                    visited.add(connectedNode.label);
                    parentMap.set(connectedNode.label, currentNode.label);
                    edgeMap.set(`${currentNode.label}-${connectedNode.label}`, currentEdge);
                    queue.push(connectedNode);
                }
            }
        }
    }

    console.log("No path found.");
    return null; // No path found
}

export function generateCommunicationBridgePlan(startNodeLabel, endNodeLabel, startTimeStr, endTimeStr) {
    console.log(`Generating communication bridge plan from ${startNodeLabel} to ${endNodeLabel} between ${startTimeStr} and ${endTimeStr}`);

    const pathWithEdges = findPath(startNodeLabel, endNodeLabel);
    if (!pathWithEdges) {
        console.warn("Could not find a path for communication bridge.");
        return [];
    }

    const plannedMissions = [];
    let currentEinsatzId = 200;

    const startDate = new Date(startTimeStr);
    const endDate = new Date(endTimeStr);
    let currentTime = new Date(startDate);

    const workingTrupps = getTruppsData().map(trupp => ({
        ...trupp,
        naechsteVerfuegbarkeit: trupp.naechsteVerfuegbarkeit || new Date(startDate),
        einsatzzeitGesamt: 0,
        einsatzzeitMax: trupp.einsatzzeitMax || (trupp.ausruestung === 'Batterie' ? 8 : 0), // Techniktrupps have 'Batterie' as ausruestung
        verbleibendeBatteriezeit: trupp.verbleibendeBatteriezeit || (trupp.ausruestung === 'Batterie' ? 8 : 0),
        benoetigtBatterie: trupp.benoetigtBatterie || false,
    }));

    let generatedTruppCounter = 1;

    const timeStepMs = 15 * 60 * 1000; // 15 minutes
    const coveredSegments = new Map(); // Map<segmentKey, {trupp: truppObject, endTime: Date}>

    // --- Initial Techniktrupp Deployment ---
    // Place Techniktrupps at critical points along the path, especially for longer segments
    const techniktrupps = workingTrupps.filter(t => t.ausruestung === 'Batterie');
    let techniktruppIndex = 0;

    for (let i = 0; i < pathWithEdges.length; i++) {
        const segment = pathWithEdges[i];
        const distance = parseInt(segment.edge.label.replace('km', ''));

        // Deploy Techniktrupp if segment is long or if it's a critical junction
        if (distance > 30 && techniktruppIndex < techniktrupps.length) {
            const trupp = techniktrupps[techniktruppIndex];
            trupp.aktuellerEinsatzpunkt = segment.source; // Deploy at the source of the long segment
            plannedMissions.push({
                id: currentEinsatzId++,
                truppname: trupp.name,
                startzeit: startDate.toISOString().slice(0, 16),
                startort: trupp.aktuellerEinsatzpunkt,
                endort: trupp.aktuellerEinsatzpunkt,
                endzeit: startDate.toISOString().slice(0, 16),
                type: "Initial Deployment"
            });
            techniktruppIndex++;
        }
    }

    // Ensure all Techniktrupps are deployed, if not, deploy them randomly
    while (techniktruppIndex < techniktrupps.length) {
        const trupp = techniktrupps[techniktruppIndex];
        trupp.aktuellerEinsatzpunkt = graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label;
        plannedMissions.push({
            id: currentEinsatzId++,
            truppname: trupp.name,
            startzeit: startDate.toISOString().slice(0, 16),
            startort: trupp.aktuellerEinsatzpunkt,
            endort: trupp.aktuellerEinsatzpunkt,
            endzeit: startDate.toISOString().slice(0, 16),
            type: "Initial Deployment (Random)"
        });
        techniktruppIndex++;
    }


    while (currentTime < endDate) {
        for (const segment of pathWithEdges) {
            const startSegmentNodeLabel = segment.source;
            const endSegmentNodeLabel = segment.target;
            const segmentKey = `${startSegmentNodeLabel}-${endSegmentNodeLabel}`;
            const distance = parseInt(segment.edge.label.replace('km', ''));
            const risk = segment.edge.risk;

            const currentCoverage = coveredSegments.get(segmentKey);
            if (currentCoverage && currentCoverage.endTime > currentTime) {
                continue;
            }

            let assignedTrupp = null;
            let supplyTrupp = null;
            let technikTruppNeedingSupply = null;
            // travelTimeMs is now handled by currentSegmentTravelTimeMs within the relay phase.

            // --- Phase 1: Handle Supply Needs for Techniktrupps ---
            technikTruppNeedingSupply = workingTrupps.find(trupp =>
                trupp.ausruestung === 'Batterie' && trupp.benoetigtBatterie && trupp.aktuellerEinsatzpunkt === startSegmentNodeLabel
            );

            if (technikTruppNeedingSupply) {
                supplyTrupp = workingTrupps.find(trupp =>
                    trupp.ausruestung !== 'Batterie' && trupp.naechsteVerfuegbarkeit <= currentTime && trupp.geschwindigkeit > 0
                );

                if (supplyTrupp) {
                    let travelTimeMsToSupply = 0;
                    if (supplyTrupp.aktuellerEinsatzpunkt !== technikTruppNeedingSupply.aktuellerEinsatzpunkt) {
                        const travelDistance = getShortestPathDistance(supplyTrupp.aktuellerEinsatzpunkt, technikTruppNeedingSupply.aktuellerEinsatzpunkt);
                        if (travelDistance === Infinity) {
                            console.warn(`Supply Trupp ${supplyTrupp.name} cannot reach ${technikTruppNeedingSupply.aktuellerEinsatzpunkt}. Skipping supply mission.`);
                            supplyTrupp = null;
                        } else {
                            const speedKmPerMs = supplyTrupp.geschwindigkeit / (60 * 60 * 1000);
                            travelTimeMsToSupply = travelDistance / speedKmPerMs;

                            plannedMissions.push({
                                id: currentEinsatzId++,
                                truppname: supplyTrupp.name,
                                startzeit: currentTime.toISOString().slice(0, 16),
                                startort: supplyTrupp.aktuellerEinsatzpunkt,
                                endort: technikTruppNeedingSupply.aktuellerEinsatzpunkt,
                                endzeit: new Date(currentTime.getTime() + travelTimeMsToSupply).toISOString().slice(0, 16),
                                type: "Bewegung (Supply)"
                            });
                            supplyTrupp.aktuellerEinsatzpunkt = technikTruppNeedingSupply.aktuellerEinsatzpunkt;
                        }
                    }

                    if (supplyTrupp) {
                        const supplyStartTime = new Date(Math.max(currentTime.getTime(), supplyTrupp.naechsteVerfuegbarkeit.getTime() + travelTimeMsToSupply));
                        const supplyDurationMs = 30 * 60 * 1000;
                        const supplyEndTime = new Date(supplyStartTime.getTime() + supplyDurationMs);

                        if (supplyEndTime < endDate) {
                            plannedMissions.push({
                                id: currentEinsatzId++,
                                truppname: supplyTrupp.name,
                                startzeit: supplyStartTime.toISOString().slice(0, 16),
                                startort: technikTruppNeedingSupply.aktuellerEinsatzpunkt,
                                endort: technikTruppNeedingSupply.aktuellerEinsatzpunkt,
                                endzeit: supplyEndTime.toISOString().slice(0, 16),
                                type: "Supply"
                            });

                            technikTruppNeedingSupply.verbleibendeBatteriezeit = technikTruppNeedingSupply.einsatzzeitMax;
                            technikTruppNeedingSupply.benoetigtBatterie = false;
                            technikTruppNeedingSupply.naechsteVerfuegbarkeit = supplyEndTime;

                            supplyTrupp.naechsteVerfuegbarkeit = new Date(supplyEndTime.getTime() + (supplyTrupp.ruhezeit * 60 * 60 * 1000));
                        }
                    }
                }
            }

            // --- Phase 2: Handle Relay Needs ---
            if (!coveredSegments.get(segmentKey) || coveredSegments.get(segmentKey).endTime <= currentTime) {
                workingTrupps.sort((a, b) => a.naechsteVerfuegbarkeit.getTime() - b.naechsteVerfuegbarkeit.getTime());

                const candidateTrupps = [];
                for (const trupp of workingTrupps) {
                    // Calculate potential travel time to the segment start
                    let potentialTravelTimeMs = 0;
                    if (trupp.aktuellerEinsatzpunkt !== startSegmentNodeLabel) {
                        const travelDistance = getShortestPathDistance(trupp.aktuellerEinsatzpunkt, startSegmentNodeLabel);
                        if (travelDistance === Infinity) {
                            continue; // Trupp cannot reach this segment
                        }
                        const speedKmPerMs = trupp.geschwindigkeit / (60 * 60 * 1000);
                        potentialTravelTimeMs = travelDistance / speedKmPerMs;
                    }

                    const potentialAvailabilityTime = new Date(Math.max(currentTime.getTime(), trupp.naechsteVerfuegbarkeit.getTime() + potentialTravelTimeMs));

                    if (potentialAvailabilityTime >= endDate) {
                        continue; // Trupp won't be available in time
                    }

                    // Techniktrupps for stationary relay
                    if (trupp.ausruestung === 'Batterie' && !trupp.benoetigtBatterie && trupp.aktuellerEinsatzpunkt === startSegmentNodeLabel && trupp.naechsteVerfuegbarkeit <= currentTime) {
                        candidateTrupps.push({ trupp, potentialTravelTimeMs, potentialAvailabilityTime, type: 'Techniktrupp' });
                    }
                    // Regular trupps for mobile relay
                    else if (trupp.ausruestung !== 'Batterie' && trupp.geschwindigkeit > 0 && trupp.reichweite >= distance) {
                        // Check Truppenstärke and Ausrüstung requirements
                        const minStaerke = risk * 2;
                        if (trupp.staerke < minStaerke) continue;

                        if (risk >= 4 && trupp.ausruestung !== 'CombatMedic' && trupp.ausruestung !== 'Überwachung') continue;
                        if (risk === 5 && trupp.ausruestung !== 'Veteran') continue;

                        candidateTrupps.push({ trupp, potentialTravelTimeMs, potentialAvailabilityTime, type: 'Regular Trupp' });
                    }
                }

                // Sort candidates: Techniktrupps first, then by earliest availability, then by shortest travel
                candidateTrupps.sort((a, b) => {
                    if (a.type === 'Techniktrupp' && b.type !== 'Techniktrupp') return -1;
                    if (a.type !== 'Techniktrupp' && b.type === 'Techniktrupp') return 1;
                    if (a.potentialAvailabilityTime.getTime() !== b.potentialAvailabilityTime.getTime()) {
                        return a.potentialAvailabilityTime.getTime() - b.potentialAvailabilityTime.getTime();
                    }
                    return a.potentialTravelTimeMs - b.potentialTravelTimeMs;
                });

                let currentSegmentTravelTimeMs = 0; // Declare local variable for this segment's travel time

                if (candidateTrupps.length > 0) {
                    assignedTrupp = candidateTrupps[0].trupp;
                    currentSegmentTravelTimeMs = candidateTrupps[0].potentialTravelTimeMs;
                }

                if (!assignedTrupp) {
                    // If no suitable trupp found, generate a new one as a last resort
                    const einsatzdauer = 1 + Math.floor(Math.random() * 5);
                    let ruhezeit;
                    if (einsatzdauer <= 2) {
                        ruhezeit = 1 + Math.floor(Math.random() * 3);
                    } else {
                        ruhezeit = 3 + Math.floor(Math.random() * 3);
                    }
                    const equipmentOptions = ['CombatMedic', 'Überwachung', 'Veteran', 'None', 'None', 'None'];
                    const ausruestung = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)];

                    const newTrupp = {
                        id: `gen-Trupp-${generatedTruppCounter++}`,
                        name: `Generated Trupp ${generatedTruppCounter - 1}`,
                        staerke: 4 + Math.floor(Math.random() * 7),
                        einsatzdauer: einsatzdauer,
                        reichweite: 20 + Math.floor(Math.random() * 41),
                        geschwindigkeit: 4 + Math.floor(Math.random() * 5),
                        ruhezeit: ruhezeit,
                        ausruestung: ausruestung,
                        aktuellerEinsatzpunkt: startSegmentNodeLabel,
                        naechsteVerfuegbarkeit: new Date(currentTime)
                    };

                    workingTrupps.push(newTrupp);
                    addTrupp(newTrupp);
                    assignedTrupp = newTrupp;
                    console.log("Generated new Trupp for Relay:", newTrupp.name);
                    currentSegmentTravelTimeMs = 0; // New trupp starts at the segment, no travel needed initially
                }

                // Now, if assignedTrupp needs to move, record it as a "Bewegung" mission
                if (currentSegmentTravelTimeMs > 0) {
                    plannedMissions.push({
                        id: currentEinsatzId++,
                        truppname: assignedTrupp.name,
                        startzeit: currentTime.toISOString().slice(0, 16),
                        startort: assignedTrupp.aktuellerEinsatzpunkt,
                        endort: startSegmentNodeLabel,
                        endzeit: new Date(currentTime.getTime() + currentSegmentTravelTimeMs).toISOString().slice(0, 16),
                        type: "Bewegung"
                    });
                    assignedTrupp.aktuellerEinsatzpunkt = startSegmentNodeLabel;
                }

                // Determine required operational time for this segment based on assigned trupp's einsatzdauer
                const requiredOperationalHours = assignedTrupp.einsatzdauer || 1; // Use trupp's einsatzdauer, default to 1 hour
                const segmentDurationMs = requiredOperationalHours * 60 * 60 * 1000;

                const actualSegmentStartTime = new Date(Math.max(currentTime.getTime(), assignedTrupp.naechsteVerfuegbarkeit.getTime() + currentSegmentTravelTimeMs));

                if (actualSegmentStartTime >= endDate) {
                    console.warn("Not enough time to start next segment within mission window.");
                    break;
                }

                const segmentEndTime = new Date(actualSegmentStartTime.getTime() + segmentDurationMs);

                if (segmentEndTime > endDate) {
                    console.warn(`Communication bridge exceeds end time. Stopping at segment ${startSegmentNodeLabel} to ${endSegmentNodeLabel}.`);
                    break;
                }

                plannedMissions.push({
                    id: currentEinsatzId++,
                    truppname: assignedTrupp.name,
                    startzeit: actualSegmentStartTime.toISOString().slice(0, 16),
                    startort: startSegmentNodeLabel,
                    endort: endSegmentNodeLabel,
                    endzeit: segmentEndTime.toISOString().slice(0, 16),
                    type: "Relay"
                });

                if (assignedTrupp.ausruestung === 'Batterie') {
                    assignedTrupp.verbleibendeBatteriezeit -= requiredOperationalHours;
                    if (assignedTrupp.verbleibendeBatteriezeit <= 0) {
                        assignedTrupp.benoetigtBatterie = true;
                        assignedTrupp.naechsteVerfuegbarkeit = new Date(segmentEndTime.getTime() + (1 * 60 * 60 * 1000));
                    } else {
                        assignedTrupp.naechsteVerfuegbarkeit = segmentEndTime;
                    }
                } else {
                    assignedTrupp.naechsteVerfuegbarkeit = new Date(segmentEndTime.getTime() + (assignedTrupp.ruhezeit * 60 * 60 * 1000));
                }

                coveredSegments.set(segmentKey, { trupp: assignedTrupp, endTime: segmentEndTime });
            }
        }

        // After attempting to cover all segments for the current time, find the next critical time point
        let nextCriticalTime = endDate; // Default to end of mission

        // Find the earliest time a segment's coverage expires or a trupp becomes available
        for (const segment of pathWithEdges) {
            const segmentKey = `${segment.source}-${segment.target}`;
            const coverage = coveredSegments.get(segmentKey);
            if (coverage && coverage.endTime > currentTime && coverage.endTime < nextCriticalTime) {
                nextCriticalTime = coverage.endTime;
            }
        }

        for (const trupp of workingTrupps) {
            if (trupp.naechsteVerfuegbarkeit > currentTime && trupp.naechsteVerfuegbarkeit < nextCriticalTime) {
                nextCriticalTime = trupp.naechsteVerfuegbarkeit;
            }
        }

        // Advance current time to the next critical point, or by timeStepMs if no immediate critical point
        if (nextCriticalTime > currentTime) {
            currentTime = new Date(Math.min(nextCriticalTime.getTime(), currentTime.getTime() + timeStepMs));
        } else {
            // If no future critical time found, or if it's in the past, just advance by timeStepMs
            currentTime = new Date(currentTime.getTime() + timeStepMs);
        }

        // Ensure currentTime does not exceed endDate
        if (currentTime > endDate) {
            currentTime = endDate;
        }
    }

    console.log("Generated Communication Bridge Plan:", plannedMissions);
    return plannedMissions;
}

export function generateMissionPlan() {
    console.log("generateMissionPlan called - generating 18h communication bridge plan");
    // Define a start and end node for the 18h coverage
    const startNode = "Mahlwinkel";
    const endNode = "Berlin-Alexanderplatz";
    const startTime = "2025-08-26T04:00";
    const endTime = "2025-08-26T22:00"; // 18 hours later

    return generateCommunicationBridgePlan(startNode, endNode, startTime, endTime);
}
