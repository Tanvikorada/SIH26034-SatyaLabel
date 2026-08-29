
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { toast } from 'sonner';

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

  const downloadCSV = () => {
    const fields = report.extractedFields || report.extracted_fields || {};
    const violations = report.violations || [];
    const csvRows = [];
    csvRows.push("LEGAL METROLOGY COMPLIANCE REPORT");
    csvRows.push(`Scan ID,${report.id}`);
    csvRows.push(`Date,${new Date(report.created_at).toLocaleString()}`);
    csvRows.push(`Overall Status,${report.overall_compliance || report.overallStatus}`);
    csvRows.push(`Compliance Score,${report.compliance_score || report.complianceScore}%`);
    csvRows.push("");
    
    csvRows.push("--- EXTRACTED DATA ---");
    csvRows.push("Field Name,Extracted Value");
    for (const [k, v] of Object.entries(fields)) {
      if (!k.startsWith('_') && v) {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        csvRows.push(`"${label}","${String(v).replace(/"/g, '""')}"`);
      }
    }
    
    csvRows.push("");
    csvRows.push("--- RULE VIOLATIONS ---");
    csvRows.push("Rule ID,Status,Severity,Details");
    for (const v of violations) {
      if(v.status !== 'PASS' && v.status !== 'NOT APPLICABLE') {
        csvRows.push(`"${v.rule_id}","${v.status}","${v.severity || 'high'}","${String(v.detail_text || v.detail || '').replace(/"/g, '""')}"`);
      }
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${report.id}.csv`;
    a.click();
  };

  if (loading) return <div className="min-h-screen bg-background text-text-primary flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>;
  if (!report) return <div className="min-h-screen bg-background text-text-primary p-12 text-center">Scan not found</div>;

  const isPass = (report.overallStatus || report.overall_compliance) === 'compliant';
  const badgeClass = isPass ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20';
  const scoreColor = report.compliance_score >= 80 ? 'text-green-500' : report.compliance_score >= 50 ? 'text-amber-500' : 'text-red-500';

  const fields = report.extractedFields || report.extracted_fields || {};

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto px-6 mt-8">
        {/* HERO SECTION */}
        <div className="glass rounded-[24px] p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] font-mono text-text-muted tracking-wider">ID: {report.id}</span>
                <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                  {report.overallStatus || report.overall_compliance}
                </span>
              </div>
              <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-1 text-text-primary">
                {report.product?.product_name || fields.product_name || 'Unknown Product'}
              </h1>
              <p className="text-text-secondary text-[16px]">
                {report.product?.brand_name || fields.brand_name || 'Brand Unspecified'}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-[12px] text-text-muted font-bold tracking-widest uppercase mb-1">AI Compliance Score</div>
              <div className={`text-[48px] font-medium tracking-tighter leading-none ${scoreColor}`}>
                {report.compliance_score || report.complianceScore}%
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
        <div className="flex space-x-1 border-b border-border mb-8">
          {['summary', 'ingredients', 'evidence', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[13px] font-bold tracking-widest uppercase transition-all ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-muted hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB 1: SUMMARY / VIOLATIONS */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>
            
            {/* FAILED RULES SECTION */}
            <div className="mb-8">
              <h4 className="text-[14px] font-bold tracking-widest uppercase text-red-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Violations & Warnings
              </h4>
              <div className="space-y-4">
                {(report.violations || []).filter(v => v.status !== 'PASS' && v.status !== 'NOT APPLICABLE').map((v, i) => (
                  <div key={'fail-'+i} className="glass rounded-[16px] p-6 border-l-4 border-l-red-500">
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
                {(report.violations || []).filter(v => v.status !== 'PASS' && v.status !== 'NOT APPLICABLE').length === 0 && (
                  <div className="text-[14px] text-text-muted italic px-2">No violations found. Product is fully compliant.</div>
                )}
              </div>
            </div>

            {/* PASSED RULES SECTION */}
            <div>
              <h4 className="text-[14px] font-bold tracking-widest uppercase text-green-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Compliant Checks
              </h4>
              <div className="space-y-3">
                {(report.violations || []).filter(v => v.status === 'PASS' || v.status === 'NOT APPLICABLE').map((v, i) => (
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

        {/* TAB 1.5: INGREDIENTS IQ PREMIUM */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h3 className="text-[22px] font-medium tracking-tight text-text-primary mb-1">Clinical Ingredient Analysis</h3>
                <p className="text-[14px] text-text-secondary">AI-powered biochemical breakdown and safety profiling.</p>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="border border-border/50 border-dashed rounded-[2px] p-12 text-center text-text-muted uppercase tracking-widest text-[12px] font-mono">
                  [ No Ingredient Data Detected ]
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  
                  {/* Top Dashboard: Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score / Clean Label */}
                    <div className="col-span-1 border border-border/50 bg-[#050505] p-6 rounded-[4px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4">Purity Index</div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-[22px] font-medium ${fields.ingredient_analysis?.is_clean_label ? 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}>
                          {fields.ingredient_analysis?.is_clean_label ? 'A+' : 'C-'}
                        </div>
                        <div>
                          <div className={`text-[16px] font-medium mb-1 ${fields.ingredient_analysis?.is_clean_label ? 'text-green-400' : 'text-amber-400'}`}>
                            {fields.ingredient_analysis?.is_clean_label ? 'Clean Label' : 'Additives Present'}
                          </div>
                          <div className="text-[12px] text-text-secondary leading-tight">
                            {fields.ingredient_analysis?.is_clean_label ? 'No synthetic chemicals or artificial preservatives detected.' : 'Contains synthetic or ultra-processed ingredients.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chemical Flags */}
                    <div className="col-span-1 md:col-span-2 border border-border/50 bg-black/20 p-6 rounded-[4px]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase">Chemical Flags</div>
                        <div className="text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm">High Priority</div>
                      </div>
                      
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <div key={i} className="flex items-center gap-2 border border-red-500/30 bg-[#0A0000] px-3 py-2 rounded-[2px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="text-[13px] font-mono text-red-400">{add}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span className="text-[14px] text-text-secondary">No harmful E-numbers or restricted additives detected.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Analysis Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    
                    {/* Left: Health Risks & Allergens */}
                    <div className="space-y-8">
                      {/* Health Risks */}
                      <div>
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4 pb-2 border-b border-border/50">Epidemiological Risks</div>
                        {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                          <div className="space-y-3">
                            {fields.ingredient_analysis.health_risks.map((risk, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className="text-amber-500 font-mono text-[10px] mt-1.5">[{String(i+1).padStart(2, '0')}]</span>
                                <span className="text-[14px] text-text-primary leading-relaxed">{risk}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[13px] text-text-secondary italic">No immediate systemic health risks identified.</div>
                        )}
                      </div>

                      {/* Allergens */}
                      <div>
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4 pb-2 border-b border-border/50">Identified Allergens</div>
                        {fields.ingredient_analysis?.allergen_warnings?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {fields.ingredient_analysis.allergen_warnings.map((allergen, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[12px] font-medium tracking-wide">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[13px] text-text-secondary italic">None declared.</div>
                        )}
                      </div>
                    </div>

                    {/* Right: The Raw Data Log */}
                    <div className="bg-[#020205] border border-border/50 p-6 rounded-[2px] relative">
                      <div className="absolute top-0 right-0 p-4 opacity-30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="M9 18l3-3-3-3"></path></svg>
                      </div>
                      <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4">Raw Ingredient Manifest</div>
                      <div className="text-[13px] font-mono text-text-secondary leading-loose max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {fields.ingredients ? fields.ingredients.split(',').map((ing, i) => (
                          <div key={i} className="flex gap-4 border-b border-border/30 pb-2 mb-2 last:border-0 hover:bg-white/5 p-1 transition-colors">
                            <span className="text-accent opacity-50">{String(i+1).padStart(2, '0')}</span>
                            <span className="text-text-primary capitalize">{ing.trim()}</span>
                          </div>
                        )) : "Manifest unavailable."}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-[18px] font-medium text-text-primary">Attached Photographic Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div key={idx} className="glass rounded-[16px] p-2 overflow-hidden aspect-square flex items-center justify-center bg-black/40">
                    <img src={img.startsWith('http') ? img : API.replace('/api/v1', '') + '/' + img} alt="Evidence" className="max-w-full max-h-full object-contain rounded-[8px]" />
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: DATA EXTRACTED */}
        {activeTab === 'data' && (
          <div className="animate-fade-in">
             <h3 className="text-[18px] font-medium text-text-primary mb-6">AI Structured Extraction</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fields).filter(([k, v]) => !k.startsWith('_') && v).map(([k, v]) => (
                  <div key={k} className="glass rounded-[16px] p-5">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
                      {k.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[14px] text-text-primary font-medium break-words leading-tight">
                      {String(v)}
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-8 glass rounded-[16px] p-6">
               <h3 className="text-[16px] font-medium text-text-primary mb-4">Raw OCR Extraction Log</h3>
               <div className="bg-black/5 border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                 {report.ocr_raw_text || report.ocrRawText || 'No raw text available.'}
               </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
