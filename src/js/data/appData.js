import { graphData } from './graphData.js';

export function generateTrupps() {
    let generatedTrupps = [];
    let truppIdCounter = 1;

    const numTechniktrupps = 5; // 5 fixed Techniktrupps
    const numRegularTrupps = 5; // Start with a smaller number to encourage minimal generation

    // Identify nodes with connections > 25km
    const longDistanceNodes = new Set();
    graphData.edges.forEach(edge => {
        const distance = parseInt(edge.label.replace('km', ''));
        if (distance > 25) {
            longDistanceNodes.add(graphData.nodes[edge.source].label);
            longDistanceNodes.add(graphData.nodes[edge.target].label);
        }
    });

    const techniktruppLocations = Array.from(longDistanceNodes).slice(0, numTechniktrupps);

    // Generate Techniktrupps
    for (let i = 0; i < numTechniktrupps; i++) {
        const newTrupp = {
            id: truppIdCounter++,
            name: `Techniktrupp ${i + 1}`,
            staerke: 3, // Fixed strength for Techniktrupps
            reichweite: 0, // Stationary for relay
            geschwindigkeit: 5, // Movement speed for deployment
            ruhezeit: 0, // Techniktrupps don't have rest time in the same way
            ausruestung: 'Batterie', // Techniktrupps have Batterie equipment
            einsatzzeitMax: 8, // Operational time per battery
            verbleibendeBatteriezeit: 8, // Initial battery life
            benoetigtBatterie: false,
            aktuellerEinsatzpunkt: techniktruppLocations[i] || graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label, // Assign specific location or random if not enough
            naechsteVerfuegbarkeit: new Date("2025-08-26T04:00"),
        };
        generatedTrupps.push(newTrupp);
    }

    // Generate Regular Trupps
    for (let i = 0; i < numRegularTrupps; i++) {
        const einsatzdauer = 1 + Math.floor(Math.random() * 5); // Einsatzlänge between 1-5 hours
        let ruhezeit;
        if (einsatzdauer <= 2) {
            ruhezeit = 1 + Math.floor(Math.random() * 3); // 1-3 hours
        } else {
            ruhezeit = 3 + Math.floor(Math.random() * 3); // 3-5 hours
        }

        const equipmentOptions = ['CombatMedic', 'Überwachung', 'Veteran', 'None', 'None', 'None']; // Higher chance for None
        const ausruestung = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)];

        const newTrupp = {
            id: truppIdCounter++,
            name: `Trupp ${i + 1}`,
            staerke: 4 + Math.floor(Math.random() * 7), // Strength between 4 and 10 (min 2x risk level 5 = 10)
            einsatzdauer: einsatzdauer, // Operational duration
            reichweite: 20 + Math.floor(Math.random() * 41), // Range between 20 and 60 km
            geschwindigkeit: 4 + Math.floor(Math.random() * 5), // Speed between 4 and 8 km/h
            ruhezeit: ruhezeit, // Rest time based on einsatzdauer
            ausruestung: ausruestung,
            aktuellerEinsatzpunkt: graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label,
            naechsteVerfuegbarkeit: new Date("2025-08-26T04:00"),
        };
        generatedTrupps.push(newTrupp);
    }

    return generatedTrupps;
}

const initialTruppsData = generateTrupps();
let _truppsData = [...initialTruppsData]; // Use a private variable for the mutable array
let _nextTruppId = _truppsData.length > 0 ? Math.max(..._truppsData.map(t => t.id)) + 1 : 1;

// Initial Einsaetze data will be generated dynamically
import { generateMissionPlan } from '../logic/missionPlanner.js';

const initialEinsaetzeData = generateMissionPlan(); // Generate initial mission plan
let _einsaetzeData = [...initialEinsaetzeData]; // Use a private variable for the mutable array
let _nextEinsatzId = _einsaetzeData.length > 0 ? Math.max(..._einsaetzeData.map(e => e.id)) + 1 : 1;


// Trupps CRUD operations
export function getTruppsData() {
    return _truppsData;
}

export function addTrupp(newTrupp) {
    newTrupp.id = _nextTruppId++;
    _truppsData.push(newTrupp);
}

export function deleteTrupp(id) {
    _truppsData = _truppsData.filter(trupp => trupp.id !== id);
}

export function updateTrupp(updatedTrupp) {
    const index = _truppsData.findIndex(trupp => trupp.id === updatedTrupp.id);
    if (index !== -1) {
        _truppsData[index] = { ..._truppsData[index], ...updatedTrupp };
    }
}

// Einsätze CRUD operations
export function getEinsaetzeData() {
    return _einsaetzeData;
}

export function addEinsatz(newEinsatz) {
    newEinsatz.id = _nextEinsatzId++;
    _einsaetzeData.push(newEinsatz);
}

export function deleteEinsatz(id) {
    _einsaetzeData = _einsaetzeData.filter(einsatz => einsatz.id !== id);
}

export function updateEinsatz(updatedEinsatz) {
    const index = _einsaetzeData.findIndex(einsatz => einsatz.id === updatedEinsatz.id);
    if (index !== -1) {
        _einsaetzeData[index] = { ..._einsaetzeData[index], ...updatedEinsatz };
    }
}

export function setEinsaetzeData(newEinsaetze) {
    _einsaetzeData = newEinsaetze;
    _nextEinsatzId = _einsaetzeData.length > 0 ? Math.max(..._einsaetzeData.map(e => e.id)) + 1 : 1;
}

export function setTruppsData(newTrupps) {
    _truppsData = newTrupps;
    _nextTruppId = _truppsData.length > 0 ? Math.max(..._truppsData.map(t => t.id)) + 1 : 1;
}

// Reset function
export function resetAppData() {
    // Re-generate initial data
    const regeneratedTrupps = generateTrupps();
    _truppsData = [...regeneratedTrupps];
    _nextTruppId = _truppsData.length > 0 ? Math.max(..._truppsData.map(t => t.id)) + 1 : 1;

    const regeneratedEinsaetze = generateMissionPlan();
    _einsaetzeData = [...regeneratedEinsaetze];
    _nextEinsatzId = _einsaetzeData.length > 0 ? Math.max(..._einsaetzeData.map(e => e.id)) + 1 : 1;
}
