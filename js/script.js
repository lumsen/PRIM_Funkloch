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

// --- D3 Selections (Global) ---
const svg = d3.select("#graph");
const width = +svg.attr("viewBox").split(' ')[2];
const height = +svg.attr("viewBox").split(' ')[3];

let link, linkLabels, node; // Will be assigned in initializeGraph
let selectedNode = null;
let nodeLabelToIndex = new Map(); // Moved here for global access

// --- Data ---
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

const graphData = {
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

// --- Helper Functions ---
function getRiskClass(risk) {
    return `cell-${risk}`;
}

function getLinkClass(risk) {
    return `link link-${risk}`;
}

// --- Graph Initialization ---
function initializeGraph() {
    // Calculate min/max for geographical coordinates
    const allLatitudes = geoData.map(d => d.Latitude);
    const allLongitudes = geoData.map(d => d.Longitude);

    const minLat = d3.min(allLatitudes);
    const maxLat = d3.max(allLatitudes);
    const minLon = d3.min(allLongitudes);
    const maxLon = d3.max(allLongitudes);

    const geoWidth = maxLon - minLon;
    const geoHeight = maxLat - minLat;

    // Determine scaling factor to fit within SVG viewBox
    const scaleX = (width * (1 - GEO_PADDING)) / geoWidth;
    const scaleY = (height * (1 - GEO_PADDING)) / geoHeight;
    const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio

    // Calculate offsets to center the projected map
    const offsetX = (width - geoWidth * scale) / 2;
    const offsetY = (height - geoHeight * scale) / 2;

    const nodes = graphData.nodes.map((d, i) => {
        const geo = geoData.find(g => g.Name === d.label);
        let projectedX, projectedY;

        if (geo) {
            // Simple linear projection and scaling
            projectedX = (geo.Longitude - minLon) * scale + offsetX;
            projectedY = (maxLat - geo.Latitude) * scale + offsetY; // Invert Y for SVG
        } else {
            // Fallback if geo data is missing (should not happen)
            console.warn(`Geographical data missing for node: ${d.label}`);
            projectedX = width / 2;
            projectedY = height / 2;
        }

        return {
            ...d,
            x: projectedX,
            y: projectedY,
            originalGeo: geo, // Store original geo data for reference
            index: i // Assign index for D3 and lookup
        };
    });

    // Populate the map for table editing
    nodes.forEach(n => {
        nodeLabelToIndex.set(n.label, n.index);
    });

    const links = graphData.edges.map(d => ({
        ...d,
        source: nodes[d.source], // Resolve source index to node object
        target: nodes[d.target]  // Resolve target index to node object
    }));

    // Force simulation for geographical layout (simplified)
    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => d.x).strength(GEO_FORCE_STRENGTH)) // Pull towards geographical x (strong)
        .force("y", d3.forceY(d => d.y).strength(GEO_FORCE_STRENGTH)) // Pull towards geographical y (strong)
        .force("collide", d3.forceCollide().radius(NODE_RADIUS + 5)); // Collision to prevent overlaps, based on node radius

    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", d => getLinkClass(d.risk))
        .attr("x1", d => d.source.x) // Initial positioning
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    linkLabels = svg.append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(links)
        .enter().append("text")
        .text(d => d.label)
        .attr("x", d => (d.source.x + d.target.x) / 2) // Initial positioning
        .attr("y", d => (d.source.y + d.target.y) / 2);

    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node");

    node.append("circle")
        .attr("r", NODE_RADIUS)
        .attr("fill", "#007bff");

    node.append("text")
        .attr("class", "label-bg")
        .attr("dy", "-1.4em")
        .text(d => d.label.replace(/-/g, " "));

    node.append("text")
        .attr("dy", "-1.4em")
        .text(d => d.label.replace(/-/g, " "));

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

// --- Interactivity & Dragging ---
const drag = d3.drag()
    .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    })
    .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
    })
    .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    });

    node.call(drag);

let selectedNode = null;

node.on('click', handleNodeClick);

// Reset view on click outside nodes
svg.on('click', function(event) {
    if (event.target.tagName === 'svg') {
        resetGraphView();
    }
});

// --- Event Handlers ---
function handleNodeClick(event, d) {
    if (selectedNode === d) {
        resetGraphView();
    } else {
        selectedNode = d;

        node.classed('faded', true);
        link.classed('faded', true);
        linkLabels.classed('faded', true); // Hide link labels

        d3.select(this).classed('faded', false).classed('highlight', true);

        // Highlight all connected links
        const connectedLinks = link.filter(l => l.source.index === selectedNode.index || l.target.index === selectedNode.index);
        connectedLinks.classed('faded', false).classed('outgoing-highlight', true);

        // Highlight all connected nodes
        const connectedNodes = new Set();
        connectedLinks.each(l => {
            connectedNodes.add(l.source.index);
            connectedNodes.add(l.target.index);
        });

        node.filter(n => connectedNodes.has(n.index))
            .classed('faded', false);

        // Show link labels for connected links
        linkLabels.each(function(l) {
            const isConnected = connectedLinks.data().some(cl => cl === l); // Check if this linkLabel's data matches any connected link's data
            d3.select(this).classed('faded', !isConnected); // Apply faded if not connected
        });
    }
}

