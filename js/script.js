const graphData = {
    nodes: [
        { label: "Funkturm-Charlottenburg", center: { x: 130.1, y: 17.3 } },
        { label: "Mahlwinkel", center: { x: 20, y: 398.1 } },
        { label: "Wasserwerk-Tangerhütte", center: { x: 46.6, y: 334.5 } },
        { label: "Sendestation-Tangermünde", center: { x: 17.3, y: 268.6 } },
        { label: "Alter-Wachturm-Rathenow", center: { x: 95.4, y: 267.1 } },
        { label: "Relaisstation-Nauen", center: { x: 138.4, y: 161.5 } },
        { label: "Aussichtsturm-Fehrbellin", center: { x: 17.3, y: 143.4 } },
        { label: "Funkmast-Dallgow-Döberitz", center: { x: 239, y: 168.9 } },
        { label: "Ruinen-am-Wannsee", center: { x: 398.1, y: 132.4 } },
        { label: "Königsroderhof-Fiener-Bruch", center: { x: 369.9, y: 282.4 } },
        { label: "Spielplatz-Bahnitz", center: { x: 174.9, y: 241.2 } },
        { label: "Havelsee", center: { x: 266.9, y: 273.9 } },
        { label: "Neuer-Friedhof-Ihleburg", center: { x: 173.7, y: 317.4 } },
        { label: "Brandenburg-an-der-Havel", center: { x: 21.9, y: 177.8 } },
        { label: "Berliner-Golfclub-Stolper-Heide", center: { x: 62.1, y: 86.1 } },
        { label: "Oranienburg", center: { x: 79, y: 132.6 } },
        { label: "Potsdam", center: { x: 143.4, y: 94 } },
        { label: "Botanischer-Volkspark-Blankenfelde-Pankow", center: { x: 223.4, y: 69.3 } },
        { label: "Schloss-Britz", center: { x: 303.6, y: 17.3 } },
        { label: "Rochow", center: { x: 336.4, y: 211.1 } },
        { label: "Schloss-Caputh", center: { x: 327.5, y: 175.3 } },
        { label: "Teltow", center: { x: 362.6, y: 50.3 } },
        { label: "Berlin-Alexanderplatz", center: { x: 396.5, y: 17.3 } }
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

const svg = d3.select("#graph");
const width = +svg.attr("viewBox").split(' ')[2];
const height = +svg.attr("viewBox").split(' ')[3];

// Calculate min/max for scaling
const minX = d3.min(graphData.nodes, d => d.center.x);
const maxX = d3.max(graphData.nodes, d => d.center.x);
const minY = d3.min(graphData.nodes, d => d.center.y);
const maxY = d3.max(graphData.nodes, d => d.center.y);

const dataWidth = maxX - minX;
const dataHeight = maxY - minY;

const scaleX = width / dataWidth;
const scaleY = height / dataHeight;

// Use the smaller scale to maintain aspect ratio
const scale = Math.min(scaleX, scaleY) * 0.9; // Scale down slightly to add padding

const offsetX = (width - dataWidth * scale) / 2;
const offsetY = (height - dataHeight * scale) / 2;

const nodes = graphData.nodes.map(d => ({
    ...d,
    x: (d.center.x - minX) * scale + offsetX,
    y: (d.center.y - minY) * scale + offsetY
}));

const links = graphData.edges.map(d => ({ ...d }));

// Re-introduce force simulation
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.index).distance(80).strength(0.1))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(20));

// Fixed Node Positioning
const mahlwinkelNode = nodes.find(n => n.label === "Mahlwinkel");
const berlinAlexanderplatzNode = nodes.find(n => n.label === "Berlin-Alexanderplatz");

if (mahlwinkelNode) {
    mahlwinkelNode.fx = 40; // Mid-left
    mahlwinkelNode.fy = height / 2;
}
if (berlinAlexanderplatzNode) {
    berlinAlexanderplatzNode.fx = width - 40; // Mid-right
    berlinAlexanderplatzNode.fy = height / 2;
}

const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", d => "link link-" + d.risk);

const linkLabels = svg.append("g")
    .attr("class", "link-labels")
    .selectAll("text")
    .data(links)
    .enter().append("text")
    .text(d => d.label);

const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .classed("fixed", d => d.fx !== null); // Add class for fixed nodes

node.append("circle")
    .attr("r", 7) // Slightly larger radius for better visibility
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

node.on('click', function (event, d) {
    if (selectedNode === d) {
        // Deselect node and reset view
        selectedNode = null;
        node.classed('faded', false).classed('highlight', false);
        link.classed('faded', false).classed('outgoing-highlight', false);
    } else {
        // Select node and highlight outgoing connections
        selectedNode = d;

        node.classed('faded', true);
        link.classed('faded', true);

        d3.select(this).classed('faded', false).classed('highlight', true);

        // Highlight outgoing links
        const outgoingLinks = link.filter(l => l.source.index === selectedNode.index);
        outgoingLinks.classed('faded', false).classed('outgoing-highlight', true);

        // Highlight target nodes of outgoing links
        const targetNodes = new Set();
        outgoingLinks.each(l => {
            targetNodes.add(l.target.index);
        });

        node.filter(n => targetNodes.has(n.index))
            .classed('faded', false);
    }
});

// Reset view on click outside nodes
svg.on('click', function(event) {
    if (event.target.tagName === 'svg') {
        selectedNode = null;
        node.classed('faded', false).classed('highlight', false);
        link.classed('faded', false).classed('outgoing-highlight', false);
    }
});