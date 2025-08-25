// --- Constants ---
const NODE_RADIUS = 7;
const LINK_DISTANCE = 100;
const CHARGE_STRENGTH = -300; // Standard repulsion
const COLLIDE_RADIUS = 20;
const LINK_STRENGTH = 0.7;
const FADE_OPACITY = 0.2;
const HIGHLIGHT_STROKE_WIDTH = 3;
const HIGHLIGHT_STROKE_OPACITY = 1;

const GEO_PADDING = 0.1; // 10% padding for geographical layout
const GEO_FORCE_STRENGTH = 1; // Strong pull towards geographical x/y
const GEO_CHARGE_STRENGTH = -1; // Extremely weak repulsion for geographical layout
const LOCAL_STORAGE_KEY = 'funknetzwerkSavedEdges';

// --- D3 Selections (Global) ---
const svg = d3.select("#graph");
const width = +svg.attr("viewBox").split(' ')[2];
const height = +svg.attr("viewBox").split(' ')[3];

let link, linkLabels, node; // Will be assigned in initializeGraph
let selectedNode = null;
let selectedLink = null;
let nodeLabelToIndex = new Map();

// --- Data ---
const initialGraphData = {
    nodes: [
        {label:"Funkturm-Charlottenburg"},
        {label:"Mahlwinkel"},
        {label:"Wasserwerk-Tangerhütte"},
        {label:"Sendestation-Tangermünde"},
        {label:"Alter-Wachturm-Rathenow"},
        {label:"Relaisstation-Nauen"},
        {label:"Aussichtsturm-Fehrbellin"},
        {label:"Funkmast-Dallgow-Döberitz"},
        {label:"Ruinen-am-Wannsee"},
        {label:"Königsroderhof-Fiener-Bruch"},
        {label:"Spielplatz-Bahnitz"},
        {label:"Havelsee"},
        {label:"Neuer-Friedhof-Ihleburg"},
        {label:"Brandenburg-an-der-Havel"},
        {label:"Berliner-Golfclub-Stolper-Heide"},
        {label:"Oranienburg"},
        {label:"Potsdam"},
        {label:"Botanischer-Volkspark-Blankenfelde-Pankow"},
        {label:"Schloss-Britz"},
        {label:"Rochow"},
        {label:"Schloss-Caputh"},
        {label:"Teltow"},
        {label:"Berlin-Alexanderplatz"}
    ],
    edges: [
        {label:"14km", source:1, target:2, risk: 2},
        {label:"14km", source:7, target:8, risk: 4},
        {label:"24km", source:1, target:9, risk: 3},
        {label:"10km", source:3, target:2, risk: 1},
        {label:"22km", source:3, target:4, risk: 2},
        {label:"13km", source:4, target:10, risk: 1},
        {label:"12km", source:4, target:11, risk: 2},
        {label:"15km", source:4, target:12, risk: 2},
        {label:"19km", source:4, target:13, risk: 2},
        {label:"17km", source:6, target:5, risk: 1},
        {label:"22km", source:6, target:14, risk: 2},
        {label:"20km", source:6, target:15, risk: 2},
        {label:"12km", source:10, target:11, risk: 1},
        {label:"14km", source:10, target:13, risk: 1},
        {label:"15km", source:2, target:12, risk: 2},
        {label:"10km", source:11, target:12, risk: 1},
        {label:"12km", source:11, target:5, risk: 2},
        {label:"12km", source:11, target:13, risk: 1},
        {label:"20km", source:5, target:7, risk: 1},
        {label:"15km", source:5, target:14, risk: 2},
        {label:"23km", source:5, target:16, risk: 2},
        {label:"19km", source:5, target:15, risk: 1},
        {label:"21km", source:7, target:0, risk: 3},
        {label:"10km", source:7, target:16, risk: 1},
        {label:"18km", source:0, target:17, risk: 5},
        {label:"12km", source:0, target:18, risk: 5},
        {label:"12km", source:0, target:16, risk: 3},
        {label:"18km", source:12, target:9, risk: 1},
        {label:"15km", source:12, target:13, risk: 2},
        {label:"14km", source:9, target:11, risk: 2},
        {label:"19km", source:9, target:19, risk: 3},
        {label:"20km", source:9, target:13, risk: 2},
        {label:"20km", source:19, target:20, risk: 2},
        {label:"20km", source:19, target:13, risk: 1},
        {label:"16km", source:20, target:8, risk: 3},
        {label:"25km", source:20, target:18, risk: 4},
        {label:"10km", source:20, target:16, risk: 1},
        {label:"24km", source:20, target:21, risk: 2},
        {label:"13km", source:8, target:18, risk: 4},
        {label:"11km", source:8, target:16, risk: 2},
        {label:"22km", source:8, target:21, risk: 3},
        {label:"25km", source:18, target:21, risk: 4},
        {label:"10km", source:15, target:14, risk: 2},
        {label:"22km", source:13, target:16, risk: 1},
        {label:"11km", source:0, target:22, risk: 5},
        {label:"17km", source:8, target:22, risk: 5},
        {label:"10km", source:18, target:22, risk: 4},
        {label:"22km", source:13, target:22, risk: 5},
        {label:"21km", source:16, target:21, risk: 2},
        {label:"26km", source:16, target:22, risk: 0},
        {label:"18km", source:21, target:22, risk: 4},
        {label:"8km", source:22, target:17, risk: 5}
    ]
};

