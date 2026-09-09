"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function PublicReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';
        const res = await fetch(`${API}/dashboard/public-reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          setReports(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch public reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 overflow-hidden relative">
      <div className="orb-saffron"></div>
      <div className="orb-blue"></div>
      
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-medium tracking-tight leading-[1.1]">Public Grievances Inbox</h1>
            <span className="badge badge-noncompliant">{reports.length} New</span>
          </div>
          <p className="text-[15px] text-text-secondary">Review non-compliance reports submitted via the Citizen Portal.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass rounded-2xl h-[600px] skeleton"></div>
            <div className="lg:col-span-2 glass rounded-2xl h-[600px] skeleton"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass rounded-[24px] p-12 text-center text-text-muted flex flex-col items-center border border-[var(--color-border)]">
            <svg className="w-16 h-16 mb-4 opacity-50 text-pass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-text-primary mb-2">Inbox Empty</h2>
            <p>No new public reports to review. The markets are clear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Feed List */}
            <div className="lg:col-span-1 glass rounded-[24px] border border-[var(--color-border)] overflow-hidden flex flex-col h-[700px]">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <h3 className="font-bold text-text-primary">Incoming Feed</h3>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {reports.map((report) => {
                  let imgUrl = null;
                  try {
                    const parsed = JSON.parse(report.original_image);
                    if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                  } catch (e) {}

                  const isSelected = selectedReport?.id === report.id;
                  
                  return (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-accent bg-[var(--color-surface)] shadow-md' : 'border-transparent hover:border-[var(--color-border)] hover:bg-white/5'}`}
                    >
                      <div className="flex gap-3">
                        {imgUrl ? (
                          <img src={imgUrl} className="w-16 h-16 rounded-lg object-cover bg-[var(--color-background)] border border-[var(--color-border)]" alt="Report" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[var(--color-background)] flex items-center justify-center border border-[var(--color-border)]">
                            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.overall_compliance === 'PASS' ? 'bg-pass-bg text-pass' : 'bg-[var(--color-noncompliant)]/10 text-[var(--color-noncompliant)]'}`}>
                              {report.overall_compliance}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-text-primary line-clamp-1">
                            {report.extracted_fields?.product_name || 'Unknown Product'}
                          </p>
                          <p className="text-[11px] text-noncompliant mt-1 font-bold">
                            {report.total_violations} Violations
                          </p>
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
                        {selectedReport.extracted_fields?.product_name || 'Unidentified Product'}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {selectedReport.extracted_fields?.brand_name || 'Brand Unknown'} • {selectedReport.extracted_fields?.product_category || 'No Category'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary py-2 px-4 text-sm bg-pass-bg text-pass border-pass/20">Clear Record</button>
                      <button className="btn btn-primary py-2 px-4 text-sm bg-[var(--color-noncompliant)] shadow-[0_0_15px_rgba(239,68,68,0.3)] border-none text-white">Dispatch Notice</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image & GPS */}
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

                      {selectedReport.latitude && selectedReport.longitude && (
                        <div>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Location Coordinates</h4>
                          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary font-mono">{selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}</p>
                              <p className="text-xs text-pass">Verified GPS Lock</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: AI Analysis */}
                    <div>
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
                          
                          {/* Extracted Fields */}
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