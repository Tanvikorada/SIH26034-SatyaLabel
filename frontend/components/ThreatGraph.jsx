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
    return <div className="w-full h-[500px] glass rounded-2xl flex items-center justify-center text-text-muted">No network data available</div>;
  }

  return (
    <div className="w-full h-[500px] glass rounded-2xl overflow-hidden relative shadow-sm" ref={containerRef}>
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <h3 className="text-text-primary font-bold tracking-tight text-lg">Kingpin Threat Network</h3>
        <p className="text-text-muted text-xs">Real-time non-compliance syndicates</p>
      </div>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={500}
        graphData={{ nodes: data.nodes, links: data.edges }}
        nodeLabel="name"
        nodeColor={node => {
          if (node.type === 'manufacturer') return '#F59E0B';
          if (node.type === 'brand') return '#6366f1';
          return '#F87171';
        }}
        nodeRelSize={6}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        linkWidth={1.5}
        backgroundColor="rgba(0,0,0,0)"
        onNodeClick={node => {
          console.log('Node clicked:', node);
          handleNodeClick(node);
        }}
        cooldownTicks={100}
      />
    </div>
  );
}
