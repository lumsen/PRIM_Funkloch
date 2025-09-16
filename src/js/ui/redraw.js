import { initializeGraph } from './graph.js';
import { renderTruppsTable } from './trupps.js';
import { renderEinsaetzeTable } from './einsaetze.js';

export function redrawEverything() {
  console.log('Redrawing everything...');
  d3.select('#graph').selectAll('*' ).remove();
  initializeGraph();
  renderTruppsTable();
  renderEinsaetzeTable();
}
