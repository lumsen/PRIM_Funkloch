import {
    NODE_RADIUS,
    GEO_PADDING,
    GEO_FORCE_STRENGTH,
} from '../constants.js';
import { graphData, geoData } from '../data/graphData.js';
import { getLinkClass, saveData, redrawEverything } from '../utils/helpers.js';
import { initializeTable } from './matrix.js';

// --- D3 Selections (Global) ---
const svg = d3.select("#graph");
const width = +svg.attr("viewBox").split(' ')[2];
const height = +svg.attr("viewBox").split(' ')[3];

let link, linkLabels, node; // Will be assigned in initializeGraph
let selectedNode = null;
let selectedLink = null;
let nodeLabelToIndex = new Map();

export function initializeGraph() {
    console.log('initializeGraph called.');
    console.log('graphData:', graphData);
    console.log('geoData:', geoData);

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

    console.log('Nodes:', nodes);
    console.log('Links:', links);

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

    initializeTable(nodes, links, nodeLabelToIndex);
}

function handleNodeClick(event, d) {
    console.log("Node clicked:", d.label);
    if (event.defaultPrevented) return; // Ignore click if it was part of a drag

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
    const table = d3.select("#matrix-container table");
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
    d3.selectAll("#matrix-container th, #matrix-container td").classed('highlight-col', false);
    // Remove highlighting from table rows
    d3.selectAll("#matrix-container tr").classed('highlight-row', false);
}
