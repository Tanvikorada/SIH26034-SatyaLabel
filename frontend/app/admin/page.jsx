'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const MapWidget = dynamic(() => import('../../components/MapWidget'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [officers, setOfficers] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Interactive Map States
  const [mapMode, setMapMode] = useState('cluster');
  const [focusLocation, setFocusLocation] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (!token) {
      router.push('/login');
      return;
    }
    if (role !== 'admin') {
      toast.error('Access Denied. Admins only.');
      router.push('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${API}/dashboard/admin/officers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch admin data');
        
        setOfficers(json.data.officers || []);
        setMapData(json.data.mapData || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [router, API]);

  const handleFlyToOfficer = (officerName) => {
    const officerScans = mapData.filter(d => d.officer_name === officerName);
    if (officerScans.length > 0) {
      // Fly to their most recent scan
      setFocusLocation({ lat: officerScans[0].latitude, lng: officerScans[0].longitude });
      setMapMode('cluster'); // ensure clusters are on so they see the pin
      toast.success(`Flying to ${officerName}'s last scan...`);
    } else {
      toast('No GPS tagged scans found for this officer.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
        <header className="mb-10">
          <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Central Command</h1>
          <p className="text-[15px] text-text-secondary">System-wide monitoring and officer hierarchy.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="skeleton h-[400px] w-full rounded-2xl"></div>
            <div className="skeleton h-[400px] w-full rounded-2xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Officer Leaderboard */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-[18px] font-medium text-text-primary">Officer Leaderboard</h2>
                <span className="text-[11px] text-slate-400">Click a row to track officer on map</span>
              </div>
              <div className="glass rounded-[20px] overflow-hidden border border-[var(--color-border)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                        <th className="p-4 font-medium text-text-secondary">Officer</th>
                        <th className="p-4 font-medium text-text-secondary">Total Uploads</th>
                        <th className="p-4 font-medium text-text-secondary">Processed Scans</th>
                        <th className="p-4 font-medium text-text-secondary">Violations Caught</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {officers.map(officer => (
                        <tr 
                          key={officer.id} 
                          onClick={() => handleFlyToOfficer(officer.name)}
                          className="hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center text-white font-bold text-[12px]">
                                {officer.name ? officer.name.charAt(0).toUpperCase() : 'O'}
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">{officer.name}</p>
                                <p className="text-[12px] text-text-muted">{officer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 tabular-nums">{officer.total_batches || 0}</td>
                          <td className="p-4 tabular-nums">{officer.total_scans || 0}</td>
                          <td className="p-4 tabular-nums text-red-400 font-medium">{officer.non_compliant_scans || 0}</td>
                        </tr>
                      ))}
                      {officers.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-text-muted">No officers found in the system.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Live System Map */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-medium text-text-primary flex items-center gap-2">
                  Live Field Map
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                  </span>
                </h2>
                
                {/* Advanced Mode Toggles */}
                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
                  <button 
                    onClick={() => setMapMode('cluster')}
                    className={`text-[11px] px-3 py-1 rounded-md transition-all ${mapMode === 'cluster' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    Feed
                  </button>
                  <button 
                    onClick={() => setMapMode('heatmap')}
                    className={`text-[11px] px-3 py-1 rounded-md transition-all ${mapMode === 'heatmap' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    Threats
                  </button>
                </div>
              </div>

              <div className="glass rounded-[20px] p-2 border border-[var(--color-border)]">
                <div className="w-full h-[400px] rounded-[14px] overflow-hidden relative bg-slate-900">
                  {mapData.length > 0 ? (
                    <MapWidget 
                      markers={mapData} 
                      height="400px" 
                      mode={mapMode}
                      focusLocation={focusLocation}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[13px] gap-3">
                      <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      No geotagged scans yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
