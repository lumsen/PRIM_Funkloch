import { LOCAL_STORAGE_KEY_GRAPH, LOCAL_STORAGE_KEY_TRUPPS, LOCAL_STORAGE_KEY_EINSAETZE } from '../constants.js';
import { graphData } from '../data/graphData.js';
import { getTruppsData, addTrupp, getEinsaetzeData, addEinsatz, resetAppData, setEinsaetzeData } from '../data/appData.js';
import { redrawEverything, saveData } from '../utils/helpers.js';
import { renderTruppsTable } from '../ui/trupps.js';
import { renderEinsaetzeTable } from '../ui/einsaetze.js';
import { generateMissionPlan } from '../logic/missionPlanner.js';

export function initializeEventListeners() {
  d3.select('#reset-button').on('click', () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_GRAPH);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRUPPS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_EINSAETZE);
    resetAppData(); // Resets both trupps and einsaetze to initial generated state
    redrawEverything(); // Redraws graph and tables
    saveData(); // Save the reset state
  });

  d3.select('#export-button').on('click', () => {
    const dataToExport = JSON.stringify({
      graphEdges: graphData.edges,
      truppsData: getTruppsData(),
      einsaetzeData: getEinsaetzeData()
    }, null, 4);
    navigator.clipboard.writeText(dataToExport).then(() => {
      alert('Aktuelle Daten in die Zwischenablage kopiert!');
    }).catch(err => {
      console.error('Fehler beim Kopieren in die Zwischenablage:', err);
      alert('Fehler beim Kopieren in die Zwischenablage. Bitte Konsole prüfen.');
    });
  });

  d3.select('#add-trupp-form').on('submit', function(event) {
    event.preventDefault();

    const newTrupp = {
      name: d3.select('#trupp-name').node().value,
      staerke: +d3.select('#trupp-staerke').node().value,
      reichweite: +d3.select('#trupp-reichweite').node().value,
      geschwindigkeit: +d3.select('#trupp-geschwindigkeit').node().value,
      ruhezeit: +d3.select('#trupp-ruhezeit').node().value,
      ausruestung: d3.select('#trupp-ausruestung').node().value,
      aktuellerEinsatzpunkt: graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].label, // Random starting node
      naechsteVerfuegbarkeit: new Date(), // Available now
      einsatzzeitMax: (d3.select('#trupp-ausruestung').node().value === 'Technik' ? 8 : 0),
      verbleibendeBatteriezeit: (d3.select('#trupp-ausruestung').node().value === 'Technik' ? 8 : 0),
      benoetigtBatterie: false,
    };

    addTrupp(newTrupp);
    renderTruppsTable();
    saveData(); // Save after adding trupp

    this.reset(); // Clear form fields
  });

  d3.select('#add-einsatz-form').on('submit', function(event) {
    event.preventDefault();

    const newEinsatz = {
      truppname: d3.select('#einsatz-truppname').node().value,
      startzeit: d3.select('#einsatz-startzeit').node().value,
      startort: d3.select('#einsatz-startort').node().value,
      endort: d3.select('#einsatz-endort').node().value,
      endzeit: d3.select('#einsatz-endzeit').node().value,
      type: 'Manuell' // Default type for manually added einsaetze
    };

    addEinsatz(newEinsatz);
    renderEinsaetzeTable();
    saveData(); // Save after adding einsatz

    this.reset();
  });

  d3.select('#generate-einsaetze-button').on('click', () => {
    console.log('Generate Einsätze button clicked.');
        
    // Clear existing einsaetze
    setEinsaetzeData([]);
        
    // Call the new communication bridge planning function
    const newGeneratedEinsaetze = generateMissionPlan(); // generateMissionPlan already calls generateCommunicationBridgePlan
    setEinsaetzeData(newGeneratedEinsaetze);
        
    console.log('einsaetzeData after update:', getEinsaetzeData());
    renderEinsaetzeTable();
    saveData(); // Save the newly generated einsaetze
  });
}
