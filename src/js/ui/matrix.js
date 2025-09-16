import { getRiskClass, saveData, redrawEverything } from '../utils/helpers.js';
import { graphData } from '../data/graphData.js';

export function initializeTable(nodes, links, nodeLabelToIndex) {
  console.log('initializeTable called.');
  console.log('Nodes for table:', nodes);
  console.log('Links for table:', links);

  const table = d3.select('#matrix-container table');
  const thead = table.select('thead');
  const tbody = table.select('tbody');

  thead.html('');
  tbody.html('');

  // Sort nodes by longitude for table display
  const sortedNodes = [...nodes].sort((a, b) => a.originalGeo.Longitude - b.originalGeo.Longitude);

  const headerRow = thead.append('tr');
  headerRow.append('th').text('Von / Nach');
  sortedNodes.forEach(node => headerRow.append('th').text(node.label));

  sortedNodes.forEach(sourceNode => {
    const row = tbody.append('tr');
    row.datum(sourceNode); // Attach node data to row
    row.append('th').text(sourceNode.label);
    sortedNodes.forEach(targetNode => {
      const cell = row.append('td');
      if (sourceNode.index === targetNode.index) {
        cell.text('X').attr('class', 'diagonal');
      } else {
        const linkData = links.find(l => (l.source.index === sourceNode.index && l.target.index === targetNode.index) || (l.source.index === targetNode.index && l.target.index === sourceNode.index));
        if (linkData) {
          const riskDisplay = linkData.risk === 0 ? '-' : linkData.risk;
          cell.text(`${linkData.label.replace('km', '')}/R${riskDisplay}`).attr('class', getRiskClass(linkData.risk));
        } else {
          cell.text('-');
        }
      }
    });
  });
    
  tbody.selectAll('td').on('click', (event) => handleCellClick(event, nodeLabelToIndex));
}

function handleCellClick(event, nodeLabelToIndex) {
  const cell = d3.select(event.currentTarget);
  if (cell.classed('diagonal') || cell.select('input').size() > 0) return;

  const originalValue = cell.text();
  const rowHeader = d3.select(event.currentTarget.parentNode).select('th').text();
  const colIndex = event.currentTarget.cellIndex;
  const colHeader = d3.select(event.currentTarget.closest('table')).select('thead th:nth-of-type(' + (colIndex + 1) + ')').text();

  const sourceIndex = nodeLabelToIndex.get(rowHeader);
  const targetIndex = nodeLabelToIndex.get(colHeader);

  if (sourceIndex === undefined || targetIndex === undefined) return;

  const input = cell.html('').append('input').attr('type', 'text').attr('value', originalValue)
    .on('blur', function() {
      const newValue = this.value.trim();
      if (newValue === originalValue) {
        cell.text(originalValue);
        return;
      }

      const match = newValue.match(/^(\d+)\/R([0-5]|-)$/);
      if (newValue !== '-' && !match) {
        console.error('Invalid format. Reverting.');
        cell.text(originalValue);
        return;
      }

      let linkIndex = graphData.edges.findIndex(e => (e.source === sourceIndex && e.target === targetIndex) || (e.source === targetIndex && e.target === sourceIndex));

      if (newValue === '-') {
        if (linkIndex !== -1) graphData.edges.splice(linkIndex, 1);
        cell.text('-'); // Update the cell text directly
      } else {
        const newDist = match[1];
        const newRisk = match[2] === '-' ? 0 : +match[2];
        if (linkIndex !== -1) {
          graphData.edges[linkIndex].label = `${newDist}km`;
          graphData.edges[linkIndex].risk = newRisk;
        } else {
          graphData.edges.push({ source: sourceIndex, target: targetIndex, label: `${newDist}km`, risk: newRisk });
        }
        cell.text(`${newDist}/R${newRisk === 0 ? '-' : newRisk}`); // Update the cell text directly
      }
      saveData();
      redrawEverything();
    })
    .on('keypress', function(event) { if (event.key === 'Enter') this.blur(); });

  input.node().focus();
}
