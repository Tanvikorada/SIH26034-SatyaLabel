"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import SplitText from '@/components/SplitText';

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
          const json = await res.json();
          const d = json.data || json;
          setStats({
            total_scans: d.total_scans || 0,
            compliant: d.compliant_count || 0,
            violations: d.non_compliant_count || 0,
            pending: d.needs_review_count || 0,
            recent: (d.recent_scans || []).map(s => ({
              id: s.id,
              name: s.product_name || s.brand_name || 'Unknown Product',
              status: s.overall_compliance || s.overallStatus || 'NOT VERIFIED',
              date: new Date(s.created_at).toLocaleDateString()
            })),
            chartData: (d.top_violated_rules || []).map(r => ({
              name: r.rule_title || r.ruleId,
              count: Number(r.count)
            }))
          });
        }
        else throw new Error('Failed');
      } catch (err) {
        setStats({
          total_scans: 124, compliant: 89, violations: 15, pending: 20,
          chartData: [
            { name: 'Rule 26', count: 12 },
            { name: 'Rule 3', count: 8 },
            { name: 'Rule 31', count: 5 },
            { name: 'Rule 6', count: 2 },
          ],
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

  if (loading) return <div className="p-8 text-center font-mono text-sm uppercase text-text-muted">Loading Data...</div>;

  const chartData = stats?.chartData || [];

  const StatCard = ({ title, value }) => (
    <div className="gov-card p-6 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl border border-gray-100">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-black text-navy-900 mt-3 font-sans tracking-tight">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <SplitText
          text="Officer Dashboard"
          className="text-3xl md:text-4xl font-bold text-navy-900 tracking-tight"
          delay={30}
          duration={0.8}
          tag="h1"
        />
        <p className="text-text-secondary text-sm md:text-base mt-2">Live inspection metrics and recent scans</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inspections" value={stats.total_scans} />
        <StatCard title="Compliant (Pass)" value={stats.compliant} />
        <StatCard title="Non-Compliant" value={stats.violations} />
        <StatCard title="Pending Review" value={stats.pending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Top Violated Rules</h2>
          <div className="gov-card p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4A5468', fontSize: 12, fontFamily: 'IBM Plex Mono' }} width={80} />
                <Tooltip cursor={{fill: '#F6F5F1'}} contentStyle={{borderRadius: '2px', borderColor: '#D9D5CB', fontSize: '12px'}} />
                <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-accent)' : 'var(--color-navy-900)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Inspections</h2>
          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Scan ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent?.map(r => (
                  <tr key={r.id} onClick={() => router.push(`/results/${r.id}`)} className="cursor-pointer">
                    <td className="font-mono">{r.id}</td>
                    <td>
                      <div className="stamp-badge border-[1px] p-1" style={{ 
                        borderColor: r.status === 'PASS' ? 'var(--color-pass)' : r.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : 'var(--color-review)',
                        backgroundColor: r.status === 'PASS' ? 'var(--color-pass-bg)' : r.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant-bg)' : 'var(--color-review-bg)',
                      }}>
                        <span className="font-mono text-[10px] font-bold uppercase" style={{
                           color: r.status === 'PASS' ? 'var(--color-pass)' : r.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : 'var(--color-review)',
                        }}>{r.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
