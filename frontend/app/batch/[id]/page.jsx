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
    
    let intervalId;
    
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
          intervalId = setTimeout(fetchBatch, 2000);
        } else {
          setLoading(false);
          // If only 1 scan exists and it's completed, redirect directly to results page for seamless UX
          if (data.status === 'completed' && data.scans?.length === 1) {
             router.replace(`/results/${data.scans[0].id}`);
          }
        }
      } catch(err) {
        setLoading(false);
        toast.error('Failed to load scan batch');
      }
    };
    
    fetchBatch();
    
    return () => clearTimeout(intervalId);
  }, [resolvedParams, router]);

  if (!resolvedParams) return null;

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {loading || batch?.status === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-surface rounded-full animate-spin border-t-accent"></div>
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-[20px] font-medium text-text-primary mb-2 animate-pulse">
                {batch?.status === 'processing' ? 'Running Legal Compliance Engine...' : 'Analyzing Image...'}
              </h2>
              <div className="h-8 mb-4 flex items-center justify-center">
                <p className="text-accent text-sm font-medium animate-fade-in text-center">
                   {batch?.status === 'processing' ? 'This takes about 10-15 seconds. Please do not close this window.' : 'Initializing Cloud AI...'}
                </p>
              </div>
              <p className="text-text-secondary text-center max-w-md">
                The AI Brain is scanning the image to detect products, evaluating image quality, and computing 15+ strict Legal Metrology checks.
              </p>
            </div>
          </div>
        ) : batch?.status === 'failed' ? (
           <div className="flex flex-col items-center justify-center py-32 text-center">
             <h2 className="text-[22px] font-medium text-red-500 mb-2">Scan Failed</h2>
             <p className="text-text-secondary mb-6">We could not process this image. Please try again.</p>
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
                        {scan.extracted_fields?.is_wholesale_or_multipiece_package && (
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
