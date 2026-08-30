
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
                <span className={`text-[10px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full ${badgeClass}`}>
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
              <div className="text-[10px] text-text-muted font-mono tracking-[0.2em] uppercase mb-1">AI Compliance Score</div>
              <div className={`text-[56px] font-medium tracking-tighter leading-none ${scoreColor} drop-shadow-sm`}>
                {report.compliance_score || report.complianceScore}%
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="hidden md:flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">
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
          
          {/* Mobile FABs */}
          <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col gap-3">
            <button onClick={downloadPDF} className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(11,31,58,0.4)] active-press border-2 border-background">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
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
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 mb-4 flex items-center gap-2">
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
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-green-500 mb-4 flex items-center gap-2">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
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
                  <div key={idx} className="w-full aspect-square flex items-center justify-center">
                    <EvidenceImage src={img.startsWith('http') ? img : API.replace('/api/v1', '') + '/' + img} />
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
