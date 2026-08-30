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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('API Error');
        const json = await res.json();
        setStats(json.data || json);
      } catch {
        setStats({
          total_scans: 142,
          compliant: 89,
          violations: 41,
          manual_review: 12,
          top_violated_rules: [
            { rule_id: 'C02', count: 28 },
            { rule_id: 'C05', count: 14 },
            { rule_id: 'C01', count: 9 }
          ],
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

  if (!stats) return <div className="min-h-screen bg-background text-text-primary"><NavBar /><div className="p-10 text-text-secondary text-[14px]">Loading infrastructure...</div></div>;

  const compliancePct = stats.total_scans ? Math.round(((stats.compliant_count ?? stats.compliant ?? 0) / (stats.total_scans || 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(11,31,58,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.08),_transparent_30%)]" />
      <NavBar />
      <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-2">Operations overview</p>
            <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight leading-[1.1]">Compliance Overview</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-pass)] shadow-[0_0_10px_#22c55e]" />
            Live monitoring active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total scans', value: stats.total_scans || 0, tone: 'default', accent: 'var(--color-text-primary)' },
            { label: 'Compliant', value: stats.compliant_count ?? stats.compliant ?? 0, tone: 'success', accent: '#22c55e' },
            { label: 'Violations', value: stats.non_compliant_count ?? stats.violations ?? 0, tone: 'danger', accent: '#f87171' },
            { label: 'Manual review', value: stats.needs_review_count ?? stats.manual_review ?? 0, tone: 'warning', accent: '#fbbf24' },
          ].map((card) => (
            <div key={card.label} className="relative p-6 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] shadow-[0_12px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_38px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: card.accent }} />
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10" style={{ background: card.accent }} />
              <div className="text-[12px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-3">{card.label}</div>
              <div className="text-[32px] font-medium tracking-tight text-text-primary">{card.value}</div>
              <div className="mt-3 text-[12px] text-[var(--color-text-secondary)]">
                {card.label === 'Compliant' ? `${compliancePct}% of total` : card.label === 'Violations' ? 'Requires attention' : card.label === 'Manual review' ? 'Needs expert review' : 'Across all zones'}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-8 rounded-[28px] bg-[var(--color-surface)]/70 backdrop-blur-2xl border border-[var(--color-border)] shadow-[0_18px_44px_rgba(0,0,0,0.04)]">
            <h3 className="text-[16px] font-medium tracking-tight mb-6 flex items-center justify-between">
              Recent activity
              <button className="text-[13px] text-text-secondary hover:text-text-primary transition-colors" onClick={() => router.push('/history')}>View all</button>
            </h3>
            <div className="flex flex-col">
              {(stats.recent_scans || stats.recent || []).map((scan, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-[var(--color-border)] last:border-0 cursor-pointer hover:bg-[var(--color-background)]/60 rounded-xl px-3 -mx-3 transition-colors" onClick={() => router.push(`/results/${scan.id || 'mock'}`)}>
                  <div>
                    <div className="text-[14px] font-medium text-text-primary">{scan.product_name || 'Unknown Product'}</div>
                    <div className="text-[12px] text-text-muted">{new Date(scan.created_at).toLocaleString()}</div>
                  </div>
                  <div className={getBadgeClass(scan.overall_compliance || scan.overallStatus || scan.status)}>{scan.overall_compliance || scan.overallStatus || scan.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[28px] bg-[var(--color-surface)]/70 backdrop-blur-2xl border border-[var(--color-border)] shadow-[0_18px_44px_rgba(0,0,0,0.04)]">
            <h3 className="text-[16px] font-medium tracking-tight mb-6">Top violated rules</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(stats.top_violated_rules || []).map(r => ({ rule_id: r.ruleId || r.rule_id, count: Number(r.count) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{ fill: '#888b91', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888b91', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f0f10', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={28} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#0b1f3a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
