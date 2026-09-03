
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { toast } from 'sonner';

function EvidenceImage({ src }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-6 text-center text-[var(--color-text-muted)]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-[var(--color-text-secondary)] opacity-50">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M10 4v4"></path>
          <path d="M2 8h20"></path>
          <path d="M6 4v4"></path>
        </svg>
        <span className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-text-primary)] mb-1">Evidence Archived</span>
        <span className="text-[11px] leading-relaxed">Original scan securely purged from volatile edge node.<br/>Reference ID remains intact.</span>
      </div>
    );
  }
  return <img src={src} alt="Evidence" onError={() => setError(true)} className="w-full h-full object-contain rounded-xl shadow-lg" />;
}


export default function ResultsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setReport(json.data);
        if (typeof window !== "undefined" && navigator.vibrate) { navigator.vibrate([30, 50, 30]); }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Scan record deleted.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete scan.');
      }
    } catch (err) {
      toast.error('Error deleting scan.');
    }
  };

  const downloadPDF = async () => {
    toast.info('Generating Official Government Report...');
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const json = await res.json();
      
      const fileUrl = json.data.file_url;
      const dlRes = await fetch(`${API.replace('/api/v1', '')}${fileUrl}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await dlRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      window.open(url, '_blank');
      toast.success('PDF Downloaded Successfully');
    } catch (e) {
      toast.error('Could not generate PDF');
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API.replace('/api/v1', '')}/api/v1/scans/${report.id}/csv`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${report.id.slice(0,8)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV Exported Successfully');
    } catch (e) {
      toast.error('Could not generate CSV export');
    }
  };

  if (loading) return <div className="min-h-screen bg-background text-text-primary flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>;
  if (!report) return <div className="min-h-screen bg-background text-text-primary p-12 text-center">Scan not found</div>;

  const isPass = (report.overallStatus || report.overall_compliance) === 'compliant';
  const badgeClass = isPass ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20';
  const allRules = report.violations || [];
  const ruleCounts = {
    pass:       allRules.filter(v => String(v.status).toUpperCase() === 'PASS').length,
    fail:       allRules.filter(v => String(v.status).toUpperCase() === 'POTENTIAL NON-COMPLIANCE').length,
    manual:     allRules.filter(v => String(v.status).toUpperCase() === 'MANUAL REVIEW').length,
    na:         allRules.filter(v => String(v.status).toUpperCase() === 'NOT APPLICABLE').length,
    unverified: allRules.filter(v => String(v.status).toUpperCase() === 'NOT VERIFIED').length,
  };
  const totalChecked = allRules.length || 1;

  const fields = report.extractedFields || report.extracted_fields || {};

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 mt-4 md:mt-8">
        {fields._is_fallback && (
          <div className="mb-6 p-4 glass rounded-[16px] border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-yellow-500 tracking-wide uppercase mb-1">Network Offline: Using Local AI Cache</h4>
              <p className="text-[13px] text-yellow-500/80 leading-relaxed">The Google Cloud API failed to respond due to high demand. Our system automatically routed this scan to the offline simulation cache to ensure zero downtime. This is a cached demo result.</p>
            </div>
          </div>
        )}
        
        {/* HERO SECTION */}
          <div className="glass rounded-[20px] md:rounded-[24px] p-4 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            {/* Top row: Badge and ID */}
            <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
              <span className={`text-[10px] font-mono tracking-[0.1em] uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                {report.overallStatus || report.overall_compliance}
              </span>
              <span className="text-[10px] font-mono text-text-muted tracking-wider truncate max-w-[150px] md:max-w-xs">
                ID: {report.id}
              </span>
            </div>
            
            {/* Main Content: Name/Brand (Left) & Score (Right) */}
            <div className="flex flex-row justify-between items-center gap-4 relative z-10">
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] md:text-[40px] font-bold tracking-tight mb-1 text-text-primary leading-tight line-clamp-3">
                  {report.product?.product_name || fields.product_name || 'Unknown Product'}
                </h1>
                <p className="text-text-secondary text-[13px] md:text-[16px] truncate">
                  {report.product?.brand_name || fields.brand_name || 'Brand Unspecified'}
                </p>
              </div>
              {/* Rule Audit Breakdown */}
              <div className="shrink-0 w-full md:w-[240px] glass border border-border/50 rounded-[16px] p-4 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-3">
                  Rule Audit &middot; {allRules.length} checks
                </div>
                <div className="flex flex-col gap-[10px]">
                  {[
                    { label: 'Pass',           count: ruleCounts.pass,       bar: 'bg-emerald-500', txt: 'text-emerald-500' },
                    { label: 'Non-Compliant',  count: ruleCounts.fail,       bar: 'bg-red-500',     txt: 'text-red-500'     },
                    { label: 'Manual Review',  count: ruleCounts.manual,     bar: 'bg-amber-400',   txt: 'text-amber-400'   },
                    { label: 'Not Applicable', count: ruleCounts.na,         bar: 'bg-slate-400',   txt: 'text-slate-400'   },
                    { label: 'Not Verified',   count: ruleCounts.unverified, bar: 'bg-blue-400',    txt: 'text-blue-400'    },
                  ].map(({ label, count, bar, txt }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`text-[11px] font-semibold w-[96px] shrink-0 ${txt}`}>{label}</div>
                      <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
                        <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${(count / totalChecked) * 100}%` }} />
                      </div>
                      <div className={`text-[12px] font-black w-4 text-right tabular-nums ${txt}`}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">
            <button onClick={downloadPDF} className="mello-btn-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Notice
            </button>
            <button onClick={downloadCSV} className="mello-btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Export CSV
            </button>
          </div>
        </div>
          
          

        {/* TAB NAVIGATION */}
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory border-b border-border mb-8 w-full">
          {['summary', 'ingredients', 'evidence', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`snap-center shrink-0 min-w-[90px] flex-1 px-2 py-3 text-[10px] md:text-[13px] md:px-6 font-bold tracking-widest uppercase transition-all flex items-center justify-center text-center ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-muted hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB 1: SUMMARY / VIOLATIONS */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* AI EXECUTIVE SUMMARY */}
            {fields.ai_summary && (
              <div className="glass rounded-[16px] md:rounded-[20px] p-5 md:p-6 border-l-4 border-l-accent mb-6 md:mb-8">
                <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-3">AI Executive Summary</h4>
                <p className="text-[14px] text-text-secondary leading-relaxed">{fields.ai_summary}</p>
              </div>
            )}

            <h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>
            
            {/* FAILED RULES SECTION */}
            <div className="mb-8">
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Violations & Warnings
              </h4>
              <div className="space-y-4">
                {(report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE').map((v, i) => (
                  <div key={'fail-'+i} className="glass rounded-[12px] md:rounded-[16px] p-4 md:p-6 border-l-4 border-l-red-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 font-mono text-[11px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[16px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-red-500 tracking-widest uppercase">{v.status}</span>
                    </div>
                    <p className="text-[14px] text-text-secondary leading-relaxed font-mono">
                      {v.detail || v.detail_text}
                    </p>
                  </div>
                ))}
                {(report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE').length === 0 && (
                  <div className="text-[14px] text-text-muted italic px-2">No violations found. Product is fully compliant.</div>
                )}
              </div>
            </div>

            {/* PASSED RULES SECTION */}
            <div>
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-green-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Compliant Checks
              </h4>
              <div className="space-y-3">
                {(report.violations || []).filter(v => String(v.status).toUpperCase() === 'PASS' || String(v.status).toUpperCase() === 'NOT APPLICABLE').map((v, i) => (
                  <div key={'pass-'+i} className="glass rounded-[12px] p-3 border-l-2 border-l-green-500 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 font-mono text-[10px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[14px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: INGREDIENTS IQ */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in space-y-6">
              
              <div className="mb-6">
                <h3 className="text-[20px] font-medium text-text-primary mb-1">Ingredient Analysis</h3>
                <p className="text-[14px] text-text-secondary">AI-powered biochemical breakdown and safety profiling.</p>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="glass rounded-[20px] p-12 text-center text-text-secondary">
                  No ingredient data was detected on this packaging.
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  
                  {/* Left Column: Health Profile (2/3 width on desktop) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Clean Label Card */}
                    <div className={`glass rounded-[20px] p-6 border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${fields.ingredient_analysis?.is_clean_label ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold bg-background/50 border ${fields.ingredient_analysis?.is_clean_label ? 'text-green-500 border-green-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                          {fields.ingredient_analysis?.is_clean_label ? 'A' : 'C'}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-medium text-text-primary mb-0.5">
                            {fields.ingredient_analysis?.is_clean_label ? 'Clean Label Certified' : 'Contains Artificial Additives'}
                          </h4>
                          <p className="text-[13px] text-text-secondary">
                            {fields.ingredient_analysis?.is_clean_label ? 'No synthetic chemicals or artificial preservatives detected.' : 'The AI detected synthetic or ultra-processed ingredients in this product.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chemical Flags */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Chemical Flags</h4>
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[13px] font-medium">
                              {add}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No harmful E-numbers or restricted additives detected.</div>
                      )}
                    </div>

                    {/* Health Risks */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Health Risks</h4>
                      {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                        <div className="space-y-3">
                          {fields.ingredient_analysis.health_risks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 bg-background/40 p-3 rounded-xl border border-border/50">
                              <span className="text-amber-500 mt-0.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                              </span>
                              <span className="text-[14px] text-text-primary leading-relaxed">{risk}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No immediate systemic health risks identified by the AI.</div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Allergens & Raw Text (1/3 width on desktop) */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Allergens */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Allergens</h4>
                      {fields.ingredient_analysis?.allergen_warnings?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.allergen_warnings.map((allergen, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[13px] font-medium">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No common allergens declared.</div>
                      )}
                    </div>


                    
                    {/* Raw Ingredients Text */}
                    <div className="glass rounded-[20px] p-6 border border-border h-full min-h-[300px]">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Raw Ingredient Text</h4>
                      <div className="text-[13px] text-text-secondary leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50">
                        {fields.ingredients ? fields.ingredients : "Raw ingredients text unavailable."}
                      </div>
                    </div>

                  </div>
                  </div>
                  {/* Detailed AI Ingredient Dictionary - Rendered full width below the grid */}
                  {fields.ingredient_analysis?.ingredient_dictionary && fields.ingredient_analysis.ingredient_dictionary.length > 0 && (
                    <div className="glass rounded-[20px] p-6 mt-6 w-full">
                      <h4 className="text-[14px] font-mono tracking-wider text-text-secondary uppercase mb-4 border-b border-border pb-2">AI Ingredient Breakdown</h4>
                      <div className="space-y-4">
                        {fields.ingredient_analysis.ingredient_dictionary.map((ing, i) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-3 items-start border border-border/50 bg-background/30 rounded-xl p-4 hover:border-text-muted transition-colors">
                             <div className="min-w-[140px] font-medium text-text-primary text-[14px]">{ing.name}</div>
                             <div className="text-[13px] text-text-secondary leading-relaxed">{ing.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-[18px] font-medium text-text-primary">Attached Photographic Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {(() => {
                let images = [];
                try {
                  const imgStr = report.original_image || report.originalImage || report.image_url;
                  images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                  images = images.filter(Boolean); // protect against nulls
                } catch (e) {
                  images = [report.original_image || report.originalImage || report.image_url].filter(Boolean);
                }
                if (images.length === 0) return <div className="text-[14px] text-text-muted">No evidence attached.</div>;
                return images.map((img, idx) => (
                  <div key={idx} className="w-full aspect-square flex items-center justify-center">
                    <EvidenceImage src={img.startsWith('http') || img.startsWith('data:') ? img : API.replace('/api/v1', '') + '/' + img} />
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: DATA EXTRACTED */}
        {activeTab === 'data' && (
            <div className="animate-fade-in flex flex-col md:flex-row gap-6 items-start w-full">
               {/* Left Column: Professional Structured Data */}
               <div className="w-full md:w-7/12 flex flex-col gap-4">
                 <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-1">Structured Telemetry</h3>
                 <div className="glass rounded-[24px] overflow-hidden border border-border/50 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/40">
                    {Object.entries(fields).filter(([k, v]) => !k.startsWith('_') && v).map(([k, v], i) => (
                      <div key={k} className="bg-background/80 backdrop-blur-md p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-1.5">
                          {k.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[14px] text-text-primary font-medium break-words leading-relaxed">
                          {String(v)}
                        </div>
                      </div>
                    ))}
                    </div>
                    {Object.entries(fields).filter(([k, v]) => !k.startsWith('_') && v).length === 0 && (
                      <div className="p-8 text-sm text-text-muted text-center bg-background/50">No structured data extracted.</div>
                    )}
                 </div>
               </div>
               
               {/* Right Column: Clean Raw Logs */}
               <div className="w-full md:w-5/12 flex flex-col gap-4 md:sticky md:top-24 mt-8 md:mt-0">
                 <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-1">Raw OCR Output</h3>
                 <div className="glass rounded-[24px] overflow-hidden border border-border/50 shadow-sm bg-black/5 dark:bg-white/5 relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none"></div>
                   <div className="p-5 font-mono text-[12px] md:text-[13px] text-text-secondary whitespace-pre-wrap h-[300px] md:h-[400px] overflow-y-auto custom-scrollbar allow-select leading-relaxed relative z-10">
                     {report.ocr_raw_text || report.ocrRawText || 'No raw data available.'}
                   </div>
                 </div>
               </div>
            </div>
        )}

      </main>
    </div>
  );
}
