import { graphData } from './graphData.js';

function formatCounter() {
    return String(Math.floor(Math.random() * 100)).padStart(2, '0');
}

export function generateTrupps() {
    let generatedTrupps = [];

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

    // Generiert Techniktrupps (BeROp-Trupps)
    for (let i = 0; i < numTechniktrupps; i++) {
        const newTrupp = {
            id: Math.floor(Math.random() * 100000), // Eindeutige ID des Trupps
            name: `BeROp-${formatCounter()}`, // Name des Techniktrupps (BeROp-[XX])
            staerke: 3, // Stärke des Trupps (festgelegt für Techniktrupps)
            reichweite: 50, // Maximale Reichweite für Relais-Einsätze in km
            geschwindigkeit: 0, // Bewegungsgeschwindigkeit in km/h (statische Truppen)
            ruhezeit: 0, // Ruhezeit in Stunden (Techniktrupps haben keine klassische Ruhezeit)
            ausruestung: 'Batterie', // Spezielle Ausrüstung (z.B. 'Batterie' für Techniktrupps)
            einsatzzeitMax: 8, // Maximale Einsatzzeit pro Batterieladung in Stunden
            verbleibendeBatteriezeit: 8, // Verbleibende Batterielaufzeit in Stunden
            benoetigtBatterie: false, // Flag, ob der Trupp eine Batterieladung benötigt
            aktuellerEinsatzpunkt: techniktruppLocations[i] || graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label, // Aktueller Standort des Trupps
            naechsteVerfuegbarkeit: new Date("2025-08-26T04:00"), // Zeitpunkt, ab dem der Trupp wieder verfügbar ist
        };
        generatedTrupps.push(newTrupp);
    }

    // Generiert reguläre Trupps (WD-, BER-, BAST-Trupps)
    for (let i = 0; i < numRegularTrupps; i++) {
        const einsatzdauer = 1 + Math.floor(Math.random() * 5); // Einsatzlänge zwischen 1-5 Stunden
        let ruhezeit;
        if (einsatzdauer <= 2) {
            ruhezeit = 1 + Math.floor(Math.random() * 3); // Ruhezeit zwischen 1-3 Stunden
        } else {
            ruhezeit = 3 + Math.floor(Math.random() * 3); // Ruhezeit zwischen 3-5 Stunden
        }

        const equipmentOptions = ['CombatMedic', 'Überwachung', 'Veteran', 'None', 'None', 'None']; // Optionen für Ausrüstung
        const ausruestung = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)]; // Zufällige Ausrüstung

        const prefixes = ['WD-', 'BER-', 'BAST-'];
        const truppNamePrefix = prefixes[Math.floor(Math.random() * prefixes.length)]; // Zufälliges Präfix für den Truppnamen

        const newTrupp = {
            id: Math.floor(Math.random() * 100000), // Eindeutige ID des Trupps
            name: `${truppNamePrefix}${formatCounter()}`, // Name des Trupps (WD/BER/BAST-[XX])
            staerke: 4 + Math.floor(Math.random() * 7), // Stärke des Trupps (zwischen 4 und 10)
            einsatzdauer: einsatzdauer, // Dauer eines Einsatzes in Stunden
            reichweite: 25, // Maximale Reichweite in km (festgelegt auf 25 km)
            geschwindigkeit: 4 + Math.floor(Math.random() * 5), // Bewegungsgeschwindigkeit in km/h (zwischen 4 und 8 km/h)
            ruhezeit: ruhezeit, // Ruhezeit in Stunden nach einem Einsatz
            ausruestung: ausruestung, // Spezielle Ausrüstung (z.B. 'CombatMedic', 'Überwachung', 'Veteran')
            aktuellerEinsatzpunkt: graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label, // Aktueller Standort des Trupps
            naechsteVerfuegbarkeit: new Date("2025-08-26T04:00"), // Zeitpunkt, ab dem der Trupp wieder verfügbar ist
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

// Initial Einsaetze data will be generated dynamically
let _einsaetzeData = []; // Use a private variable for the mutable array
let _bridgeSegments = []; // New: Store bridge segments
let _nextEinsatzId = 1; // Start ID from 1


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

export function getBridgeSegments() {
    return _bridgeSegments;
}

export function setEinsaetzeData(newEinsaetze, newBridgeSegments = []) {
    _einsaetzeData = newEinsaetze;
    _bridgeSegments = newBridgeSegments;
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

    // Regenerate mission plan and bridge segments
    const { missions, bridgeSegments } = generateMissionPlan();
    _einsaetzeData = [...missions];
    _bridgeSegments = [...bridgeSegments];
    _nextEinsatzId = _einsaetzeData.length > 0 ? Math.max(..._einsaetzeData.map(e => e.id)) + 1 : 1;
}