const geoDataRaw = `Name,Latitude,Longitude
Mahlwinkel,52.3831,11.8252
Sendestation-Tangermünde,52.5694,11.9702
Alter-Wachturm-Rathenow,52.6102,12.3392
Aussichtsturm-Fehrbellin,52.7845,12.8122
Berliner-Golfclub-Stolper-Heide,52.6828,13.2384
Botanischer-Volkspark-Blankenfelde-Pankow,52.5855,13.4309
Spielplatz-Bahnitz,52.4222,12.4414
Wasserwerk-Tangerhütte,52.4173,11.8988
Havelsee,52.4936,12.4284
Relaisstation-Nauen,52.6025,12.887
Funkmast-Dallgow-Döberitz,52.5458,13.0642
Funkturm-Charlottenburg,52.5065,13.2676
Neuer-Friedhof-Ihleburg,52.4442,12.3274
Königsroderhof-Fiener-Bruch,52.3683,12.0837
Rochow,52.2858,12.7214
Schloss-Caputh,52.3394,13.003
Ruinen-am-Wannsee,52.4147,13.1672
Schloss-Britz,52.4578,13.4682
Oranienburg,52.7533,13.2427
Brandenburg-an-der-Havel,52.4172,12.5592
Potsdam,52.3923,13.0645
Teltow,52.4042,13.2847
Berlin-Alexanderplatz,52.5219,13.4135`;

const geoData = geoDataRaw.split('\n').slice(1).map(row => {
    const [Name, Latitude, Longitude] = row.split(',');
    return { Name, Latitude: +Latitude, Longitude: +Longitude };
});

let graphData = JSON.parse(JSON.stringify(initialGraphData));

// --- Helper Functions ---
function getRiskClass(risk) { return `cell-${risk}`; }
function getLinkClass(risk) { return `link link-${risk}`; }

function saveData() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(graphData.edges));
    } catch (e) {
        console.error("Failed to save data to localStorage", e);
    }
}

