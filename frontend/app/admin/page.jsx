'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const [officers, setOfficers] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <h2 className="text-[18px] font-medium text-text-primary">Officer Leaderboard</h2>
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
                        <tr key={officer.id} className="hover:bg-[var(--color-surface)] transition-colors">
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
              <h2 className="text-[18px] font-medium text-text-primary flex items-center justify-between">
                Live Field Map
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                </span>
              </h2>
              <div className="glass rounded-[20px] p-2 border border-[var(--color-border)]">
                <div className="w-full h-[400px] rounded-[14px] overflow-hidden relative bg-slate-900">
                  {mapData.length > 0 ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight="0" 
                      marginWidth="0" 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(...mapData.map(d => d.longitude)) - 0.5},${Math.min(...mapData.map(d => d.latitude)) - 0.5},${Math.max(...mapData.map(d => d.longitude)) + 0.5},${Math.max(...mapData.map(d => d.latitude)) + 0.5}&layer=mapnik`}
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(100%)' }}
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[13px] gap-3">
                      <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      No geotagged scans yet.
                    </div>
                  )}
                  {/* Overlay markers manually since iframe embed only supports 1 marker */}
                  {mapData.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[var(--color-border)] shadow-lg flex items-center gap-2">
                        <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>
                        <span className="text-[11px] font-medium">{mapData.length} Recent Geotags</span>
                      </div>
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
