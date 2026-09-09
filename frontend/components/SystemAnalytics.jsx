"use client";
import { useEffect, useState } from 'react';

export default function SystemAnalytics() {
  const [stats, setStats] = useState({ top_violated_rules: [], recent_scans: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';
        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const json = await res.json();
        if (json.data) setStats(json.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="skeleton w-full h-[420px] rounded-[16px]"></div>
        <div className="skeleton w-full h-[420px] rounded-[16px]"></div>
      </div>
    );
  }

  // Formatting helpers
  const formatStatus = (s) => {
    const str = String(s || '').toUpperCase();
    if (str.includes('PASS') || str.includes('COMPLIANT')) return { color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (str.includes('REVIEW')) return { color: 'text-amber-500', bg: 'bg-amber-500' };
    return { color: 'text-red-500', bg: 'bg-red-500' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Live Activity Feed */}
      <div className="bg-white dark:bg-[#11131a] rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[420px]">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Live Activity Feed</h3>
        <p className="text-[13px] text-slate-500 mb-6">Real-time log of scans processing across the network</p>
        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
          {(stats.recent_scans || []).slice(0, 8).map((scan, i) => {
            const statusStyle = formatStatus(scan.overall_compliance);
            return (
              <div key={scan.id || i} className="flex gap-4 items-start relative group cursor-pointer transition-all" onClick={() => window.location.href=`/results/${scan.id}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm ${statusStyle.bg}`}></div>
                  {i !== Math.min(stats.recent_scans.length, 8) - 1 && (
                    <div className="w-[2px] h-10 bg-slate-100 dark:bg-slate-800/80 my-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors"></div>
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate pr-2">
                    {scan.product_name || 'Unidentified Scan'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${statusStyle.color}`}>
                      {scan.overall_compliance || 'UNKNOWN'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(scan.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {(!stats.recent_scans || stats.recent_scans.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px]">
              No recent network activity.
            </div>
          )}
        </div>
      </div>

      {/* 2. Rule Violation Breakdown */}
      <div className="bg-white dark:bg-[#11131a] rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[420px]">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">System Violation Vectors</h3>
        <p className="text-[13px] text-slate-500 mb-6">Top Legal Metrology Act rules currently failing enforcement</p>
        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
          {stats.top_violated_rules?.map((rule, i) => {
             const maxCount = Math.max(...stats.top_violated_rules.map(r => r.count), 1);
             const pct = Math.max((rule.count / maxCount) * 100, 2); // Minimum 2% width for visibility
             return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-end text-[12px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-[80%] truncate pr-4" title={rule.rule_id}>
                    {rule.rule_id}
                  </span>
                  <span className="font-bold text-red-500 shrink-0">{rule.count} Flags</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
             );
          })}
          {(!stats.top_violated_rules || stats.top_violated_rules.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px]">
              No active violations detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