function loadData() {
    const savedEdges = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedEdges) {
        try {
            graphData.edges = JSON.parse(savedEdges);
        } catch (e) {
            console.error("Failed to parse saved data", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
}

function redrawEverything() {
    svg.selectAll("*" ).remove();
    initializeGraph();
}

// --- Graph Initialization ---
function initializeGraph() {
    nodeLabelToIndex.clear();

    const allLatitudes = geoData.map(d => d.Latitude);
    const allLongitudes = geoData.map(d => d.Longitude);
    const minLat = d3.min(allLatitudes), maxLat = d3.max(allLatitudes);
    const minLon = d3.min(allLongitudes), maxLon = d3.max(allLongitudes);
    const geoWidth = maxLon - minLon, geoHeight = maxLat - minLat;
    const scaleX = (width * (1 - GEO_PADDING)) / geoWidth;
    const scaleY = (height * (1 - GEO_PADDING)) / geoHeight;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (width - geoWidth * scale) / 2;
    const offsetY = (height - geoHeight * scale) / 2;

    const nodes = graphData.nodes.map((d, i) => {
        const geo = geoData.find(g => g.Name === d.label);
        let projectedX, projectedY;
        if (geo) {
            projectedX = (geo.Longitude - minLon) * scale + offsetX;
            projectedY = (maxLat - geo.Latitude) * scale + offsetY;
        } else {
            console.warn(`Geographical data missing for node: ${d.label}`);
            projectedX = width / 2; projectedY = height / 2;
        }
        return { ...d, x: projectedX, y: projectedY, originalGeo: geo, index: i };
    });

    nodes.forEach(n => nodeLabelToIndex.set(n.label, n.index));

    const links = graphData.edges.map(d => ({ ...d, source: nodes[d.source], target: nodes[d.target] }));

    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => d.x).strength(GEO_FORCE_STRENGTH))
        .force("y", d3.forceY(d => d.y).strength(GEO_FORCE_STRENGTH))
        .force("collide", d3.forceCollide().radius(NODE_RADIUS + 5));

    link = svg.append("g").attr("class", "links").selectAll("line").data(links).enter().append("line")
        .attr("class", d => getLinkClass(d.risk))
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y)
        .on('click', handleLinkClick);

    linkLabels = svg.append("g").attr("class", "link-labels").selectAll("text").data(links).enter().append("text")
        .attr("class", "link-label").text(d => d.label)
        .attr("x", d => (d.source.x + d.target.x) / 2).attr("y", d => (d.source.y + d.target.y) / 2);

    node = svg.append("g").attr("class", "nodes").selectAll("g").data(nodes).enter().append("g").attr("class", "node");
    node.append("circle").attr("r", NODE_RADIUS).attr("fill", "#007bff");
    node.append("text").attr("class", "label-bg").attr("dy", "-1.4em").text(d => d.label.replace(/-/g, " "));
    node.append("text").attr("dy", "-1.4em").text(d => d.label.replace(/-/g, " "));

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        linkLabels.attr("x", d => (d.source.x + d.target.x) / 2).attr("y", d => (d.source.y + d.target.y) / 2);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    const drag = d3.drag()
        .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });

    node.call(drag).on('click', handleNodeClick);
    svg.on('click', (event) => { if (event.target.tagName === 'svg') resetGraphView(); });
    
    initializeTable(nodes, links);
}

// --- Event Handlers ---
function handleNodeClick(event, d) {
    resetGraphView(); // Reset previous selections
    selectedNode = d;

    node.classed('faded', true);
    link.classed('faded', true);
    linkLabels.classed('faded', true);

    const clickedNode = node.filter(n => n.index === d.index);
    clickedNode.classed('faded', false).classed('highlight', true);

    const connectedLinks = link.filter(l => l.source.index === d.index || l.target.index === d.index);
    connectedLinks.classed('faded', false).classed('outgoing-highlight', true);

    const connectedNodes = new Set([d.index]);
    connectedLinks.each(l => { connectedNodes.add(l.source.index); connectedNodes.add(l.target.index); });

    node.filter(n => connectedNodes.has(n.index)).classed('faded', false);
    linkLabels.filter(l => connectedLinks.data().includes(l)).classed('faded', false);

    // Highlight table
    const table = d3.select(".table-container table");
    const ths = table.selectAll("thead th");
    const trs = table.selectAll("tbody tr");

    const columnIndex = Array.from(ths.nodes()).findIndex(th => th.textContent === d.label);
    if (columnIndex > -1) {
        ths.filter((_, i) => i === columnIndex).classed('highlight-col', true);
        trs.selectAll('td:nth-child(' + (columnIndex + 1) + ')').classed('highlight-col', true);
    }

    // Highlight rows of connected nodes
    trs.filter(function(rowData) {
        // rowData is the sourceNode for this row
        const sourceNodeIndex = rowData.index;
        // Check if this row's source node is connected to the clicked node
        return connectedNodes.has(sourceNodeIndex) && sourceNodeIndex !== d.index;
    }).classed('highlight-row', true);

    // Also highlight the row of the clicked node itself
    trs.filter(function(rowData) {
        return rowData.index === d.index;
    }).classed('highlight-row', true);
}

function handleLinkClick(event, d) {
    event.stopPropagation(); // Prevent svg click from firing
    resetGraphView(); // Reset previous selections
    selectedLink = d;
    link.filter(l => l === d).classed('highlight', true);
}

function resetGraphView() {
    selectedNode = null;
    selectedLink = null;
    node.classed('faded', false).classed('highlight', false);
    link.classed('faded', false).classed('outgoing-highlight', false).classed('highlight', false);
    linkLabels.classed('faded', false);
    // Remove highlighting from table headers and cells
    d3.selectAll(".table-container th, .table-container td").classed('highlight-col', false);
    // Remove highlighting from table rows
    d3.selectAll(".table-container tr").classed('highlight-row', false);
}

