'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

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

  const generateLegalNotice = (marker) => {
    toast.loading('Drafting official legal notice...', { id: 'legal' });
    
    // Parse extracted data if available
    let extracted = {};
    if (marker.extracted_data) {
      try {
        extracted = typeof marker.extracted_data === 'string' ? JSON.parse(marker.extracted_data) : marker.extracted_data;
      } catch (e) {}
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 30, 30);
    doc.text('SHOW CAUSE NOTICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD AND PUBLIC DISTRIBUTION', 105, 28, { align: 'center' });
    doc.text('DEPARTMENT OF CONSUMER AFFAIRS', 105, 34, { align: 'center' });
    
    doc.line(20, 40, 190, 40);

    // Metadata
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Reference No: SCN-${Math.floor(Math.random() * 900000) + 100000}`, 20, 56);
    doc.text(`Field Officer: ${marker.officer_name || 'System Generated'}`, 20, 62);
    doc.text(`GPS Coordinates: ${marker.latitude}, ${marker.longitude}`, 20, 68);

    // Subject
    doc.setFont('helvetica', 'bold');
    doc.text('SUBJECT: Violation of the Legal Metrology (Packaged Commodities) Rules, 2011', 20, 80);

    // Body
    doc.setFont('helvetica', 'normal');
    const manufacturer = extracted.manufacturer_name || extracted.importer_name || 'The Manufacturer / Packer';
    const product = extracted.product_name || 'Unidentified Product';
    
    const bodyText = `To,\n${manufacturer}\n\nWhereas, during an official field inspection conducted at the above-mentioned GPS coordinates on ${new Date(marker.created_at).toLocaleDateString()}, a product identified as "${product}" manufactured/packed by your entity was inspected by our field officer.\n\nUpon AI-assisted verification (Scan ID: ${marker.scan_id}), the product package was found to be NON-COMPLIANT with the mandatory declarations required under the Legal Metrology (Packaged Commodities) Rules, 2011.\n\nThe compliance engine calculated a Confidence Score of ${marker.compliance_score || 0}%, explicitly flagging critical missing or obscured information.\n\nYou are hereby directed to show cause within 15 days of the receipt of this notice as to why penal action should not be initiated against your company under Section 36 of the Legal Metrology Act, 2009.`;

    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, 95);

    // Footer Signature
    doc.setFont('helvetica', 'bold');
    doc.text('AUTHORIZED SIGNATORY', 150, 230);
    doc.setFont('helvetica', 'normal');
    doc.text('Central Enforcement Directorate', 150, 236);
    doc.text('SatyaLabel Command Center', 150, 242);

    setTimeout(() => {
      doc.save(`Legal_Notice_${marker.scan_id}.pdf`);
      toast.success('Legal Notice generated and downloaded.', { id: 'legal' });
    }, 1000);
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#0B101E' }}
        zoomControl={false}
      >
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
                  <div className="flex flex-col w-[220px]">
                    {/* Image Thumbnail */}
                    {marker.original_image_url ? (
                      <div className="w-full h-[120px] rounded-t-lg overflow-hidden border-b border-slate-700 bg-slate-900 relative">
                        <img src={marker.original_image_url} alt="Scan Evidence" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono border border-slate-600">
                          ID: {marker.scan_id}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[80px] rounded-t-lg border-b border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                        NO EVIDENCE IMAGE
                      </div>
                    )}
                    
                    <div className="p-3">
                      {/* Meta Info */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[13px] font-bold text-white leading-tight">Field Scan</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{marker.officer_name || 'System'}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider" style={{
                            backgroundColor: `${getStatusColor(marker.overall_compliance)}20`,
                            color: getStatusColor(marker.overall_compliance),
                            border: `1px solid ${getStatusColor(marker.overall_compliance)}40`
                          }}>
                            {marker.overall_compliance === 'POTENTIAL NON-COMPLIANCE' ? 'FAIL' : (marker.overall_compliance || 'UNKNOWN').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Automated Enforcement Action */}
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`, '_blank')}
                          className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          NAVIGATE TO TARGET
                        </button>

                        {(marker.overall_compliance === 'POTENTIAL NON-COMPLIANCE' || marker.overall_compliance === 'fail') && (
                          <button 
                            onClick={() => generateLegalNotice(marker)}
                            className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            ISSUE LEGAL NOTICE
                          </button>
                        )}
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
                <div className="text-[12px] font-bold text-white text-center p-2">Threat Level Detected</div>
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
          border-radius: 10px !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .premium-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .premium-popup .leaflet-popup-content {
          margin: 0 !important;
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
