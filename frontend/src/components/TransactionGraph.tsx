import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GraphNode, GraphEdge } from '../types';
import { 
  Network, ZoomIn, ZoomOut, RotateCcw, Filter, 
  Layers, ShieldAlert, CheckCircle2, Info, Eye 
} from 'lucide-react';

export const TransactionGraph: React.FC<{ fullscreen?: boolean }> = ({ fullscreen = false }) => {
  const { graph, isAnalyzing, setInspectedNode, maxHops, setMaxHops, targetAddress } = useApp();
  
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [filterVaspOnly, setFilterVaspOnly] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Position nodes radially based on Hop level
  const computedNodes = React.useMemo(() => {
    if (!graph || graph.nodes.length === 0) return [];

    const nodes = [...graph.nodes];
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const hopGroups: Record<number, GraphNode[]> = { 0: [], 1: [], 2: [], 3: [] };
    nodes.forEach(n => {
      const h = n.hop || 0;
      if (!hopGroups[h]) hopGroups[h] = [];
      hopGroups[h].push(n);
    });

    const positionedNodes: (GraphNode & { x: number; y: number })[] = [];

    // Target Node at Center
    if (hopGroups[0].length > 0) {
      positionedNodes.push({ ...hopGroups[0][0], x: centerX, y: centerY });
    }

    // Hop 1 Ring
    const hop1Radius = 160;
    const hop1Nodes = hopGroups[1];
    hop1Nodes.forEach((node, i) => {
      const angle = (i / hop1Nodes.length) * 2 * Math.PI - Math.PI / 2;
      positionedNodes.push({
        ...node,
        x: centerX + hop1Radius * Math.cos(angle),
        y: centerY + hop1Radius * Math.sin(angle),
      });
    });

    // Hop 2 Ring
    const hop2Radius = 270;
    const hop2Nodes = hopGroups[2];
    hop2Nodes.forEach((node, i) => {
      const angle = (i / Math.max(1, hop2Nodes.length)) * 2 * Math.PI - Math.PI / 3;
      positionedNodes.push({
        ...node,
        x: centerX + hop2Radius * Math.cos(angle),
        y: centerY + hop2Radius * Math.sin(angle),
      });
    });

    // Hop 3 Ring
    const hop3Radius = 360;
    const hop3Nodes = hopGroups[3];
    hop3Nodes.forEach((node, i) => {
      const angle = (i / Math.max(1, hop3Nodes.length)) * 2 * Math.PI - Math.PI / 4;
      positionedNodes.push({
        ...node,
        x: centerX + hop3Radius * Math.cos(angle),
        y: centerY + hop3Radius * Math.sin(angle),
      });
    });

    return positionedNodes;
  }, [graph]);

  const filteredNodes = React.useMemo(() => {
    if (!filterVaspOnly) return computedNodes;
    return computedNodes.filter(n => n.isTarget || n.isVASP || n.type === 'HIGH_RISK_ENTITY');
  }, [computedNodes, filterVaspOnly]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, GraphNode & { x: number; y: number }>();
    computedNodes.forEach(n => map.set(n.id.toLowerCase(), n));
    return map;
  }, [computedNodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isAnalyzing) {
    return (
      <div className={`rounded-lg gov-card flex flex-col items-center justify-center text-center ${fullscreen ? 'h-[750px]' : 'h-[500px]'}`}>
        <div className="h-10 w-10 rounded-full border-3 border-blue-200 border-t-blue-700 animate-spin mb-3" />
        <h4 className="text-sm font-semibold text-slate-800">Generating Topology Graph</h4>
        <p className="text-xs text-slate-500 font-mono mt-1">Tracing multi-hop transaction flows and VASP clusters...</p>
      </div>
    );
  }

  const isMatchingWallet = graph && graph.targetAddress.toLowerCase() === targetAddress.toLowerCase();

  if (!graph || graph.nodes.length === 0 || !isMatchingWallet) {
    return (
      <div className={`rounded-lg gov-card flex flex-col items-center justify-center text-center text-slate-500 ${fullscreen ? 'h-[750px]' : 'h-[500px]'}`}>
        <Network className="h-10 w-10 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">
          {!graph ? 'No transaction graph data available.' : 'Topology graph syncing for current wallet...'}
        </p>
        <p className="text-xs text-slate-500">Run wallet analysis to construct the interactive graph.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg gov-card relative overflow-hidden flex flex-col ${fullscreen ? 'h-[calc(100vh-10rem)]' : 'h-[550px]'}`}>
      {/* Top Institutional Toolbar */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 z-10 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-700" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 font-mono">Multi-Hop Topology Engine</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-medium">
            {graph.nodes.length} Nodes / {graph.edges.length} Transfers
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* VASP filter toggle */}
          <button
            onClick={() => setFilterVaspOnly(!filterVaspOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              filterVaspOnly
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>VASPs Only</span>
          </button>

          {/* Depth toggle */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded p-0.5 text-xs font-mono">
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                onClick={() => setMaxHops(h)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  maxHops === h ? 'bg-white text-blue-900 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h}H
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-300 rounded p-0.5">
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
              className="p-1 text-slate-600 hover:text-blue-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="p-1 text-slate-600 hover:text-blue-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 text-slate-600 hover:text-blue-700 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Graph Area */}
      <div 
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing bg-slate-50 bg-graph-grid overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 800 500"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Arrow Marker for Restrained Blue Connections */}
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-slate" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Concentric Hop Rings */}
          <circle cx="400" cy="250" r="160" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="400" cy="250" r="270" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="400" cy="250" r="360" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="4 4" />

          {/* Hop Level Labels */}
          <text x="400" y="85" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="600">HOP 1 PERIMETER</text>
          <text x="400" y="-25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="600">HOP 2 PERIMETER</text>

          {/* Edges */}
          <g className="edges">
            {graph.edges.map((edge) => {
              const src = nodeMap.get(edge.source.toLowerCase());
              const tgt = nodeMap.get(edge.target.toLowerCase());
              if (!src || !tgt) return null;

              const isVaspTransfer = tgt.isVASP || src.isVASP;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isVaspTransfer ? '#2563eb' : '#94a3b8'}
                    strokeWidth={Math.max(1.5, Math.min(4, edge.totalValue * 0.35))}
                    strokeOpacity={isVaspTransfer ? 0.75 : 0.45}
                    markerEnd={isVaspTransfer ? 'url(#arrow-blue)' : 'url(#arrow-slate)'}
                    className="transition-all hover:stroke-blue-700 hover:stroke-[3px]"
                  />
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {filteredNodes.map((node) => {
              const isTarget = !!node.isTarget;
              const isVasp = !!node.isVASP;
              const isRisk = node.type === 'HIGH_RISK_ENTITY';

              let fill = '#334155'; // Slate-700 for regular intermediaries
              let stroke = '#0f172a'; // Slate-900 border
              let labelColor = '#334155';
              let radius = 18;

              if (isTarget) {
                fill = '#0f172a'; // Deep Dark Navy for target
                stroke = '#1d4ed8'; // Government Blue border
                labelColor = '#0f172a';
                radius = 24;
              } else if (isRisk) {
                fill = '#991b1b'; // Deep Crimson for mixers/risk
                stroke = '#7f1d1d';
                labelColor = '#991b1b';
                radius = 22;
              } else if (isVasp) {
                fill = '#166534'; // Forest Green for VASP clusters
                stroke = '#14532d';
                labelColor = '#166534';
                radius = 22;
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => setInspectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Subtle target outer indicator */}
                  {isTarget && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Main Node Body */}
                  <circle
                    r={radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-105"
                  />

                  {/* Hop Badge on top right of node */}
                  <circle
                    cx={radius - 4}
                    cy={-radius + 4}
                    r="7.5"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                  />
                  <text
                    x={radius - 4}
                    y={-radius + 7}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {node.hop}H
                  </text>

                  {/* Text Label Below Node */}
                  <text
                    y={radius + 13}
                    textAnchor="middle"
                    fill={labelColor}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    className="pointer-events-none"
                  >
                    {node.vaspName || (isTarget ? 'TARGET' : `${node.address.slice(0, 6)}...`)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 p-3 rounded-md bg-white border border-slate-300 text-xs font-mono space-y-1 pointer-events-none z-20 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{hoveredNode.label}</span>
              {hoveredNode.isVASP && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  VASP Verified
                </span>
              )}
            </div>
            <div className="text-slate-600 text-[11px] truncate max-w-xs">{hoveredNode.address}</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-800 pt-1 border-t border-slate-200 font-semibold">
              <span>Hop: {hoveredNode.hop}</span>
              <span>Volume: {hoveredNode.totalVolume.toFixed(2)} ETH</span>
              <span>TXs: {hoveredNode.txCount}</span>
            </div>
          </div>
        )}

        {/* Bottom Graph Institutional Legend */}
        <div className="absolute bottom-4 right-4 p-2.5 rounded-md bg-white border border-slate-200 flex items-center gap-4 text-[11px] font-mono z-10 shadow-subtle">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-900 border border-blue-600" />
            <span className="text-slate-700 font-medium">Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-700 border border-emerald-800" />
            <span className="text-slate-700 font-medium">VASP Cluster</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-600 border border-slate-700" />
            <span className="text-slate-700 font-medium">Intermediary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-700 border border-red-800" />
            <span className="text-slate-700 font-medium">High Risk / Mixer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
