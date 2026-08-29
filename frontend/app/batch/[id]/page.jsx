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
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-full max-w-md bg-surface/30 border border-border rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                {/* Animated scan line background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                  <div className="w-full h-[2px] bg-accent shadow-[0_0_15px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-surface rounded-full animate-spin border-t-accent"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">AI</div>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-medium text-text-primary">Legal Compliance Engine</h2>
                    <p className="text-[13px] text-accent animate-pulse">Running live analysis...</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px] border border-green-500/50">✓</div>
                    <span className="text-[13px] font-mono text-text-secondary">Image securely uploaded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-accent border-r-transparent animate-spin"></div>
                    <span className="text-[13px] font-mono text-text-primary">Extracting text & bounding boxes</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-30">
                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                    <span className="text-[13px] font-mono text-text-secondary">Cross-referencing Legal Metrology Act</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-30">
                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                    <span className="text-[13px] font-mono text-text-secondary">Generating official violation notices</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/50 text-center relative z-10">
                  <p className="text-[12px] text-text-muted">This deep-scan takes approximately 15 seconds.<br/>Please do not close this window.</p>
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
