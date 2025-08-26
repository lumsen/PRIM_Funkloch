import { loadData } from './utils/helpers.js';
import { initializeGraph, highlightCommunicationBridge } from './ui/graph.js'; // Import highlightCommunicationBridge
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
    const { missions } = generateMissionPlan(); // Only need missions here
    setEinsaetzeData(missions); // Set the generated missions to appData
    console.log('Generated Einsaetze data:', getEinsaetzeData());
  }

  console.log('Data before initializeGraph:', { nodes: graphData.nodes, edges: graphData.edges });
  initializeGraph(); // Initialize graph first

  // Setup timeline controls
  const timeSlider = document.getElementById('time-slider');
  const currentTimeDisplay = document.getElementById('current-time-display');

  const einsaetze = getEinsaetzeData();
  let minTime = new Date();
  let maxTime = new Date();

  if (einsaetze.length > 0) {
    minTime = new Date(Math.min(...einsaetze.map(e => new Date(e.startzeit).getTime())));
    maxTime = new Date(Math.max(...einsaetze.map(e => new Date(e.endzeit).getTime())));
  } else {
    // Fallback if no missions, use a default time range
    minTime = new Date('2025-08-26T04:00');
    maxTime = new Date('2025-08-26T22:00');
  }

  timeSlider.min = minTime.getTime();
  timeSlider.max = maxTime.getTime();
  timeSlider.value = minTime.getTime(); // Start at the beginning

  function updateGraphAndDisplay(time) {
    const currentTime = new Date(parseInt(time));
    currentTimeDisplay.textContent = `Aktuelle Zeit: ${currentTime.toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'medium' })}`;
    highlightCommunicationBridge(getEinsaetzeData(), currentTime);
  }

  timeSlider.addEventListener('input', (event) => {
    updateGraphAndDisplay(event.target.value);
  });

  // Initial update
  updateGraphAndDisplay(timeSlider.value);

  console.log('Data before renderTruppsTable:', getTruppsData());
  renderTruppsTable();
  console.log('Data before renderEinsaetzeTable:', getEinsaetzeData());
  renderEinsaetzeTable();
  initializeEventListeners(); // Call event listeners after initial rendering
});
