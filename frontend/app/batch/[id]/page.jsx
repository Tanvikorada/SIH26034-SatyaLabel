'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function BatchPage({ params }) {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState(null);
  const router = useRouter();
  
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    if (!localStorage.getItem('token')) return router.push('/login');
    
          // Fetch initial state
      let eventSource;
      const fetchBatch = async () => {
        try {
          const res = await fetch(`${API}/scans/batch/${resolvedParams.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch batch');
          const json = await res.json();
          const data = json.data || json;
          
          setBatch(data);
          
          if (data.status === 'processing') {
            // Setup real-time SSE stream for updates instead of polling
            const token = localStorage.getItem('token');
            eventSource = new EventSource(`${API}/scans/batch/${resolvedParams.id}/stream?token=${token}`);
            
            eventSource.onmessage = (event) => {
              const streamData = JSON.parse(event.data);
              if (streamData.status !== 'processing') {
                eventSource.close();
                fetchBatch(); // Re-fetch to get the final complete data
              }
            };

            eventSource.onerror = () => {
              eventSource.close();
              // Fallback to polling if SSE fails
              setTimeout(fetchBatch, 3000);
            };
          } else if (data.status === 'complete' || data.status === 'completed') {
              if (data.scans && data.scans.length === 1) {
                router.push(`/results/${data.scans[0].id}`);
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
        } catch(err) {
          setLoading(false);
          toast.error('Failed to load scan batch');
        }
      };

      fetchBatch();
      
      return () => { if (eventSource) eventSource.close(); };
  }, [resolvedParams, router]);

  if (!resolvedParams) return null;

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {loading || batch?.status === 'processing' ? (
<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-4xl mx-auto my-8">
            
            {/* Main HUD Container */}
            <div className="w-full glass rounded-[24px] overflow-hidden border border-accent/30 shadow-[0_0_50px_rgba(99,91,255,0.1)] relative">
              
              {/* Header Bar */}
              <div className="bg-black/40 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-[12px] font-mono tracking-widest text-text-muted uppercase">SatyaLabel Legal Metrology Core [v2.4.1]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-accent animate-pulse">CONNECTION SECURE</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>

              {/* Grid Layout for Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-[400px]">
                
                {/* Left Side: Visual Scanner (1 col) */}
                <div className="col-span-1 border-r border-border/50 bg-black/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  
                  {/* Grid Background Effect */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Rotating Radar / Core */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-[spin_4s_linear_infinite]"></div>
                    {/* Inner Ring (Reverse) */}
                    <div className="absolute inset-4 rounded-full border border-dashed border-accent/30 animate-[spin_6s_linear_infinite_reverse]"></div>
                    {/* Center Core */}
                    <div className="absolute inset-16 rounded-full bg-accent/10 border border-accent shadow-[0_0_20px_rgba(99,91,255,0.4)] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent animate-pulse" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center z-10">
                    <div className="text-[12px] font-mono text-accent mb-1 tracking-widest">VISION ENGINE</div>
                    <div className="text-[10px] font-mono text-text-muted">Extracting Bounding Boxes...</div>
                  </div>
                </div>

                {/* Right Side: Terminal Log (2 cols) */}
                <div className="col-span-2 bg-[#050505]/80 p-6 font-mono text-[13px] leading-relaxed relative flex flex-col justify-end overflow-hidden">
                  
                  {/* Fake Terminal Logs container that scrolls up */}
                  <div className="absolute bottom-6 left-6 right-6 top-6 overflow-hidden z-10" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)' }}>
                    <div className="flex flex-col space-y-3 absolute bottom-8 w-full animate-[slideUp_15s_linear_forwards]">
                      
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+0.00s]</span> <span>&gt; INITIALIZING SECURE CLOUD HANDSHAKE...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+0.12s]</span> <span>&gt; IMAGE RECEIVED: [BLOB_ID: 9XF2-4A] (4.2 MB)</span></div>
                      <div className="text-accent flex gap-3"><span className="text-green-500">[+0.45s]</span> <span>&gt; WARMING UP GEMINI 1.5 PRO MULTIMODAL...</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+1.20s]</span> <span>&gt; EXECUTING OCR LAYER 1 (TEXT EXTRACTION)...</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+2.55s]</span> <span>&gt; APPLYING BOUNDING BOXES FOR FONT SIZE MEASUREMENT...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+4.10s]</span> <span>&gt; CROSS-REFERENCING: [Rule 6 - Manufacturer Address]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+4.80s]</span> <span>&gt; DETECTED: "PEPSICO INDIA HOLDINGS PVT. LTD."</span></div>
                      <div className="text-amber-500 flex gap-3"><span className="text-green-500">[+6.33s]</span> <span>&gt; VALIDATING [Rule 2 - MRP Inclusive of Taxes]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+7.15s]</span> <span>&gt; EXTRACTED DATA: MRP Rs. 10.00 (INCL. OF ALL TAXES)</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+9.00s]</span> <span>&gt; CROSS-REFERENCING: [Rule 6 - Best Before Date]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+9.50s]</span> <span>&gt; DETECTED DATE FORMAT: DD/MM/YY (NON-STANDARD COMPLIANCE FLAG)</span></div>
                      <div className="text-accent flex gap-3"><span className="text-green-500">[+11.20s]</span> <span>&gt; AGGREGATING RULE 1-33 RESULTS...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+13.40s]</span> <span>&gt; COMPILING LEGAL METROLOGY REPORT PACKET...</span></div>
                      <div className="text-green-500 flex gap-3 animate-pulse"><span className="text-green-500">[+14.80s]</span> <span>&gt; FINALIZING RESULT. WAITING FOR DATABASE SYNC...</span></div>
                      
                    </div>
                  </div>
                  
                  {/* Blinking Cursor */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 mt-4 z-20">
                    <span className="text-accent font-mono">&gt;</span>
                    <span className="w-2 h-4 bg-accent animate-ping"></span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          ) : batch?.status === 'failed' ? (
           <div className="flex flex-col items-center justify-center py-32 text-center">
             {batch?.error_message === 'SINGLE_IMAGE_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 text-3xl mx-auto">&#128161;</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Multiple Products Detected</h2>
                   <p className="text-text-secondary mb-6 max-w-md mx-auto">More than one product was detected in this photo. To maintain an accurate legal chain of evidence, please scan only one product at a time.</p>
                 </>
               ) : batch?.error_message === 'MULTIPLE_IMAGES_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 text-3xl mx-auto">&#128230;</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Please Scan One Item At A Time</h2>
                   <p className="text-text-secondary mb-6 max-w-md mx-auto">You uploaded photos of different products. The AI requires all photos in a single batch to be of the same item (e.g., front and back of the same bottle).</p>
                 </>
               ) : (
                 <>
                   <h2 className="text-[22px] font-medium text-red-500 mb-2">Scan Failed</h2>
                   <p className="text-text-secondary mb-6">{batch?.error_message || "We could not process this image. Please try again."}</p>
                 </>
               )}
             <button onClick={() => router.push('/upload')} className="mello-btn-secondary">Try Another Image</button>
           </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h1 className="text-[28px] font-medium tracking-tight text-text-primary mb-2">
                Products Detected: {batch?.scans?.length || 0}
              </h1>
              <p className="text-text-secondary">
                Select a product below to view its full compliance report and legal analysis.
              </p>
            </div>
            
            <div className="space-y-4">
              
              {batch?.scans?.length === 0 && batch?.status === 'completed' && (
                <div className="flex flex-col items-center justify-center py-16 bg-surface/30 rounded-2xl border border-border mt-8">
                  <div className="text-6xl mb-4 opacity-50">📦</div>
                  <h3 className="text-xl font-medium text-text-primary mb-2">No FMCG Products Detected</h3>
                  <p className="text-text-secondary text-center max-w-sm">
                    The AI could not identify any valid consumer packaging in this image. Please ensure the label is clearly visible and try again.
                  </p>
                  <button onClick={() => router.push('/upload')} className="mello-btn-secondary mt-6">Scan New Image</button>
                </div>
              )}
              {batch?.scans?.map((scan, i) => (
                <div 
                  key={scan.id} 
                  onClick={() => router.push(`/results/${scan.id}`)}
                  className="bg-surface/50 border border-border rounded-xl p-6 hover:border-accent/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] font-medium text-text-primary mb-1">
                        {scan.product_name || 'Unknown Product'}
                        {(scan.extracted_fields?.is_wholesale_or_multipiece_package === 'true' || scan.extracted_fields?.is_wholesale_or_multipiece_package === true) && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 align-middle uppercase tracking-wider">
                            Wholesale
                          </span>
                        )}
                        {scan.extracted_fields?._quality_warning && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 align-middle uppercase tracking-wider">
                            ⚠️ Poor Quality
                          </span>
                        )}
                      </h3>
                      <p className="text-[14px] text-text-secondary">
                        {scan.brand_name || 'No Brand'}
                      </p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[12px] font-medium border ${
                        scan.overallStatus === 'PASS' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        scan.overallStatus === 'POTENTIAL NON-COMPLIANCE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        scan.overallStatus === 'MANUAL REVIEW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-border text-text-secondary border-border'
                      }`}>
                        {scan.overallStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[13px] text-text-muted">
                     <span>Score: {scan.compliance_score}%</span>
                     <span className="text-accent group-hover:underline">View Report &rarr;</span>
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
