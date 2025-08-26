import { loadData } from './utils/helpers.js';
import { initializeGraph } from './ui/graph.js';
import { initializeEventListeners } from './event-listeners/listeners.js';
import { renderTruppsTable } from './ui/trupps.js';
import { renderEinsaetzeTable } from './ui/einsaetze.js';
import { graphData } from './data/graphData.js';
import { getTruppsData, getEinsaetzeData, setEinsaetzeData } from './data/appData.js';
import { generateMissionPlan } from './logic/missionPlanner.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired.');
    loadData();
    console.log('graphData.edges after loadData:', graphData.edges);
    console.log('truppsData after loadData:', getTruppsData());
    console.log('einsaetzeData after loadData:', getEinsaetzeData());

    // Generate initial mission plan if einsaetzeData is empty
    if (getEinsaetzeData().length === 0) {
        console.log('Einsaetze data is empty, generating mission plan...');
        const generatedPlan = generateMissionPlan();
        setEinsaetzeData(generatedPlan); // Set the generated plan to appData
        console.log('Generated Einsaetze data:', getEinsaetzeData());
    }

    console.log('Data before initializeGraph:', { nodes: graphData.nodes, edges: graphData.edges });
    initializeGraph();
    console.log('Data before renderTruppsTable:', getTruppsData());
    renderTruppsTable();
    console.log('Data before renderEinsaetzeTable:', getEinsaetzeData());
    renderEinsaetzeTable();
    initializeEventListeners(); // Call event listeners after initial rendering
});
