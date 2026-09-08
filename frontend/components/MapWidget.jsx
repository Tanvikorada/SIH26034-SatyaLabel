'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a premium custom glowing marker using DivIcon
const createGlowingMarker = () => {
  return L.divIcon({
    className: 'custom-glow-marker',
    html: `<div style="
      width: 14px; 
      height: 14px; 
      background-color: #10b981; 
      border-radius: 50%; 
      box-shadow: 0 0 10px 2px rgba(16, 185, 129, 0.6), 0 0 20px 4px rgba(16, 185, 129, 0.4);
      border: 2px solid #fff;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Component to handle auto-fitting bounds when markers change
const MapBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude || m.lat, m.longitude || m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, markers]);
  return null;
};

export default function MapWidget({ markers = [], height = '400px' }) {
  const defaultCenter = markers.length > 0 
    ? [markers[0].latitude || markers[0].lat, markers[0].longitude || markers[0].lng] 
    : [20.5937, 78.9629]; // Default to India if empty

  return (
    <div style={{ height, width: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#0B101E' }}
        zoomControl={false}
      >
        {/* CARTO Dark Matter Premium Tiles - Free, no API key, extremely sleek */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            position={[marker.latitude || marker.lat, marker.longitude || marker.lng]}
            icon={createGlowingMarker()}
          >
            {marker.popup && (
              <Popup className="premium-popup">
                <div style={{ padding: '4px', fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                  {marker.popup}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        <MapBounds markers={markers} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .premium-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .premium-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        /* Hide Leaflet attribution in small widgets to keep it clean (optional, but requested premium look) */
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.4) !important;
          color: rgba(255,255,255,0.5) !important;
        }
        .leaflet-control-attribution a {
          color: rgba(255,255,255,0.7) !important;
        }
      `}</style>
    </div>
  );
}