// --- Table Generation and Editing ---
function initializeTable(nodes, links) {
    const table = d3.select(".table-container table");
    const thead = table.select("thead");
    const tbody = table.select("tbody");

    thead.html("");
    tbody.html("");

    // Sort nodes by longitude for table display
    const sortedNodes = [...nodes].sort((a, b) => a.originalGeo.Longitude - b.originalGeo.Longitude);

    const headerRow = thead.append("tr");
    headerRow.append("th").text("Von / Nach");
    sortedNodes.forEach(node => headerRow.append("th").text(node.label));

    sortedNodes.forEach(sourceNode => {
        const row = tbody.append("tr");
        row.datum(sourceNode); // Attach node data to row
        row.append("th").text(sourceNode.label);
        sortedNodes.forEach(targetNode => {
            const cell = row.append("td");
            if (sourceNode.index === targetNode.index) {
                cell.text("X").attr("class", "diagonal");
            } else {
                const linkData = links.find(l => (l.source.index === sourceNode.index && l.target.index === targetNode.index) || (l.source.index === targetNode.index && l.target.index === sourceNode.index));
                if (linkData) {
                    const riskDisplay = linkData.risk === 0 ? "-" : linkData.risk;
                    cell.text(`${linkData.label.replace('km', '')}/R${riskDisplay}`).attr("class", getRiskClass(linkData.risk));
                } else {
                    cell.text("-");
                }
            }
        });
    });
    
    tbody.selectAll("td").on("click", handleCellClick);
}

function handleCellClick() {
    const cell = d3.select(this);
    if (cell.classed("diagonal") || cell.select("input").size() > 0) return;

    const originalValue = cell.text();
    const rowHeader = d3.select(this.parentNode).select("th").text();
    const colIndex = this.cellIndex;
    const colHeader = d3.select(this.closest('table')).select('thead th:nth-of-type(' + (colIndex + 1) + ')').text();

    const sourceIndex = nodeLabelToIndex.get(rowHeader);
    const targetIndex = nodeLabelToIndex.get(colHeader);

    if (sourceIndex === undefined || targetIndex === undefined) return;

    const input = cell.html("").append("input").attr("type", "text").attr("value", originalValue)
        .on("blur", function() {
            const newValue = this.value.trim();
            if (newValue === originalValue) {
                cell.text(originalValue);
                return;
            }

            const match = newValue.match(/^(\d+)\/R([0-5]|-)$/);
            if (newValue !== '-' && !match) {
                console.error("Invalid format. Reverting.");
                cell.text(originalValue);
                return;
            }

            let linkIndex = graphData.edges.findIndex(e => (e.source === sourceIndex && e.target === targetIndex) || (e.source === targetIndex && e.target === sourceIndex));

            if (newValue === '-') {
                if (linkIndex !== -1) graphData.edges.splice(linkIndex, 1);
            } else {
                const newDist = match[1];
                const newRisk = match[2] === '-' ? 0 : +match[2];
                if (linkIndex !== -1) {
                    graphData.edges[linkIndex].label = `${newDist}km`;
                    graphData.edges[linkIndex].risk = newRisk;
                } else {
                    graphData.edges.push({ source: sourceIndex, target: targetIndex, label: `${newDist}km`, risk: newRisk });
                }
            }
            saveData();
            redrawEverything();
        })
        .on("keypress", function(event) { if (event.key === "Enter") this.blur(); });

    input.node().focus();
}

// --- Initial Call ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeGraph();

    d3.select("#reset-button").on("click", () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        graphData = JSON.parse(JSON.stringify(initialGraphData));
        redrawEverything(); // Redraw but don't save
    });

    d3.select("#export-button").on("click", () => {
        const dataToExport = JSON.stringify(graphData.edges, null, 4);
        navigator.clipboard.writeText(dataToExport).then(() => {
            alert("Aktuelle Matrixdaten in die Zwischenablage kopiert! Du kannst sie jetzt in die js/script.js Datei einfügen.");
        }).catch(err => {
            console.error('Fehler beim Kopieren in die Zwischenablage:', err);
            alert('Fehler beim Kopieren in die Zwischenablage. Bitte Konsole prüfen.');
        });
    });

    d3.select(window).on("keydown", (event) => {
        if (event.key === "Delete" || event.key === "Backspace") {
            if (selectedLink) {
                const sourceIndex = selectedLink.source.index;
                const targetIndex = selectedLink.target.index;
                const linkIndex = graphData.edges.findIndex(e => (e.source === sourceIndex && e.target === targetIndex) || (e.source === targetIndex && e.target === sourceIndex));
                
                if (linkIndex !== -1) {
                    graphData.edges.splice(linkIndex, 1);
                    selectedLink = null;
                    saveData();
                    redrawEverything();
                }
            }
        }
    });
});
