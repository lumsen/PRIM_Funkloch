import { getTruppsData, deleteTrupp as deleteTruppFromAppData } from '../data/appData.js';

export function renderTruppsTable() {
    console.log('renderTruppsTable called.');
    console.log('truppsData:', getTruppsData());

    const tbody = d3.select('#trupps-table tbody');
    tbody.html(''); // Clear existing rows

    const columnKeys = [
        'name',
        'staerke',
        'reichweite',
        'geschwindigkeit',
        'ruhezeit', // This might be undefined for Funktrupps
        'ausruestung',
        'aktuellerEinsatzpunkt'
    ];

    const rows = tbody.selectAll('tr').data(getTruppsData(), d => d.id).enter().append('tr');

    rows.each(function(d) {
        const row = d3.select(this);
        
        columnKeys.forEach(key => {
            let cellValue = d[key];
            if (key === 'ruhezeit' && (cellValue === undefined || cellValue === 0)) {
                cellValue = '-'; // Display '-' for Funktrupps or if ruhezeit is 0
            }
            row.append('td').attr('data-key', key).text(cellValue);
        });

        // The delete button should be in its own <td> at the very end
        row.append('td').html(`<button class="btn btn-danger btn-sm delete-trupp" data-id="${d.id}">Löschen</button>`);
    });

    // Make cells editable
    // Exclude the last child (the delete button column) from being editable
    tbody.selectAll('td:not(:last-child)').on('click', handleTruppCellClick);
    // Add delete functionality
    tbody.selectAll('.delete-trupp').on('click', handleDeleteTruppClick);
}

function handleTruppCellClick() {
    const cell = d3.select(this);
    if (cell.select('input').size() > 0) return; // Already in edit mode

    const originalValue = cell.text();
    const key = cell.attr('data-key');
    const id = d3.select(this.parentNode).datum().id;

    // Determine input type based on key
    let inputType = 'text';
    if (['staerke', 'reichweite', 'geschwindigkeit', 'ruhezeit'].includes(key)) {
        inputType = 'number';
    }

    const input = cell.html('').append('input')
        .attr('type', inputType)
        .attr('value', originalValue)
        .on('blur', function() {
            const newValue = this.value.trim();
            const trupp = getTruppsData().find(t => t.id === id);

            if (newValue === originalValue) {
                cell.text(originalValue);
                return;
            }

            if (trupp) {
                const finalValue = (inputType === 'number') ? +newValue : newValue;
                trupp[key] = finalValue;
                cell.text(finalValue); // Update the cell text directly
                renderTruppsTable(); // Re-render to ensure data consistency and refresh other parts if needed
            }
        })
        .on('keypress', function(event) { 
            if (event.key === 'Enter') {
                this.blur();
            }
        });

    input.node().focus();
}

function handleDeleteTruppClick(event) {
    event.stopPropagation(); // Prevent cell click from firing
    const id = d3.select(this).attr('data-id');
    deleteTruppFromAppData(+id);
    renderTruppsTable();
}
