"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function ThreatGraph() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';
        const res = await fetch(`${API}/dashboard/network`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error('Failed to fetch graph', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const handleNodeClick = useCallback(node => {
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, [fgRef]);

  if (loading) return <div className="skeleton w-full h-[500px] rounded-2xl"></div>;

  if (data.nodes.length === 0) {
    return <div className="w-full h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500">No network data available</div>;
  }

  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white font-bold tracking-tight text-lg drop-shadow-md">Kingpin Threat Network</h3>
        <p className="text-slate-400 text-xs">Real-time non-compliance syndicates</p>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes: data.nodes, links: data.edges }}
        nodeColor={node => {
          if (node.group === 'authority') return '#3b82f6';
          if (node.group === 'threat') return '#ef4444';
          if (node.group === 'brand') return '#f59e0b';
          if (node.group === 'violation') return '#f87171';
          return '#10b981';
        }}
        nodeRelSize={4}
        nodeVal={node => node.size || 5}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        nodeLabel="label"
        backgroundColor="#0f172a"
        cooldownTicks={100}
      />
    </div>
  );
}
