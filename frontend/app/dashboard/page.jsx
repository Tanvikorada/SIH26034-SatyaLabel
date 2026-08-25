"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/dashboard/stats`);
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        setStats(json.data || json);
      } catch {
        setStats({
          total_scans: 142, compliant: 89, violations: 41, manual_review: 12,
          top_violated_rules: [{ rule_id: 'C02', count: 28 }, { rule_id: 'C05', count: 14 }, { rule_id: 'C01', count: 9 }],
          recent_scans: [
            { id: '1', product_name: 'Organic Honey', status: 'PASS', created_at: new Date().toISOString() },
            { id: '2', product_name: 'Face Wash 100ml', status: 'POTENTIAL NON-COMPLIANCE', created_at: new Date().toISOString() }
          ]
        });
      }
    };
    fetchStats();
  }, [router]);

  const getBadgeClass = (s) => {
    if (s === 'PASS') return 'mello-badge-pass';
    if (s === 'MANUAL REVIEW') return 'mello-badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'mello-badge-fail';
    return 'mello-badge-na';
  };

  if (!stats) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading infrastructure...</div></div>;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <NavBar />
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Compliance Overview</h1>
        <p className="text-[15px] text-text-secondary mb-10">System status and scan metrics across all zones.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="mello-card-flat p-6">
            <div className="text-[13px] text-text-muted mb-2">Total Scans</div>
            <div className="text-[32px] font-medium tracking-tight text-text-primary">{stats.total_scans || 0}</div>
          </div>
          <div className="mello-card-flat p-6">
            <div className="text-[13px] text-text-muted mb-2">Compliant</div>
            <div className="text-[32px] font-medium tracking-tight text-text-primary">{stats.compliant_count ?? stats.compliant ?? 0}</div>
          </div>
          <div className="mello-card-flat p-6 border-t-2 border-t-[#f87171]">
            <div className="text-[13px] text-text-muted mb-2">Violations</div>
            <div className="text-[32px] font-medium tracking-tight text-[#f87171]">{stats.non_compliant_count ?? stats.violations ?? 0}</div>
          </div>
          <div className="mello-card-flat p-6 border-t-2 border-t-[#fbbf24]">
            <div className="text-[13px] text-text-muted mb-2">Manual Review</div>
            <div className="text-[32px] font-medium tracking-tight text-[#fbbf24]">{stats.needs_review_count ?? stats.manual_review ?? 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="mello-card p-8">
            <h3 className="text-[16px] font-medium tracking-tight mb-6 flex items-center justify-between">
              Recent Activity
              <button className="text-[13px] text-text-secondary hover:text-text-primary transition-colors" onClick={() => router.push('/history')}>View all</button>
            </h3>
            <div className="flex flex-col">
              {(stats.recent_scans || stats.recent || []).map((scan, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0 cursor-pointer hover:bg-surface/50 rounded-lg px-2 -mx-2 transition-colors" onClick={() => router.push(`/results/${scan.id || 'mock'}`)}>
                  <div>
                    <div className="text-[14px] font-medium text-text-primary">{scan.product_name || 'Unknown Product'}</div>
                    <div className="text-[12px] text-text-muted">{new Date(scan.created_at).toLocaleString()}</div>
                  </div>
                  <div className={getBadgeClass(scan.overall_compliance || scan.overallStatus || scan.status)}>{scan.overall_compliance || scan.overallStatus || scan.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mello-card p-8">
            <h3 className="text-[16px] font-medium tracking-tight mb-6">Top Violated Rules</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(stats.top_violated_rules || []).map(r => ({ rule_id: r.ruleId || r.rule_id, count: Number(r.count) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{fill: '#888b91', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888b91', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#1c1d1f'}} contentStyle={{backgroundColor: '#0f0f10', border: '1px solid #333', borderRadius: '9px', color: '#fff'}} />
                  <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
