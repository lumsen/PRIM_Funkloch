import { getEinsaetzeData, deleteEinsatz as deleteEinsatzFromAppData } from '../data/appData.js';
import { formatDateTime } from '../utils/helpers.js'; // Import the new helper function

export function renderEinsaetzeTable() {
  console.log('renderEinsaetzeTable called.');
  console.log('einsaetzeData:', getEinsaetzeData());

  const tbody = d3.select('#einsaetze-table tbody');
  tbody.html(''); // Clear existing rows

  const rows = tbody.selectAll('tr').data(getEinsaetzeData(), d => d.id).enter().append('tr');

  rows.each(function(d) {
    const row = d3.select(this);
    row.append('td').attr('data-key', 'truppname').text(d.truppname);
    row.append('td').attr('data-key', 'startzeit').text(formatDateTime(d.startzeit)); // Use formatDateTime
    row.append('td').attr('data-key', 'startort').text(d.startort);
    row.append('td').attr('data-key', 'endort').text(d.endort);
    row.append('td').attr('data-key', 'endzeit').text(formatDateTime(d.endzeit)); // Use formatDateTime
    row.append('td').attr('data-key', 'type').text(d.type); // Display mission type
    row.append('td').html(`<button class="btn btn-danger btn-sm delete-einsatz" data-id="${d.id}">Löschen</button>`);
  });

  // Make cells editable
  tbody.selectAll('td:not(:last-child)').on('click', handleEinsatzCellClick);
  // Add delete functionality
  tbody.selectAll('.delete-einsatz').on('click', handleDeleteEinsatzClick);
}

function handleEinsatzCellClick() {
  const cell = d3.select(this);
  if (cell.select('input').size() > 0) return; // Already in edit mode

  const originalValue = cell.text();
  const key = cell.attr('data-key');
  const id = d3.select(this.parentNode).datum().id;

  const input = cell.html('').append('input')
    .attr('type', 'text')
    .attr('value', originalValue)
    .on('blur', function() {
      const newValue = this.value.trim();
      const einsatz = getEinsaetzeData().find(e => e.id === id);

      if (newValue === originalValue) {
        cell.text(originalValue);
        return;
      }

      // If the key is a time field, ensure the new value is stored in ISO format
      if (key === 'startzeit' || key === 'endzeit') {
        // Attempt to parse the new value into a Date object to validate and convert to ISO
        const parsedDate = new Date(newValue);
        if (!isNaN(parsedDate.getTime())) {
          einsatz[key] = parsedDate.toISOString().slice(0, 16); // Store in ISO format
          cell.text(formatDateTime(einsatz[key])); // Display formatted
        } else {
          console.warn(`Invalid date/time format for ${key}: ${newValue}. Reverting to original.`);
          cell.text(formatDateTime(originalValue)); // Revert to original formatted value
        }
      } else {
        einsatz[key] = newValue;
        cell.text(newValue); // Update the cell text directly
      }

      if (einsatz) {
        // The logic for updating einsatz[key] and cell.text(newValue) is now handled above
        renderEinsaetzeTable(); // Re-render to ensure data consistency and refresh other parts if needed
      }
    })
    .on('keypress', function(event) {
      if (event.key === 'Enter') {
        this.blur();
      }
    });

  input.node().focus();
}

function handleDeleteEinsatzClick(event) {
  event.stopPropagation();
  const id = d3.select(this).attr('data-id');
  deleteEinsatzFromAppData(+id);
  renderEinsaetzeTable();
}
