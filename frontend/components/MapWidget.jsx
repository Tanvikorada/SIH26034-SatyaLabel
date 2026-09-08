'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Standard Premium Radar Marker
const createGlowingMarker = (compliance) => {
  let color = '#10b981'; // Pass -> Green
  if (compliance === 'POTENTIAL NON-COMPLIANCE' || compliance === 'fail') color = '#ef4444'; // Fail -> Red
  if (compliance === 'MANUAL REVIEW') color = '#f59e0b'; // Review -> Amber

  return L.divIcon({
    className: 'custom-glow-marker',
    html: `<div style="
      width: 14px; 
      height: 14px; 
      background-color: ${color}; 
      border-radius: 50%; 
      box-shadow: 0 0 10px 2px ${color}80, 0 0 20px 4px ${color}60;
      border: 2px solid #fff;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Map Controller for auto-fitting and programmatic Fly-To
const MapController = ({ markers, focusLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusLocation) {
      map.flyTo([focusLocation.lat, focusLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [focusLocation, map]);

  useEffect(() => {
    // Only fit bounds initially or if we are not actively focusing on one location
    if (!focusLocation && markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude || m.lat, m.longitude || m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, markers, focusLocation]);

  return null;
};

export default function MapWidget({ markers = [], height = '400px', focusLocation = null, mode = 'cluster' }) {
  const defaultCenter = markers.length > 0 
    ? [markers[0].latitude || markers[0].lat, markers[0].longitude || markers[0].lng] 
    : [20.5937, 78.9629]; // Default India

  const getStatusColor = (status) => {
    if (status === 'POTENTIAL NON-COMPLIANCE' || status === 'fail') return '#ef4444';
    if (status === 'MANUAL REVIEW') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#0B101E' }}
        zoomControl={false}
      >
        {/* Google Maps Satellite Hybrid Tiles - Extremely Premium */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />
        
        {/* MODE: CLUSTER */}
        {mode === 'cluster' && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            showCoverageOnHover={false}
          >
            {markers.map((marker, idx) => (
              <Marker 
                key={idx} 
                position={[marker.latitude || marker.lat, marker.longitude || marker.lng]}
                icon={createGlowingMarker(marker.overall_compliance)}
              >
                <Popup className="premium-popup">
                  <div className="flex flex-col gap-2 w-[220px]">
                    {/* Image Thumbnail */}
                    {marker.original_image_url ? (
                      <div className="w-full h-[120px] rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                        <img src={marker.original_image_url} alt="Scan Evidence" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-[80px] rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                        NO EVIDENCE IMAGE
                      </div>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex justify-between items-start mt-1">
                      <div>
                        <p className="text-[12px] font-bold text-white leading-tight">Field Scan</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{marker.officer_name || 'System'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider" style={{
                          backgroundColor: `${getStatusColor(marker.overall_compliance)}20`,
                          color: getStatusColor(marker.overall_compliance),
                          border: `1px solid ${getStatusColor(marker.overall_compliance)}40`
                        }}>
                          {marker.compliance_score ? marker.compliance_score + '%' : (marker.overall_compliance === 'PASS' ? '100%' : 'FAIL')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {/* MODE: HEATMAP / THREAT MAP */}
        {mode === 'heatmap' && markers.map((marker, idx) => {
           const color = getStatusColor(marker.overall_compliance);
           return (
            <CircleMarker
              key={`heat-${idx}`}
              center={[marker.latitude || marker.lat, marker.longitude || marker.lng]}
              radius={18}
              fillColor={color}
              color={color}
              weight={0}
              fillOpacity={marker.overall_compliance === 'POTENTIAL NON-COMPLIANCE' ? 0.6 : 0.2}
            >
              <Popup className="premium-popup">
                <div className="text-[12px] font-bold text-white text-center">Threat Level Detected</div>
              </Popup>
            </CircleMarker>
           );
        })}
        
        <MapController markers={markers} focusLocation={focusLocation} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        /* Custom Rich Popup */
        .premium-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5) !important;
          padding: 4px !important;
        }
        .premium-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .premium-popup .leaflet-popup-content {
          margin: 10px !important;
        }
        
        /* Marker Cluster Customization */
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
          background-color: rgba(16, 185, 129, 0.3) !important;
          border-radius: 50%;
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
          background-color: rgba(16, 185, 129, 0.8) !important;
          color: white !important;
          font-weight: bold;
          font-family: inherit;
          border: 2px solid #fff;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
