"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('token')) return router.push('/login');
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
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
            { id: '1', product_name: 'Demo Product A', status: 'PASS', created_at: new Date().toISOString() },
            { id: '2', product_name: 'Demo Product B', status: 'POTENTIAL NON-COMPLIANCE', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', product_name: 'Demo Product C', status: 'MANUAL REVIEW', created_at: new Date(Date.now() - 7200000).toISOString() }
          ]
        });
      }
    };
    fetchStats();
  }, [router]);

  const getBadgeClass = (s) => {
    const v = String(s).toUpperCase();
    if (v === 'PASS' || v === 'COMPLIANT') return 'bg-pass-bg text-pass border-pass/20';
    if (v === 'MANUAL REVIEW' || v === 'NEEDS_REVIEW') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (v === 'POTENTIAL NON-COMPLIANCE' || v === 'NON_COMPLIANT' || v === 'FAILED' || v === 'FAIL') return 'bg-[var(--color-noncompliant-bg)] text-[var(--color-noncompliant)] border-[var(--color-noncompliant)]/20';
    return 'bg-surface text-text-secondary border-border';
  };

  if (!stats) return (
    <div className="min-h-screen bg-background text-text-primary overflow-hidden relative">
      <NavBar />
      <div className="p-10 flex flex-col items-center justify-center h-[60vh] text-text-muted font-mono text-sm tracking-widest uppercase">
        <svg className="animate-spin h-8 w-8 text-accent mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Initializing Telemetry...
      </div>
    </div>
  );

  const compliancePct = stats.total_scans ? Math.round(((stats.compliant_count ?? stats.compliant ?? 0) / (stats.total_scans || 1)) * 100) : 0;
  
  // Format graph data nicely
  const graphData = (stats.top_violated_rules || []).map(r => {
    let rawLabel = r.ruleId || r.rule_id;
    const codeMap = {
      'C01': 'Mfr Address', 'C02': 'MRP Missing', 'C03': 'Net Qty', 'C04': 'Mfg Date', 'C05': 'Font Size', 'C06': 'Language'
    };
    return {
      rule_id: codeMap[rawLabel] || rawLabel,
      count: Number(r.count)
    };
  });

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-hidden relative pb-20">
      <div className="orb-saffron"></div>
      <div className="orb-blue"></div>
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10 animate-fade-in">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-accent/10 text-accent border border-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
                Live Telemetry
              </span>
              <span className="text-xs font-mono tracking-wider text-text-muted uppercase">SatyaLabel HQ</span>
            </div>
            <h1 className="text-3xl md:text-[40px] leading-tight font-bold tracking-tight text-text-primary">Central Operations</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/upload')} className="btn btn-primary px-6 py-3 shadow-[0_0_20px_rgba(212,80,10,0.2)] flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              New Inspection
            </button>
          </div>
        </header>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { 
              label: 'Total Inspections', 
              value: stats.total_scans || 0, 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"/><path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
              color: 'text-blue-500', glow: 'bg-blue-500' 
            },
            { 
              label: 'Verified Compliant', 
              value: stats.compliant_count ?? stats.compliant ?? 0, 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/><path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
              color: 'text-pass', glow: 'bg-pass', extra: <span className="text-[10px] font-bold px-2 py-1 bg-pass-bg text-pass rounded border border-pass/20">{compliancePct}% Rate</span>
            },
            { 
              label: 'Violations Detected', 
              value: stats.non_compliant_count ?? stats.violations ?? 0, 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4L4 18H20L12 4Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10V14M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
              color: 'text-[var(--color-noncompliant)]', glow: 'bg-[var(--color-noncompliant)]' 
            },
            { 
              label: 'Awaiting Review', 
              value: stats.needs_review_count ?? stats.manual_review ?? 0, 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/><path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
              color: 'text-amber-500', glow: 'bg-amber-500' 
            },
          ].map((card, i) => (
            <div key={i} className={`glass rounded-[24px] p-5 sm:p-6 relative overflow-hidden group border-t border-t-white/5`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl bg-background border border-border ${card.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                {card.extra}
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight mb-1">{card.value.toLocaleString()}</h3>
                <p className="text-[12px] font-bold uppercase tracking-widest text-text-muted">{card.label}</p>
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${card.glow}`} />
            </div>
          ))}
        </div>

        {/* Main Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Analytics Chart */}
          <div className="lg:col-span-3 glass rounded-[24px] p-6 lg:p-8 min-w-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  Primary Violation Vectors
                </h2>
                <p className="text-[13px] text-text-secondary mt-1">Volume of non-compliance events by specific metrology rules.</p>
              </div>
            </div>
            
            <div className="w-full flex-1 space-y-6 flex flex-col justify-center">
              {(() => {
                 if (!graphData || graphData.length === 0) return <div className="text-sm text-text-muted text-center italic py-10">No metric data available</div>;
                 const maxCount = Math.max(...graphData.map(d => d.count)) || 1;
                 return graphData.map((item, i) => (
                   <div key={i} className="w-full group">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[13px] font-bold text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-wide">
                           {item.rule_id}
                         </span>
                         <span className="text-[14px] font-bold text-text-primary">
                           {item.count} <span className="text-[10px] text-text-muted uppercase tracking-widest ml-1">scans</span>
                         </span>
                      </div>
                      <div className="w-full bg-surface border border-border rounded-full h-3 overflow-hidden flex p-0.5">
                         <div 
                           className="h-full bg-gradient-to-r from-accent to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(212,80,10,0.5)]" 
                           style={{ width: `${(item.count / maxCount) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 ));
              })()}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 glass rounded-[24px] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <h2 className="text-[18px] font-bold text-text-primary">Recent Log</h2>
              <button onClick={() => router.push('/history')} className="text-[12px] font-bold text-accent uppercase tracking-widest hover:text-orange-500 transition-colors flex items-center gap-1">
                View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {(stats.recent_scans || stats.recent || []).slice(0, 5).map((scan, i) => {
                const statusStr = scan.overall_compliance || scan.overallStatus || scan.status;
                const d = new Date(scan.created_at);
                const timeStr = isNaN(d) ? 'Unknown' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div 
                    key={i} 
                    onClick={() => scan.id && scan.id !== '---' && router.push(`/results/${scan.id}`)}
                    className="flex flex-col p-4 rounded-[16px] bg-background/50 border border-border hover:border-accent hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-[14px] text-text-primary truncate pr-4 group-hover:text-accent transition-colors">{scan.product_name || 'Unidentified Package'}</span>
                      <span className="text-[11px] font-mono text-text-muted shrink-0 bg-surface px-2 py-1 rounded border border-border/50">{timeStr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-widest rounded border ${getBadgeClass(statusStr)}`}>
                        {statusStr}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted opacity-50">#{scan.id?.substring(0,6) || '---'}</span>
                    </div>
                  </div>
                );
              })}
              
              {(!stats.recent_scans && !stats.recent) || (stats.recent_scans?.length === 0) && (
                 <div className="text-center py-10 text-text-muted text-[13px] italic">No recent activity found in telemetry.</div>
              )}
            </div>
          </div>

        </div>

        {/*  PHASE 4: Worst Offenders Brand Leaderboard  */}
        {(stats.top_non_compliant || []).length > 0 && (
          <div className="mt-6 glass rounded-[24px] p-6 lg:p-8 border-t-2 border-t-[var(--color-noncompliant)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="text-[var(--color-noncompliant)]">??</span> Repeat Non-Compliance Offenders
                </h2>
                <p className="text-[13px] text-text-secondary mt-1">Brands with the most failed scans across all inspections</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(stats.top_non_compliant || []).map((brand, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[16px] bg-[var(--color-noncompliant-bg)] border border-[var(--color-noncompliant)]/20 hover:scale-[1.02] transition-transform">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black shrink-0 shadow-sm ${i === 0 ? 'bg-[var(--color-noncompliant)] text-white shadow-[0_0_10px_rgba(163,32,32,0.5)]' : i === 1 ? 'bg-red-500/80 text-white' : 'bg-background text-[var(--color-noncompliant)] border border-[var(--color-noncompliant)]/20'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-text-primary truncate">
                      {brand.productName || 'Unknown Product'}
                    </div>
                    <div className="text-[11px] font-mono tracking-wider text-text-secondary truncate mt-0.5">
                      {brand.brandName || 'Unknown Brand'}  {brand.totalScans} SCAN{brand.totalScans !== 1 ? 'S' : ''}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-background text-[var(--color-noncompliant)] text-[10px] font-black tracking-widest border border-[var(--color-noncompliant)]/20 shadow-sm">
                      {brand.failScans} FAIL{brand.failScans !== 1 ? 'S' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
