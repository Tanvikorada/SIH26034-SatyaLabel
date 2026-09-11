"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('token') || sessionStorage.getItem('role') !== 'admin') {
      return router.push('/dashboard');
    }
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/dashboard/public-reports`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to load reports');
        const json = await res.json();
        setReports(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [router]);

  const triggerAnalysis = async (batchId) => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/scans/batch/${batchId}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success("AI Analysis Started. Check back in 15 seconds.");
        setTimeout(() => window.location.reload(), 3000);
      } else {
        throw new Error("Failed to start analysis");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="orb-saffron"></div>
      <div className="orb-blue"></div>

      <NavBar />

      <main className="flex-1 p-6 md:p-10 relative z-10 animate-fade-in max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-text-primary mb-2">Public Grievances</h1>
          <p className="text-text-secondary text-sm">Review incoming reports from citizens and dispatch enforcement teams.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-text-muted">Loading reports...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Reports List */}
            <div className="glass rounded-[24px] p-6 shadow-xl border border-[var(--color-border)] h-[700px] flex flex-col">
              <h2 className="text-lg font-bold mb-4 px-2">Incoming Feed</h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {reports.map((report) => {
                  const isPending = report.status === 'pending_review' || report.pending_public;
                  return (
                    <div 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedReport?.id === report.id 
                          ? 'border-accent bg-accent/5 shadow-md scale-[1.02]' 
                          : isPending ? 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-accent/50'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-background)] overflow-hidden shrink-0 border border-[var(--color-border)] flex items-center justify-center">
                          {(() => {
                            let imgUrl = null;
                            try {
                              const parsed = JSON.parse(report.original_image);
                              if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                            } catch (e) {}
                            return imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="Thumb" /> : <span className="text-[10px]">No Img</span>;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isPending ? 'bg-orange-500/20 text-orange-600' :
                              report.overall_compliance === 'PASS' ? 'bg-pass-bg text-pass' : 'bg-[var(--color-noncompliant)]/10 text-[var(--color-noncompliant)]'
                            }`}>
                              {isPending ? 'NEW COMPLAINT' : report.overall_compliance}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-text-primary line-clamp-1">
                            {isPending ? 'Citizen Report' : (report.extracted_fields?.product_name || 'Unknown Product')}
                          </p>
                          {!isPending && (
                            <p className="text-[11px] text-noncompliant mt-1 font-bold">
                              {report.total_violations} Violations
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 glass rounded-[24px] border border-[var(--color-border)] h-[700px] flex flex-col overflow-hidden">
              {selectedReport ? (
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-[var(--color-border)]">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary mb-1">
                        {selectedReport.status === 'pending_review' ? 'Public Grievance Report' : (selectedReport.extracted_fields?.product_name || 'Unidentified Product')}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {selectedReport.status === 'pending_review' ? 'Awaiting AI Compliance Scan' : (selectedReport.extracted_fields?.brand_name || 'Brand Unknown')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedReport.status === 'pending_review' ? (
                        <button 
                          onClick={() => triggerAnalysis(selectedReport.batch_id)}
                          disabled={analyzing}
                          className="btn btn-primary py-2 px-6 text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] border-none text-white flex items-center gap-2"
                        >
                          {analyzing ? 'Starting...' : 'Run AI Check'}
                        </button>
                      ) : (
                        <button className="btn btn-primary py-2 px-4 text-sm bg-[var(--color-noncompliant)] shadow-[0_0_15px_rgba(239,68,68,0.3)] border-none text-white">Dispatch Notice</button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image, GPS, Context */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Submitted Evidence</h4>
                        <div className="rounded-xl overflow-hidden bg-[var(--color-background)] border border-[var(--color-border)] aspect-square flex items-center justify-center relative group">
                          {(() => {
                            let imgUrl = null;
                            try {
                              const parsed = JSON.parse(selectedReport.original_image);
                              if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                            } catch (e) {}
                            return imgUrl ? (
                              <img src={imgUrl} className="w-full h-full object-cover" alt="Evidence" />
                            ) : (
                              <span className="text-text-muted">No Image Data</span>
                            );
                          })()}
                        </div>
                      </div>

                      {selectedReport.user_complaint && (
                        <div>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Citizen Context (Voice/Text)</h4>
                          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-sm text-text-primary italic">
                            "{selectedReport.user_complaint}"
                          </div>
                        </div>
                      )}

                      {selectedReport.latitude && selectedReport.longitude && (
                        <div>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Location Coordinates</h4>
                          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary font-mono truncate">{selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}</p>
                              <p className="text-xs text-pass">Verified GPS Lock</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: AI Analysis */}
                    <div>
                      {selectedReport.status === 'pending_review' ? (
                         <div className="flex flex-col items-center justify-center h-full text-text-muted p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                           <svg className="w-12 h-12 mb-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           <h3 className="font-bold text-text-primary mb-2">Pending AI Check</h3>
                           <p className="text-sm">This is a raw public grievance. Click "Run AI Check" above to extract label data and compute compliance score.</p>
                         </div>
                      ) : (
                        <>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">AI Compliance Analysis</h4>
                          <div className="glass rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-text-primary">Status</span>
                            <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${selectedReport.overall_compliance === 'PASS' ? 'bg-pass-bg text-pass' : 'bg-[var(--color-noncompliant)]/10 text-[var(--color-noncompliant)]'}`}>
                              {selectedReport.overall_compliance}
                            </span>
                            </div>
                            
                            <div className="space-y-4 mt-6">
                              <div>
                                <span className="text-xs text-text-muted">Detected Violations</span>
                                <div className="text-2xl font-bold text-[var(--color-noncompliant)]">{selectedReport.total_violations}</div>
                              </div>
                              
                              <div>
                                <span className="text-xs text-text-muted mb-2 block">Extracted Legal Fields (OCR)</span>
                                <div className="bg-[var(--color-background)] rounded-lg p-3 text-xs font-mono text-text-secondary max-h-[250px] overflow-y-auto space-y-1 border border-[var(--color-border)]">
                                  {Object.entries(selectedReport.extracted_fields || {}).map(([key, value]) => (
                                    <div key={key} className="flex flex-col mb-2">
                                      <span className="text-text-muted">{key}:</span>
                                      <span className={!value ? 'text-[var(--color-noncompliant)]' : 'text-pass'}>{value ? String(value) : '[MISSING]'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-lg font-medium text-text-primary">Select a Report</p>
                  <p className="text-sm">Click on any incoming public grievance from the feed to review the evidence and take action.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