function resetGraphView() {
    selectedNode = null;
    node.classed('faded', false).classed('highlight', false);
    link.classed('faded', false).classed('outgoing-highlight', false);
    linkLabels.classed('faded', false); // Show link labels
}

// --- Table Editing ---
const tableBody = d3.select("table tbody");
const tableHead = d3.select("table thead");

// Create a mapping from node label to its index for quick lookup
let nodeLabelToIndex; // Declare here, assign in initializeGraph

// Assign nodeLabelToIndex after nodes are created and indexed
d3.select(document).on("DOMContentLoaded", () => {
    // This runs after the DOM is fully loaded, but before initializeGraph might have finished
    // It's better to populate nodeLabelToIndex inside initializeGraph after nodes are ready
});

tableBody.selectAll("td").on("click", function(event) {
    console.log("Cell clicked!"); // First line in handler
    const cell = d3.select(this);
    console.log("Cell selection:", cell.node()); // Log the actual DOM element

    // Check if already editing or if it's a non-editable cell
    if (!cell.select("input").empty() || cell.text() === "-") {
        console.log("Skipping edit: already editing or '-' cell.");
        return; 
    }

    const originalValue = cell.text();
    const rowHeader = d3.select(this.parentNode).select("th").text();
    const colIndex = Array.from(this.parentNode.children).indexOf(this);
    const colHeader = tableHead.selectAll("th").nodes()[colIndex].textContent;

    console.log("Row Header:", rowHeader, "Col Header:", colHeader);

    // IMPORTANT: Convert table headers to match node labels (replace hyphens with spaces)
    const cleanedRowHeader = rowHeader.replace(/-/g, " ");
    const cleanedColHeader = colHeader.replace(/-/g, " ");

    // Use the nodeLabelToIndex map that is populated in initializeGraph
    const sourceIndex = nodeLabelToIndex.get(cleanedRowHeader);
    const targetIndex = nodeLabelToIndex.get(cleanedColHeader);

    console.log("Source Index:", sourceIndex, "Target Index:", targetIndex);

    if (sourceIndex === undefined || targetIndex === undefined) {
        console.warn("Could not find node indices for table headers. Row:", rowHeader, "Col:", colHeader);
        return;
    }

    const input = cell.append("input")
        .attr("type", "text")
        .attr("value", originalValue)
        .on("blur", function() {
            const newValue = this.value;
            // Validate format XX/RY
            const match = newValue.match(/^(\d+)\/R([0-5])$/); // Fixed regex
            
            if (match) {
                const newDistance = match[1];
                const newRisk = +match[2];

                // Find the corresponding link in graphData.edges
                const linkToUpdate = graphData.edges.find(edge =>
                    (edge.source.index === sourceIndex && edge.target.index === targetIndex) ||
                    (edge.source.index === targetIndex && edge.target.index === sourceIndex) // Bidirectional check
                );

                if (linkToUpdate) {
                    linkToUpdate.label = `${newDistance}km`;
                    linkToUpdate.risk = newRisk;

                    // Update the table cell
                    cell.text(newValue)
                        .attr("class", getRiskClass(newRisk)); // Update class for color

                    // Update the graph link and label
                    link.filter(l => l === linkToUpdate)
                        .attr("class", getLinkClass(newRisk)); // Use helper function
                    linkLabels.filter(l => l === linkToUpdate)
                        .text(linkToUpdate.label);

                } else {
                    // Handle creation of new link if it was a '-' cell
                    console.log("Creating new link for table cell.", rowHeader, colHeader);
                    const newLink = {
                        label: `${newDistance}km`,
                        source: nodes[sourceIndex],
                        target: nodes[targetIndex],
                        risk: newRisk
                    };
                    graphData.edges.push(newLink);

                    // Update D3 selections to include new link
                    link = link.data(links, d => d.source.index + "-" + d.target.index) // Rebind data with key function
                        .join(
                            enter => enter.append("line")
                                .attr("class", d => getLinkClass(d.risk)),
                            update => update.attr("class", d => getLinkClass(d.risk)),
                            exit => exit.remove()
                        );
                    
                    linkLabels = linkLabels.data(links, d => d.source.index + "-" + d.target.index) // Rebind data with key function
                        .join(
                            enter => enter.append("text")
                                .text(d => d.label),
                            update => update.text(d => d.label),
                            exit => exit.remove()
                        );

                    // Update table cell
                    cell.text(newValue)
                        .attr("class", getRiskClass(newRisk));

                    // Restart simulation to adjust to new link (optional, but good practice)
                    simulation.alpha(1).restart();
                }
            } else {
                console.warn("Invalid format. Reverting to original.", newValue);
                cell.text(originalValue); // Revert to original
            }
            input.remove(); // Remove input field
        })
        .on("keypress", function(event) {
            if (event.key === "Enter") {
                this.blur(); // Trigger blur to save changes
            }
        });
    input.node().focus(); // Focus the input field
});

// --- Initial Call ---
initializeGraph();