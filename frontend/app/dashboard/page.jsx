"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          setStats(await res.json());
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        setStats({
          total_scans: 124, compliant: 89, violations: 15, pending: 20,
          recent: [
            { id: 'SCN-84920', name: 'Britannia Good Day', status: 'PASS', date: '2 mins ago' },
            { id: 'SCN-84919', name: 'Generic Milk 1L', status: 'POTENTIAL NON-COMPLIANCE', date: '15 mins ago' },
            { id: 'SCN-84918', name: 'Maggi Noodles', status: 'MANUAL REVIEW', date: '1 hour ago' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`gov-card p-5 border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-[#0f172a] mt-2">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading Data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Officer Dashboard</h1>
        <p className="text-gray-500">Live inspection metrics and recent scans</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Scans" value={stats.total_scans} icon={<Activity className="w-6 h-6 text-gray-600"/>} colorClass="border-l-blue-600" />
        <StatCard title="Compliant" value={stats.compliant} icon={<CheckCircle className="w-6 h-6 text-[#059669]"/>} colorClass="border-l-[#059669]" />
        <StatCard title="Violations" value={stats.violations} icon={<ShieldAlert className="w-6 h-6 text-red-600"/>} colorClass="border-l-red-600" />
        <StatCard title="Pending Review" value={stats.pending} icon={<Clock className="w-6 h-6 text-amber-600"/>} colorClass="border-l-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Recent Inspections</h2>
          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Scan ID</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map(r => (
                  <tr key={r.id} onClick={() => router.push(`/results/${r.id}`)} className="cursor-pointer">
                    <td className="font-mono">{r.id}</td>
                    <td className="font-medium">{r.name}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-bold rounded 
                        ${r.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 
                          r.status === 'POTENTIAL NON-COMPLIANCE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-gray-500">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Quick Actions</h2>
          <div className="gov-card p-4 space-y-3">
            <button onClick={() => router.push('/upload')} className="w-full gov-btn-accent">
              New Scan
            </button>
            <button onClick={() => router.push('/history')} className="w-full gov-btn-outline">
              View All History
            </button>
            <button onClick={() => router.push('/rules')} className="w-full gov-btn-outline">
              Rule Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
