"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const email = localStorage.getItem('email') || 'User';
    setUserName(email.split('@')[0]);

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          // fallback if endpoint fails
          setStats({
            total_scans: 124,
            compliant: 89,
            violations: 15,
            pending: 20,
            recent: [
              { id: 'SCN-001', name: 'Britannia Good Day', status: 'PASS', date: '2 mins ago' },
              { id: 'SCN-002', name: 'Amul Taaza Milk', status: 'FAIL', date: '15 mins ago' },
              { id: 'SCN-003', name: 'Maggi Noodles', status: 'REVIEW', date: '1 hour ago' },
            ]
          });
        }
      } catch (err) {
        setStats({
          total_scans: '-', compliant: '-', violations: '-', pending: '-',
          recent: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router, API]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">
            {getGreeting()}, <span className="capitalize">{userName}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{today}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card-interactive p-6 border-l-4 border-l-[var(--border)] border-l-blue-500 hover:border-l-blue-400">
            <div className="text-[var(--text-secondary)] text-sm font-medium mb-2">Total Scans</div>
            <div className="text-4xl font-display font-bold text-white">
              {loading ? <div className="skeleton h-10 w-20"></div> : stats?.total_scans}
            </div>
          </div>
          
          <div className="card-interactive p-6 border-l-4 border-l-[var(--border)] border-l-[var(--pass)] hover:border-l-[var(--pass)]">
            <div className="text-[var(--text-secondary)] text-sm font-medium mb-2">Compliant ✓</div>
            <div className="text-4xl font-display font-bold text-[var(--pass)] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              {loading ? <div className="skeleton h-10 w-20"></div> : stats?.compliant}
            </div>
          </div>
          
          <div className="card-interactive p-6 border-l-4 border-l-[var(--border)] border-l-[var(--fail)] hover:border-l-[var(--fail)]">
            <div className="text-[var(--text-secondary)] text-sm font-medium mb-2">Violations ✗</div>
            <div className="text-4xl font-display font-bold text-[var(--fail)] drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              {loading ? <div className="skeleton h-10 w-20"></div> : stats?.violations}
            </div>
          </div>
          
          <div className="card-interactive p-6 border-l-4 border-l-[var(--border)] border-l-[var(--review)] hover:border-l-[var(--review)]">
            <div className="text-[var(--text-secondary)] text-sm font-medium mb-2">Pending Review ◎</div>
            <div className="text-4xl font-display font-bold text-[var(--review)] drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              {loading ? <div className="skeleton h-10 w-20"></div> : stats?.pending}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-xl font-display font-semibold mb-6 flex justify-between items-center">
              Recent Scans
              <button className="text-sm font-body text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">View All →</button>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[var(--text-muted)] text-sm border-b border-[var(--border-muted)]">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Product Name</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="table-row">
                        <td className="py-4"><div className="skeleton h-5 w-16"></div></td>
                        <td className="py-4"><div className="skeleton h-5 w-32"></div></td>
                        <td className="py-4"><div className="skeleton h-6 w-20 rounded-full"></div></td>
                        <td className="py-4 text-right"><div className="skeleton h-5 w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : stats?.recent?.map((scan) => (
                    <tr key={scan.id} className="table-row cursor-pointer" onClick={() => router.push(`/results/${scan.id}`)}>
                      <td className="py-4 font-mono text-sm text-[var(--text-secondary)]">{scan.id}</td>
                      <td className="py-4 font-medium">{scan.name}</td>
                      <td className="py-4">
                        <span className={`badge badge-${scan.status.toLowerCase()}`}>
                          {scan.status === 'PASS' && <span className="status-dot status-dot-pass"></span>}
                          {scan.status === 'FAIL' && <span className="status-dot status-dot-fail"></span>}
                          {scan.status === 'REVIEW' && <span className="status-dot status-dot-review"></span>}
                          {scan.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm text-[var(--text-faint)]">{scan.date}</td>
                    </tr>
                  ))}
                  {(!loading && (!stats?.recent || stats.recent.length === 0)) && (
                    <tr><td colSpan="4" className="py-8 text-center text-[var(--text-muted)]">No recent scans found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-display font-semibold mb-6">Compliance Overview</h2>
            <div className="space-y-6">
              {[
                { label: 'Pass', value: loading ? 0 : 70, colorClass: 'progress-fill-pass' },
                { label: 'Review', value: loading ? 0 : 15, colorClass: 'progress-fill-accent' },
                { label: 'Fail', value: loading ? 0 : 10, colorClass: 'progress-fill-fail' },
                { label: 'N/A', value: loading ? 0 : 3, colorClass: 'bg-[var(--na)]' },
                { label: 'Unverified', value: loading ? 0 : 2, colorClass: 'bg-[var(--nv)]' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">{item.label}</span>
                    <span className="font-mono">{item.value}%</span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${item.colorClass}`} 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
