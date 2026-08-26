"use client";
import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import NavBar from '@/components/NavBar';

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);
  const reportRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  
    const handleDelete = async () => {
    if(!confirm('Are you sure you want to delete this scan?')) return;
    try {
      const res = await fetch(`${API}/scans/${report.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Scan deleted');
      router.push('/dashboard');
    } catch(err) {
      toast.error('Delete failed: ' + err.message);
    }
  };


  const cancelScan = async () => {
    try {
      const res = await fetch(${API}/scans//cancel, {
        method: 'POST',
        headers: { 'Authorization': Bearer  }
      });
      if (res.ok) {
        toast.success('Scan cancelled.');
        router.push('/dashboard');
      }
    } catch(err) {
      toast.error('Could not cancel scan');
    }
  };

  const downloadPDF = async () => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#000000' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Notice_${report.id}.pdf`);
      toast.success('Downloaded', { id: toastId });
    } catch (err) {
      toast.error('Failed', { id: toastId });
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    let isMounted = true;
    let pollTimeout = null;

    const fetchScan = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const data = json.data || json;
        
        if (!isMounted) return;

        if (data.status === 'processing') {
          // Poll every 10 seconds to avoid Cloudflare rate limiting (which causes CORS errors)
          pollTimeout = setTimeout(fetchScan, 10000);
        } else {
          setReport(data);
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        setReport({ error: 'Failed to fetch scan results due to Network/CORS error' });
        setLoading(false);
      }
    };
    fetchScan();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [resolvedParams.id, router, API]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-32">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-[var(--color-primary)] animate-spin"></div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-[20px] font-medium tracking-tight">Analyzing Label...</h2>
            <p className="text-[14px] text-text-secondary font-mono">Running OCR and Legal Metrology Rules Engine</p>
          </div>
        </div>
      </div>
    );
  }
  if (!report) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-red-500">Not found</div></div>;

  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
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
    if (s === 'PASS') return 'mello-badge-pass';
    if (s === 'MANUAL REVIEW') return 'mello-badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'mello-badge-fail';
    return 'mello-badge-na';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <div className="max-w-[1000px] mx-auto px-6 py-12" ref={reportRef}>
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={getBadge(report.overallStatus || report.overall_compliance)}>{report.overallStatus || report.overall_compliance}</div>
              <span className="text-[13px] text-text-muted font-mono">ID: {report.id}</span>
            </div>
            <h1 className="text-[40px] font-medium tracking-tight leading-[1.1] mb-2">{report.product?.product_name || 'Unknown Product'}</h1>
            <p className="text-[16px] text-text-secondary">{report.product?.brand_name || 'No Brand'}</p>
          </div>
          <div className="text-right mello-card-flat px-6 py-4 flex flex-col items-center">
             <div className="text-[13px] text-text-muted mb-1">Compliance Score</div>
             <div className="text-[40px] font-medium tracking-tight">{report.compliance_score || 0}%</div>
          </div>
        </div>

        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-tight">Compliance Ledger</h3>
                <div className="text-[12px] font-mono text-text-muted">Legal Metrology Rules, 2011</div>
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
                              {v.status.replace('POTENTIAL NON-COMPLIANCE', 'FAIL')}
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
               <h3 className="text-2xl font-medium tracking-tight">Extracted Data</h3>
               
               <div className="flex flex-col gap-4">
                 {(() => {
                   const fields = report.extractedFields || report.extracted_fields || {};
                   
                   const groups = {
                     'Identity': ['manufacturer_name', 'manufacturer_address', 'common_name', 'product_name', 'brand_name', 'country_of_origin'],
                     'Quantity & Price': ['net_quantity', 'net_quantity_unit', 'mrp', 'mrp_includes_tax_statement'],
                     'Dates': ['mfg_date', 'best_before', 'import_date'],
                     'Consumer Support': ['consumer_care_details', 'customer_care']
                   };

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
                   
                   // Render unassigned fields
                   const assignedKeys = Object.values(groups).flat();
                   const unassignedKeys = Object.keys(fields).filter(k => !assignedKeys.includes(k) && !k.startsWith('_'));
                   if (unassignedKeys.length > 0) {
                     renderedGroups.push(renderGroup('Other Data', unassignedKeys));
                   }
                   
                   if (renderedGroups.length === 0) {
                     return <div className="mello-card p-5 text-text-muted text-sm text-center">No structured data extracted.</div>;
                   }

                   return renderedGroups;
                 })()}
               </div>

               <div className="mt-2 flex flex-col gap-3">
                 <button onClick={downloadPDF} className="mello-btn-primary w-full shadow-lg">Download Official Notice PDF</button>
                 {localStorage.getItem('role') === 'admin' && (
                    <button onClick={handleDelete} className="mello-btn-secondary w-full text-red-500 border-red-900/30 hover:bg-red-500/10">Delete Record</button>
                 )}
               </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
  if (!report) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-red-500">Not found</div></div>;

  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
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
    if (s === 'PASS') return 'mello-badge-pass';
    if (s === 'MANUAL REVIEW') return 'mello-badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'mello-badge-fail';
    return 'mello-badge-na';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <div className="max-w-[1000px] mx-auto px-6 py-12" ref={reportRef}>
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={getBadge(report.overallStatus || report.overall_compliance)}>{report.overallStatus || report.overall_compliance}</div>
              <span className="text-[13px] text-text-muted font-mono">ID: {report.id}</span>
            </div>
            <h1 className="text-[40px] font-medium tracking-tight leading-[1.1] mb-2">{report.product?.product_name || 'Unknown Product'}</h1>
            <p className="text-[16px] text-text-secondary">{report.product?.brand_name || 'No Brand'}</p>
          </div>
          <div className="text-right mello-card-flat px-6 py-4 flex flex-col items-center">
             <div className="text-[13px] text-text-muted mb-1">Compliance Score</div>
             <div className="text-[40px] font-medium tracking-tight">{report.compliance_score || 0}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="text-[18px] font-medium tracking-tight mb-2">Rule Checks</h3>
            {(report.violations || []).map((v, i) => (
              <div key={i} className="mello-card-flat hover:bg-surface/80 transition-colors cursor-pointer" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                <div className="flex justify-between items-center p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-[6px] h-[6px] rounded-full bg-mist"></div>
                    <span className="font-medium text-[15px]">{v.rule_id}</span>
                  </div>
                  <div className={getBadge(v.status)}>{v.status}</div>
                </div>
                {expandedRule === i && (
                  <div className="px-5 pb-5 pt-2 border-t border-border text-[14px] text-text-primary leading-relaxed bg-surface/30 rounded-b-[24px]">
                    {v.detail || v.detail_text}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mello-card p-6 mt-6">
              <h3 className="text-[15px] font-medium mb-4">Raw Extraction Log</h3>
              <div className="bg-background border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap">
                {report.ocr_raw_text || 'No raw text available.'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-[18px] font-medium tracking-tight mb-2">Extracted Data</h3>
             <div className="mello-card p-6">
               <div className="flex flex-col">
                 {Object.entries(report.extractedFields || report.extracted_fields || {}).map(([k,v]) => (
                   <div key={k} className="py-3 flex flex-col gap-1 border-b border-border last:border-0">
                     <span className="text-[12px] text-text-muted uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                     <span className="text-[14px] font-medium text-text-primary truncate">{String(v)}</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="col-span-1">
               <button onClick={downloadPDF} className="mello-btn-primary w-full mb-3">Download PDF Notice</button>
               {localStorage.getItem('role') === 'admin' && (
                  <button onClick={handleDelete} className="mello-btn-secondary w-full text-[#f87171] border-[#521c1c] hover:bg-[#260e0e]">Delete Record</button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
