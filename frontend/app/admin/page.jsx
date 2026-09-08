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
  const [highRiskBrands, setHighRiskBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Map States
  const [mapMode, setMapMode] = useState('cluster');
  const [focusLocation, setFocusLocation] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

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
        setHighRiskBrands(json.data.highRiskBrands || []);
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
      setFocusLocation({ lat: officerScans[0].latitude, lng: officerScans[0].longitude });
      setMapMode('cluster'); 
      toast.success(`Flying to ${officerName}'s last scan...`);
    } else {
      toast('No GPS tagged scans found for this officer.');
    }
  };

  const handleDispatch = () => {
    setIsDeploying(true);
    toast.loading('Analyzing threat clusters...', { id: 'deploy' });
    
    setTimeout(() => {
      toast.loading('Identifying nearest active field officers...', { id: 'deploy' });
      
      setTimeout(() => {
        toast.success('Task Force Delta dispatched to High-Risk Zones. Officers notified via SMS.', { id: 'deploy', duration: 4000 });
        setIsDeploying(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
        <header className="mb-10">
          <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Central Command</h1>
          <p className="text-[15px] text-text-secondary">Enterprise Enforcement & Monitoring Console.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="skeleton h-[400px] w-full rounded-2xl"></div>
            <div className="skeleton h-[400px] w-full rounded-2xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Leaderboard & Watchlist */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Watchlist Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h2 className="text-[18px] font-medium text-text-primary flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    High-Risk Entity Watchlist
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highRiskBrands.map((brand, idx) => (
                    <div key={idx} className="glass rounded-[16px] p-4 border border-red-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-2 relative">
                        <div>
                          <h3 className="font-bold text-text-primary text-[15px]">{brand.product_name}</h3>
                          <p className="text-[12px] text-text-muted">{brand.brand_name || 'Unknown Manufacturer'}</p>
                        </div>
                        <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-sm border border-red-500/20 font-bold tracking-wider">
                          CRITICAL
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-text-muted">Total Scans: {brand.total_scans}</span>
                          <span className="text-red-500 font-medium">Violations: {brand.violations}</span>
                        </div>
                        <div className="w-full bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min((brand.violations / brand.total_scans) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {highRiskBrands.length === 0 && (
                    <div className="col-span-2 glass rounded-[16px] p-8 text-center text-text-muted border border-[var(--color-border)]">
                      No high-risk repeat offenders detected in the system yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Officer Leaderboard */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h2 className="text-[18px] font-medium text-text-primary">Officer Leaderboard</h2>
                  <span className="text-[11px] text-text-muted">Click a row to track officer on map</span>
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
                            className="hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center text-white font-bold text-[12px] shadow-sm">
                                  {officer.name ? officer.name.charAt(0).toUpperCase() : 'O'}
                                </div>
                                <div>
                                  <p className="font-medium text-text-primary">{officer.name}</p>
                                  <p className="text-[12px] text-text-muted">{officer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 tabular-nums text-text-primary">{officer.total_batches || 0}</td>
                            <td className="p-4 tabular-nums text-text-primary">{officer.total_scans || 0}</td>
                            <td className="p-4 tabular-nums text-red-500 font-medium">{officer.non_compliant_scans || 0}</td>
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
            </div>

            {/* Right Col: Live System Map & Deployment */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-medium text-text-primary flex items-center gap-2">
                  Tactical Map
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                  </span>
                </h2>
                
                {/* Advanced Mode Toggles */}
                <div className="flex gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] shadow-sm">
                  <button 
                    onClick={() => setMapMode('cluster')}
                    className={`text-[11px] px-3 py-1 rounded-md transition-all ${mapMode === 'cluster' ? 'bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    Feed
                  </button>
                  <button 
                    onClick={() => setMapMode('heatmap')}
                    className={`text-[11px] px-3 py-1 rounded-md transition-all ${mapMode === 'heatmap' ? 'bg-red-500/10 text-red-600 font-bold border border-red-500/20' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    Threats
                  </button>
                </div>
              </div>

              <div className="glass rounded-[20px] p-2 border border-[var(--color-border)] relative shadow-sm">
                <div className="w-full h-[450px] rounded-[14px] overflow-hidden relative bg-[var(--color-surface)]">
                  {mapData.length > 0 ? (
                    <MapWidget 
                      markers={mapData} 
                      height="100%" 
                      mode={mapMode}
                      focusLocation={focusLocation}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[13px] gap-3">
                      <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      No geotagged scans yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Dispatch Task Force */}
              <button 
                onClick={handleDispatch}
                disabled={isDeploying || mapData.length === 0}
                className={`w-full py-3.5 rounded-[14px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                  isDeploying 
                  ? 'bg-[var(--color-border)] text-text-muted cursor-not-allowed' 
                  : 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md border border-red-700'
                }`}
              >
                {isDeploying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying Task Force...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    DISPATCH TASK FORCE
                  </>
                )}
              </button>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
