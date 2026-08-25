"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch(${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/dashboard/stats);
      const json = await res.json();
      const d = json.data || json;
      setStats(d);
    } catch {
      // Offline fallback
      setStats({
        total_scans: 142,
        compliant: 89,
        violations: 41,
        manual_review: 12,
        top_violated_rules: [
          { rule_id: 'C02', count: 28 },
          { rule_id: 'C05', count: 14 },
          { rule_id: 'C01', count: 9 },
        ],
        recent_scans: [
          { id: '1', product_name: 'Organic Honey', status: 'PASS', created_at: new Date().toISOString() },
          { id: '2', product_name: 'Face Wash 100ml', status: 'POTENTIAL NON-COMPLIANCE', created_at: new Date().toISOString() }
        ]
      });
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'PASS') return 'badge-pass';
    if (status === 'MANUAL REVIEW') return 'badge-review';
    if (status === 'POTENTIAL NON-COMPLIANCE') return 'badge-fail';
    return 'badge-na';
  };

  if (!stats) return <div className="p-8"><NavBar/><div className="mt-8 text-fog text-[14px]">Loading infrastructure...</div></div>;

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <div className="max-w-[1200px] mx-auto px-6 py-[80px]">
        <h1 className="text-[38px] leading-[1.15] tracking-[-1.14px] mb-2">Compliance Overview</h1>
        <p className="text-[16px] text-fog mb-12">System status and scan metrics across all zones.</p>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px] mb-[80px]">
          <div className="privy-card">
            <div className="text-[14px] text-fog mb-2">Total Scans</div>
            <div className="text-[38px] leading-[1.15] tracking-[-1.14px]">{stats.total_scans}</div>
          </div>
          <div className="privy-card">
            <div className="text-[14px] text-fog mb-2">Compliant</div>
            <div className="text-[38px] leading-[1.15] tracking-[-1.14px]">{stats.compliant}</div>
          </div>
          <div className="privy-card">
            <div className="text-[14px] text-fog mb-2">Violations</div>
            <div className="text-[38px] leading-[1.15] tracking-[-1.14px] text-red-600">{stats.violations}</div>
          </div>
          <div className="privy-card">
            <div className="text-[14px] text-fog mb-2">Manual Review</div>
            <div className="text-[38px] leading-[1.15] tracking-[-1.14px] text-amber-600">{stats.manual_review}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
          {/* Recent Scans */}
          <div className="privy-card">
            <h3 className="text-[20px] font-bold tracking-[-0.4px] mb-6">Recent Activity</h3>
            <div className="flex flex-col gap-2">
              {(stats.recent_scans || stats.recent || []).map((scan, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-ash last:border-0 cursor-pointer hover:bg-canvas/80" onClick={() => router.push(/results/)}>
                  <div>
                    <div className="text-[15px] font-medium">{scan.product_name || 'Unknown Product'}</div>
                    <div className="text-[12px] text-fog">{new Date(scan.created_at).toLocaleString()}</div>
                  </div>
                  <div className={getBadgeClass(scan.status)}>{scan.status}</div>
                </div>
              ))}
            </div>
            <button className="btn-ghost w-full mt-6" onClick={() => router.push('/history')}>View all history →</button>
          </div>

          {/* Top Violations Chart */}
          <div className="privy-card">
            <h3 className="text-[20px] font-bold tracking-[-0.4px] mb-6">Top Violated Rules</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_violated_rules || []}>
                  <XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{fill: '#73737c', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#73737c', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#d9d9d9', opacity: 0.2}} contentStyle={{borderRadius: '8px', border: '1px solid #d9d9d9', boxShadow: 'none'}} />
                  <Bar dataKey="count" fill="#010110" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
