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
<div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full max-w-5xl mx-auto">
            
            <div className="w-full">
              {/* Premium Header */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 relative">
                   <div className="absolute inset-0 rounded-full border border-accent/20 border-t-accent animate-spin" style={{ animationDuration: '3s' }}></div>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h1 className="text-[28px] font-medium tracking-tight text-text-primary mb-3">AI Compliance Engine</h1>
                <p className="text-[15px] text-text-secondary max-w-lg mx-auto leading-relaxed">
                  Executing rigorous multi-modal analysis against the Legal Metrology database. Please wait while the official report is compiled.
                </p>
              </div>

              {/* The Engine UI */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left: Phase Stepper */}
                <div className="col-span-1 md:col-span-5 flex flex-col justify-center space-y-8 pl-4 md:pl-12">
                  <div className="relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-border/40 rounded-full"></div>
                    <div className="absolute left-[11px] top-4 h-[70%] w-[2px] bg-gradient-to-b from-accent to-transparent rounded-full animate-pulse"></div>

                    <div className="space-y-8 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="w-[24px] h-[24px] rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] mt-0.5">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Secure Initialization</h4>
                          <p className="text-[13px] text-text-secondary">Image payload secured in cloud vault</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5">
                        <div className="w-[24px] h-[24px] rounded-full bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(99,91,255,0.4)] mt-0.5 ring-4 ring-accent/20">
                           <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Optical Extraction</h4>
                          <p className="text-[13px] text-accent">Extracting typographic declarations</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 opacity-40">
                        <div className="w-[24px] h-[24px] rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Rules Engine</h4>
                          <p className="text-[13px] text-text-secondary">Validating against legislative acts</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 opacity-40">
                        <div className="w-[24px] h-[24px] rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Finalizing</h4>
                          <p className="text-[13px] text-text-secondary">Generating PDF and sync</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: The Live Insight Card */}
                <div className="col-span-1 md:col-span-7">
                  <div className="glass rounded-[20px] p-8 md:p-10 border border-border h-full flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-border">
                       <div className="h-full bg-accent w-1/3 animate-[slideRight_3s_ease-in-out_infinite_alternate]"></div>
                    </div>
                    
                    <div className="mb-2 text-[11px] font-mono tracking-widest text-text-muted uppercase">Live Analysis Log</div>
                    
                    <div className="h-[120px] relative overflow-hidden mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)">
                       <div className="absolute bottom-4 left-0 w-full flex flex-col gap-4 animate-[slideUp_15s_linear_forwards]">
                          <div className="text-[15px] text-text-muted">Targeting bounding boxes on package geometry...</div>
                          <div className="text-[15px] text-text-muted">Isolating Manufacturer Address block...</div>
                          <div className="text-[15px] text-text-primary font-medium">Extracting textual data layer...</div>
                          <div className="text-[15px] text-text-primary font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Evaluating Rule 6 compliance parameters...</div>
                          <div className="text-[15px] text-text-muted">Verifying MRP formatting and tax inclusiveness...</div>
                          <div className="text-[15px] text-text-muted">Initiating biochemical composition check...</div>
                          <div className="text-[15px] text-text-primary font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> Cross-referencing E-number toxicity database...</div>
                          <div className="text-[15px] text-text-muted">Aggregating 33 rule outcomes...</div>
                          <div className="text-[15px] text-green-500 font-medium">Finalizing compliance payload...</div>
                       </div>
                    </div>

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
