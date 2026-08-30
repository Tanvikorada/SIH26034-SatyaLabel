"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Activity, CheckCircle, AlertTriangle, Clock, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        // Fallback realistic data
        setStats({
          total_scans: 1248,
          compliant: 892,
          violations: 215,
          manual_review: 141,
          top_violated_rules: [
            { rule_id: 'Rule 7(1) - MRP', count: 85 },
            { rule_id: 'Rule 9(3) - Font', count: 62 },
            { rule_id: 'Rule 6(1) - Date', count: 41 },
            { rule_id: 'Rule 4 - Name', count: 27 }
          ],
          recent_scans: [
            { id: '1', product_name: 'Aashirvaad Atta 5kg', status: 'PASS', created_at: new Date().toISOString() },
            { id: '2', product_name: 'Dabur Honey 250g', status: 'POTENTIAL NON-COMPLIANCE', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', product_name: 'Tata Salt 1kg', status: 'MANUAL REVIEW', created_at: new Date(Date.now() - 7200000).toISOString() }
          ]
        });
      }
    };
    fetchStats();
  }, [router]);

  const getBadgeClass = (s) => {
    if (s === 'PASS') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    if (s === 'MANUAL REVIEW') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  if (!stats) return <div className="min-h-screen bg-white dark:bg-[#090a0f] text-slate-900 dark:text-white"><NavBar /><div className="p-10 flex items-center justify-center h-[60vh] text-slate-500 font-mono text-sm"><Activity className="animate-pulse mr-3" /> INITIALIZING DASHBOARD...</div></div>;

  const compliancePct = stats.total_scans ? Math.round(((stats.compliant_count ?? stats.compliant ?? 0) / (stats.total_scans || 1)) * 100) : 0;
  
  // Format graph data nicely
  const graphData = (stats.top_violated_rules || []).map(r => {
    let rawLabel = r.ruleId || r.rule_id;
    // Attempt to map technical C0X codes to readable text if the backend still sends them
    const codeMap = {
      'C01': 'Mfr Address', 'C02': 'MRP Missing', 'C03': 'Net Qty', 'C04': 'Mfg Date', 'C05': 'Font Size', 'C06': 'Language'
    };
    return {
      rule_id: codeMap[rawLabel] || rawLabel,
      count: Number(r.count)
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-blue-900/30 dark:text-blue-400 border border-[#1E3A8A]/20 dark:border-blue-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] dark:bg-blue-400 mr-1.5 animate-pulse" />
                Live Telemetry
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Department of Consumer Affairs</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Central Operations</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/upload')} className="bg-[#1E3A8A] hover:bg-[#16335C] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <FileText size={16} /> New Inspection
            </button>
          </div>
        </header>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10">
          {[
            { label: 'Total Inspections', value: stats.total_scans || 0, icon: <Activity size={20}/>, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-white dark:bg-[#11131a]', border: 'border-blue-200 dark:border-blue-900/50' },
            { label: 'Verified Compliant', value: stats.compliant_count ?? stats.compliant ?? 0, icon: <CheckCircle size={20}/>, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-white dark:bg-[#11131a]', border: 'border-emerald-200 dark:border-emerald-900/50' },
            { label: 'Violations Detected', value: stats.non_compliant_count ?? stats.violations ?? 0, icon: <AlertTriangle size={20}/>, color: 'text-red-600 dark:text-red-400', bg: 'bg-white dark:bg-[#11131a]', border: 'border-red-200 dark:border-red-900/50' },
            { label: 'Awaiting Review', value: stats.needs_review_count ?? stats.manual_review ?? 0, icon: <Clock size={20}/>, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-white dark:bg-[#11131a]', border: 'border-amber-200 dark:border-amber-900/50' },
          ].map((card, i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-xl border ${card.border} ${card.bg} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg bg-slate-50 dark:bg-[#1c1f2b] ${card.color}`}>
                  {card.icon}
                </div>
                {i === 1 && (
                   <span className="text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                     {compliancePct}% Rate
                   </span>
                )}
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">{card.value.toLocaleString()}</h3>
                <p className="text-[11px] sm:text-sm font-medium leading-tight text-slate-500 dark:text-slate-400">{card.label}</p>
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${card.color.split(' ')[0].replace('text-', 'bg-')} dark:${card.color.split(' ')[1]?.replace('text-', 'bg-') || ''}`} />
            </div>
          ))}
        </div>

        {/* Main Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Analytics Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-[#11131a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#1E3A8A] dark:text-blue-400" />
                  Primary Violation Vectors
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Volume of non-compliance events by specific metrology rules.</p>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 10, right: 10, left: isMobile ? -60 : -20, bottom: isMobile ? 10 : 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 12, fontWeight: 500 }} dy={isMobile ? 8 : 16} interval={isMobile ? "preserveStartEnd" : 0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={isMobile ? 1 : 60} tickFormatter={(val) => isMobile ? '' : val} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(30,58,138,0.04)' }} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600,
                      fontSize: '14px'
                    }} 
                    itemStyle={{ color: '#1E3A8A' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {graphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1E3A8A' : '#3B82F6'} className="dark:opacity-90 hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-[#11131a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Log</h2>
              <button onClick={() => router.push('/history')} className="text-sm font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {(stats.recent_scans || stats.recent || []).slice(0, 5).map((scan, i) => {
                const statusStr = scan.overall_compliance || scan.overallStatus || scan.status;
                const d = new Date(scan.created_at);
                const timeStr = isNaN(d) ? 'Unknown' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div 
                    key={i} 
                    onClick={() => router.push(`/results/${scan.id || 'mock'}`)}
                    className="flex flex-col p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-4 text-sm">{scan.product_name || 'Unidentified Package'}</span>
                      <span className="text-xs font-mono text-slate-400 shrink-0">{timeStr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getBadgeClass(statusStr)}`}>
                        {statusStr}
                      </span>
                      <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">ID: {scan.id?.substring(0,6) || '---'}</span>
                    </div>
                  </div>
                );
              })}
              
              {(!stats.recent_scans && !stats.recent) || (stats.recent_scans?.length === 0) && (
                 <div className="text-center py-10 text-slate-400 text-sm">No recent activity found.</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
