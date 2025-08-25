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

const geoData = geoDataRaw.split('\n').map(row => {
    const [Name, Latitude, Longitude] = row.split(',');
    return { Name, Latitude: +Latitude, Longitude: +Longitude };
});

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
const padding = 0.1; // 10% padding
const scaleX = (width * (1 - padding)) / geoWidth;
const scaleY = (height * (1 - padding)) / geoHeight;
const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio

// Calculate offsets to center the projected map
const offsetX = (width - geoWidth * scale) / 2;
const offsetY = (height - geoHeight * scale) / 2;

const nodes = graphData.nodes.map(d => {
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
        originalGeo: geo // Store original geo data for reference
    };
});

const links = graphData.edges.map(d => ({ ...d }));

// Re-introduce force simulation with geographical restoring forces
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.index).distance(80).strength(0.1)) // Keep link force
    .force("charge", d3.forceManyBody().strength(-50)) // Very weak repulsion
    .force("x", d3.forceX(d => d.x).strength(0.1)) // Pull towards geographical x
    .force("y", d3.forceY(d => d.y).strength(0.1)) // Pull towards geographical y
    .force("collide", d3.forceCollide().radius(25)); // Collision to prevent overlaps

// Fixed Node Positioning
const mahlwinkelNode = nodes.find(n => n.label === "Mahlwinkel");
const berlinAlexanderplatzNode = nodes.find(n => n.label === "Berlin-Alexanderplatz");

if (mahlwinkelNode) {
    // Set fx/fy to their projected geographical position first
    mahlwinkelNode.fx = mahlwinkelNode.x;
    mahlwinkelNode.fy = mahlwinkelNode.y;
    // Then adjust to desired fixed position
    mahlwinkelNode.fx = 40; // Mid-left
    mahlwinkelNode.fy = height / 2;
}
if (berlinAlexanderplatzNode) {
    // Set fx/fy to their projected geographical position first
    berlinAlexanderplatzNode.fx = berlinAlexanderplatzNode.x;
    berlinAlexanderplatzNode.fy = berlinAlexanderplatzNode.y;
    // Then adjust to desired fixed position
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
    .attr("r", 5) // Reduced radius
    .attr("fill", "#007bff");

node.append("text")
    .attr("class", "label-bg")
    .attr("dy", "-1.2em")
    .text(d => d.label.replace(/-/g, " "));

node.append("text")
    .attr("dy", "-1.2em")
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
        // Select node and highlight all connections (incoming and outgoing)
        selectedNode = d;

        node.classed('faded', true);
        link.classed('faded', true);

        d3.select(this).classed('faded', false).classed('highlight', true);

        // Highlight all connected links
        const connectedLinks = link.filter(l => l.source.index === selectedNode.index || l.target.index === selectedNode.index);
        connectedLinks.classed('faded', false).classed('outgoing-highlight', true); // Using outgoing-highlight for all connected

        // Highlight all connected nodes
        const connectedNodes = new Set();
        connectedLinks.each(l => {
            connectedNodes.add(l.source.index);
            connectedNodes.add(l.target.index);
        });

        node.filter(n => connectedNodes.has(n.index))
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