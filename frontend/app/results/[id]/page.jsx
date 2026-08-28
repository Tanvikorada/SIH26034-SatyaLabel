'use client';
import { useEffect, useState, useRef } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ResultsPage({ params }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('action');
  const [expandedRule, setExpandedRule] = useState(null);
  const [resolvedParams, setResolvedParams] = useState(null);
  const reportRef = useRef(null);
  const router = useRouter();
  
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    if (!localStorage.getItem('token')) return router.push('/login');
    
    let intervalId;
    
    const fetchScan = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const data = json.data || json;
        
        setReport(data);
        
        if (data.status !== 'processing') {
          clearInterval(intervalId);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(intervalId);
        setLoading(false);
      }
    };
    
    fetchScan();
    intervalId = setInterval(fetchScan, 3000);
    
    return () => clearInterval(intervalId);
  }, [resolvedParams, router, API]);

  const cancelScan = async () => {
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Scan cancelled.');
        router.push('/dashboard');
      }
    } catch(err) {
      toast.error('Could not cancel scan');
    }
  };

  const downloadPDF = () => {
    toast.info('Opening Print Dialog. Save as PDF.');
    setTimeout(() => window.print(), 500);
  };

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
        toast.error('Failed to delete (Admins only)');
      }
    } catch(err) {
      toast.error('Error deleting record');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <div className="print:hidden"><NavBar /></div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-32">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-[var(--color-primary)] animate-spin"></div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-[20px] font-medium tracking-tight">Analyzing Label...</h2>
            <p className="text-[14px] text-text-secondary font-mono">Running OCR and Legal Metrology Rules Engine</p>
          </div>
          <button onClick={cancelScan} className="mt-4 px-4 py-2 rounded-full border border-border text-text-secondary hover:text-red-400 hover:border-red-900/50 transition-colors text-sm font-medium">Cancel Scan</button>
        </div>
      </div>
    );
  }

  if (!report) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-red-500">Not found</div></div>;

  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <div className="print:hidden"><NavBar /></div>
        <div className="flex-1 flex items-center justify-center p-6 pb-32">
          <div className="mello-card p-8 max-w-md w-full flex flex-col items-center text-center gap-4 border-red-900/50">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 className="text-[22px] font-medium text-red-500">Scan Failed</h2>
            <p className="text-[14px] text-text-secondary mb-4">{report.errorMessage || report.error_message || "The AI engine could not extract text from this image."}</p>
            <button onClick={() => router.push('/upload')} className="mello-btn-secondary w-full">Try Another Image</button>
          </div>
        </div>
      </div>
    );
  }

  const getBadge = (s) => {
    if (s === 'PASS' || s === 'pass') return 'mello-badge-pass';
    if (s === 'MANUAL REVIEW' || s === 'needs_review') return 'mello-badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE' || s === 'fail' || s === 'estimated_fail') return 'mello-badge-fail';
    return 'mello-badge-na';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <div className="print:hidden"><NavBar /></div>
      
      <div id="pdf-content" className="max-w-[1200px] mx-auto px-6 py-12">
        <div ref={reportRef} className="bg-background p-2 md:p-6 rounded-2xl">
          <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={getBadge(report.overallStatus || report.overall_compliance)}>{report.overallStatus || report.overall_compliance}</div>
                <span className="text-[13px] text-text-muted font-mono">ID: {report.id}</span>
              </div>
              <h1 className="text-[40px] font-medium tracking-tight leading-[1.1] mb-2">{report.product?.product_name || 'Unknown Product'}</h1>
              <p className="text-[16px] text-text-secondary">{report.product?.brand_name || 'No Brand'}</p>
            </div>
            <div className="text-right mello-card-flat px-6 py-4 flex flex-col items-center bg-surface/50">
               <div className="text-[13px] text-text-muted mb-1">Compliance Score</div>
               <div className="text-[40px] font-medium tracking-tight">{report.compliance_score || report.complianceScore || 0}%</div>
            </div>
          </div>

          
        {report.extracted_fields?._quality_warning && (
          <div className="mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-4 animate-fade-in">
             <div className="text-amber-500 text-2xl">⚠️</div>
             <div>
               <h3 className="text-amber-400 font-semibold mb-1">Image Quality / Obstruction Warning</h3>
               <p className="text-amber-200/80 text-sm">{report.extracted_fields._quality_warning}</p>
               <p className="text-amber-200/60 text-xs mt-2">The AI strictly refused to extract fields in the affected areas to prevent hallucinating incorrect legal values.</p>
             </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-tight">Compliance Ledger</h3>
                <div className="text-[12px] font-mono text-text-muted">Legal Metrology Rules, 2011</div>
              </div>

              
              {/* AI COMPLIANCE ANALYSIS */}
              <div className="border border-border rounded-2xl p-6 shadow-lg bg-surface relative overflow-hidden mb-6 mt-8">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-[14px] font-mono text-text-muted uppercase tracking-widest mb-4">AI Compliance Analysis</h3>
                <div className="text-[15px] leading-relaxed text-text-secondary space-y-3">
                  {report.extracted_fields?._ai_analysis ? (
                    report.extracted_fields._ai_analysis.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        <strong className="text-text-primary font-medium">Verdict:</strong> The label {report.complianceScore >= 80 ? 'meets most legal requirements' : 'violates multiple mandatory declarations'} under the Legal Metrology (Packaged Commodities) Rules, 2011.
                      </p>
                      <p>
                        <strong className="text-text-primary font-medium">Critical Findings:</strong> Out of {report.totalRulesChecked} rules verified by the AI engine, <span className={report.totalViolations > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>{report.totalViolations} violations</span> were detected.
                      </p>
                      <p className="text-[13px] bg-background/50 p-3 rounded-lg border border-border mt-4">
                        <strong>Legal Context:</strong> The manufacturer, packer, or importer is strictly liable under Rule 32 for the omission of declarations such as MRP, Net Quantity, or Manufacturer Address on the principal display panel. {report.totalViolations > 0 ? "An official notice may be issued." : "No immediate action required."}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* RULING LEDGER */}
              <div className="border border-border rounded-2xl overflow-hidden shadow-lg bg-surface/30 relative">
                <div className="flex flex-col p-2 gap-2">
                  {(() => {
                    const checks = report.violations || [];
                    const fails = checks.filter(c => c.status === 'POTENTIAL NON-COMPLIANCE' || c.status === 'fail' || c.status === 'estimated_fail');
                    const reviews = checks.filter(c => c.status === 'MANUAL REVIEW' || c.status === 'needs_review');
                    const passes = checks.filter(c => c.status === 'PASS' || c.status === 'pass');
                    const sortedChecks = [...fails, ...reviews, ...passes];

                    if (sortedChecks.length === 0) return <div className="p-8 text-center text-text-muted">No rules checked.</div>;

                    return sortedChecks.map((v, i) => {
                      const isPass = v.status === 'PASS' || v.status === 'pass';
                      const isReview = v.status === 'MANUAL REVIEW' || v.status === 'needs_review';
                      
                      let dotColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                      let badgeBg = 'bg-[#ef44441a] text-red-500';
                      
                      if (isPass) {
                        dotColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
                        badgeBg = 'bg-[#22c55e1a] text-green-500';
                      } else if (isReview) {
                        dotColor = 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
                        badgeBg = 'bg-[#f59e0b1a] text-amber-500';
                      }

                      return (
                        <div key={i} className="flex flex-col p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                              <div className="flex flex-col">
                                <span className="font-mono text-[11px] tracking-wider text-text-muted mb-0.5">{v.rule_id}</span>
                                <span className="font-medium text-[15px] text-text-primary leading-tight">{v.rule_title}</span>
                              </div>
                            </div>
                            <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                              {(v.status || 'UNKNOWN').replace('POTENTIAL NON-COMPLIANCE', 'FAIL')}
                            </div>
                          </div>
                          
                          {/* Expanded Detail */}
                          {expandedRule === i && (
                            <div className="mt-4 pt-4 border-t border-border/50 text-[14px] text-text-secondary leading-relaxed font-mono">
                              {v.detail || v.detail_text || "No official finding detailed."}
                            </div>
                          )}
                        </div>
                      )
                    });
                  })()}
                </div>
              </div>
              
              <div className="mello-card p-6 mt-2">
                <h3 className="text-[15px] font-medium mb-4">Raw Extraction Log</h3>
                <div className="bg-background border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {report.ocr_raw_text || report.ocrRawText || 'No raw text available.'}
                </div>
              </div>
            </div>
  
            <div className="flex flex-col gap-6">
               <h3 className="text-2xl font-medium tracking-tight">Mandatory Declarations</h3>
               
               <div className="flex flex-col gap-4">
                 {(() => {
                   const fields = report.extractedFields || report.extracted_fields || {};
                   
                   // Core Legal Metrology Fields
                   const groups = {
                     'Identity': ['manufacturer_name', 'manufacturer_address', 'common_name', 'product_name', 'brand_name'],
                     'Quantity & Price': ['net_quantity', 'net_quantity_unit', 'mrp', 'mrp_includes_tax_statement'],
                     'Dates': ['mfg_date', 'import_date'],
                     'Consumer Support': ['consumer_care_details', 'customer_care']
                   };

                   // Extended Data Cards
                   const extendedCardKeys = [
                     { k: 'ingredients', icon: '🍲', label: 'Ingredients List' },
                     { k: 'nutrition', icon: '📊', label: 'Nutritional Info' },
                     { k: 'fssai_license', icon: '🛡️', label: 'FSSAI License' },
                     { k: 'batch_lot_number', icon: '📦', label: 'Batch / Lot Number' },
                     { k: 'best_before', icon: '⏳', label: 'Best Before / Expiry' },
                     { k: 'country_of_origin', icon: '🌍', label: 'Country of Origin' },
                     { k: 'veg_nonveg', icon: '🥬', label: 'Veg / Non-Veg' },
                     { k: 'allergens_or_warnings', icon: '⚠️', label: 'Allergens & Warnings' }
                   ];

                   const renderGroup = (title, keys) => {
                     const groupFields = keys.map(k => ({ k, v: fields[k] })).filter(f => f.v !== undefined && f.v !== null && f.v !== '');
                     if (groupFields.length === 0) return null;
                     
                     return (
                       <div key={title} className="mello-card p-5">
                         <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-4 pb-2 border-b border-border">{title}</h4>
                         <div className="flex flex-col">
                           {groupFields.map(({k, v}) => (
                             <div key={k} className="py-2.5 flex flex-col gap-1 border-b border-border/50 last:border-0 last:pb-0">
                               <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{k.replace(/_/g, ' ')}</span>
                               <span className="text-[14px] font-medium text-text-primary break-words leading-tight">{String(v)}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   };

                   const renderedGroups = Object.entries(groups).map(([title, keys]) => renderGroup(title, keys)).filter(Boolean);
                   
                   const assignedKeys = [...Object.values(groups).flat(), ...extendedCardKeys.map(e => e.k)];
                   const unassignedKeys = Object.keys(fields).filter(k => !assignedKeys.includes(k) && !k.startsWith('_'));
                   if (unassignedKeys.length > 0) {
                     renderedGroups.push(renderGroup('Other Data', unassignedKeys));
                   }

                   // Render Extended Cards
                   const extendedCardsToRender = extendedCardKeys
                     .map(ext => ({ ...ext, v: fields[ext.k] }))
                     .filter(ext => ext.v !== undefined && ext.v !== null && ext.v !== '');

                   return (
                     <>
                       {renderedGroups.length > 0 ? renderedGroups : <div className="mello-card p-5 text-text-muted text-sm text-center">No structured data extracted.</div>}
                       
                       {extendedCardsToRender.length > 0 && (
                         <div className="mt-6 pt-6 border-t border-border">
                           <h3 className="text-xl font-medium tracking-tight mb-4">Product Attributes</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {extendedCardsToRender.map((ext, i) => (
                               <div key={i} className="mello-card p-5 flex flex-col hover:border-[var(--color-primary)] transition-colors">
                                 <div className="flex items-center gap-2 mb-3">
                                   <span className="text-[16px]">{ext.icon}</span>
                                   <span className="text-[12px] font-bold tracking-widest uppercase text-text-muted">{ext.label}</span>
                                 </div>
                                 <div className="text-[14px] font-medium text-text-primary leading-relaxed break-words">
                                   {String(ext.v)}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-[400px] ml-auto print:hidden">
          <button onClick={downloadPDF} className="mello-btn-primary flex-1 shadow-lg">Download Official Notice PDF</button>
          {localStorage.getItem('role') === 'admin' && (
            <button onClick={handleDelete} className="mello-btn-secondary flex-1 text-red-500 border-red-900/30 hover:bg-red-500/10">Delete Record</button>
          )}
        </div>

      </div>
    </div>
  );
}
