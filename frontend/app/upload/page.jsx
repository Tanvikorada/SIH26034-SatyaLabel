"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import { triggerHaptic } from '@/utils/haptics';
import { openDB } from 'idb';
import NavBar from '@/components/NavBar';
import DynamicLoader from '@/components/DynamicLoader';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function UploadPage() {
  const router = useRouter();
  
  // Phase 1 Upgrade: Mode state
  const [activeMode, setActiveMode] = useState('physical'); // 'physical' or 'web'
  const [url, setUrl] = useState('');

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [sourceType, setSourceType] = useState('physical_label');
  const [logs, setLogs] = useState([]);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setLocError('Location access denied')
      );
    }
  }, []);

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      triggerHaptic();
      const newFiles = Array.from(e.target.files).slice(0, 3 - files.length); // limit 3
      if (newFiles.length === 0) return;
      
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const pollScanResult = async (batchId) => {
    let attempts = 0;
    while(attempts < 60) {
      const res = await fetch(`${API}/scans/batch/${batchId}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const json = await res.json();
      const payload = json.data || json;
      if(payload.status === 'complete' || payload.status === 'completed') {
        return payload.scans?.[0]?.id || payload.scanId || payload.scan_id;
      }
      if(payload.status === 'failed') {
        throw new Error(payload.error_message || payload.errorMessage || 'AI Analysis failed');
      }
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
    throw new Error('Timeout waiting for AI');
  };

  const handleWebPatrolSubmit = async (e) => {
    e.preventDefault();
    if (!url) return toast.error('Enter an E-Commerce URL');
    setLoading(true);
    setLogs(['Initiating Web Patrol scraper...', 'Fetching target URL...', 'Extracting Meta/OG Images...']);
    const toastId = toast.loading('Running E-Commerce Web Patrol...');

    try {
      const res = await fetch(`${API}/scans/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url,
          product_name: productName,
          source_type: 'ecommerce_listing',
          latitude: location?.lat,
          longitude: location?.lng
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Web Patrol failed');
      }
      const data = await res.json();
      setLogs(prev => [...prev, 'Target acquired.', 'Sending image payload to AI Brain...']);
      
      const scanId = await pollScanResult(data.data.batch_id);
      
      toast.success('Web Patrol Complete!', { id: toastId });
      setLoading(false);
      router.push(`/results/${scanId}`);

    } catch (err) {
      toast.error(err.message || 'Web Patrol failed', { id: toastId });
      setLoading(false);
    }
  };

  const handlePhysicalUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('No image selected');
    setLoading(true);
    setLogs([]);
    const toastId = toast.loading('Running local OCR extraction...');

    try {
      let rawText = '';
      try {
        const { data: { text } } = await Tesseract.recognize(files[0], 'eng', {
           logger: m => console.log(m)
        });
        rawText = text;
        toast.loading('Local OCR complete. Sending to AI Brain...', { id: toastId });
      } catch (tessErr) {
        console.warn('Tesseract failed locally:', tessErr);
        toast.loading('Local OCR failed. Uploading to Cloud Vision...', { id: toastId });
      }

      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      formData.append('source_type', sourceType);
      if (productName) formData.append('product_name', productName);
      if (rawText) formData.append('raw_text', rawText);
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }

      const res = await fetch(`${API}/scans`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      setLogs(['Images encrypted and securely uploaded.', 'Batch processing queued on remote cluster.', 'Awaiting AI extraction pipeline...']);
      
      const scanId = await pollScanResult(data.data.batch_id);
      
      toast.success('Analysis Complete', { id: toastId });
      setLoading(false);
      router.push(`/results/${scanId}`);

    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 overflow-hidden relative">
      <div className="orb-saffron"></div>
      <div className="orb-blue"></div>
      
      {loading && <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xl flex items-center justify-center"><DynamicLoader /></div>}
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto px-6 py-12 animate-fade-in relative z-10">
        <header className="mb-10">
          <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Initialize Scan</h1>
        <p className="text-[15px] text-text-secondary mb-10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> OCR Pipeline Active. Awaiting payload.
        </p>

        {/* Phase 1 Upgrade: Mode Tabs */}
          <div className="flex bg-[var(--color-border)] p-1 rounded-xl w-full max-w-[300px] mb-2 mx-auto md:mx-0">
            <button 
              type="button"
              onClick={() => setActiveMode('physical')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeMode === 'physical' ? 'bg-[var(--color-surface)] text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              Physical Scan
            </button>
            <button 
              type="button"
              onClick={() => setActiveMode('web')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeMode === 'web' ? 'bg-[var(--color-surface)] text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              Web Patrol (URL)
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 md:flex-none min-h-[calc(100vh-140px)] h-auto md:h-auto">
          
          <form onSubmit={activeMode === 'physical' ? handlePhysicalUpload : handleWebPatrolSubmit} className="glass rounded-[24px] p-8 col-span-3 flex flex-col gap-6 border border-[var(--color-border)] shadow-xl relative z-10">
            
            {activeMode === 'physical' ? (
              // ========================= PHYSICAL SCAN UI =========================
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">Product Image</label>
                    {location ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        GPS Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1">
                        {locError || 'Acquiring GPS...'}
                      </span>
                    )}
                  </div>
                  <div className="relative w-full flex-1 min-h-[200px] border-none sm:border-2 sm:border-dashed sm:border-slate-300 sm:hover:border-primary flex flex-col items-center justify-center rounded-2xl transition-colors bg-transparent sm:bg-slate-50">
                    {previews.length > 0 ? (
                      <div className="w-full flex flex-col gap-4">
                        <div className="text-[13px] text-text-secondary text-center">
                          Added {previews.length} of 3 photos. AI will synthesize all angles.
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center items-center">
                          {previews.map((src, i) => (
                            <div key={i} className="relative w-[100px] h-[140px] border border-border rounded-lg overflow-hidden group/img shadow-sm">
                              <img src={src} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:scale-110">
                                ✕
                              </button>
                            </div>
                          ))}

                          {previews.length < 3 && (
                            <div className="flex flex-col gap-3 w-[100px] h-[140px]">
                              <div className="relative h-1/2 rounded-lg border border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <span className="text-[10px] font-medium text-text-secondary">+ Camera</span>
                                <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              </div>
                              <div className="relative h-1/2 rounded-lg border border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <span className="text-[10px] font-medium text-text-secondary">+ Gallery</span>
                                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 relative z-10 w-full py-8">
                         <span className="text-sm font-semibold text-slate-500 mb-4 text-center px-4">Capture product label clearly. Make sure all text is readable.</span>
                         <div className="flex gap-4 w-full justify-center px-4">
                           <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                             <span className="text-[12px] font-medium text-text-primary">Take Photo</span>
                             <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                           </div>
                           <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                             <span className="text-[12px] font-medium text-text-primary">Gallery</span>
                             <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">Product Name (Optional)</label>
                    <input type="text" className="mello-input" placeholder="e.g. Organic Honey" value={productName} onChange={e => setProductName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">Source Type</label>
                    <select className="mello-input appearance-none" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                      <option value="physical_label">Physical Label (Package)</option>
                      <option value="ecommerce_listing">E-Commerce Listing</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              // ========================= WEB PATROL UI =========================
              <>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">E-Commerce URL</label>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      Web Scraper Active
                    </span>
                  </div>
                  <div className="relative w-full h-[200px] border-none sm:border-2 sm:border-dashed sm:border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center rounded-2xl p-6 text-center">
                     <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                     <p className="text-[14px] text-slate-600 font-medium mb-1">Paste a product URL</p>
                     <p className="text-[12px] text-slate-500">Supports Amazon, Flipkart, JioMart, etc.</p>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                     <input 
                       type="url" 
                       className="mello-input !border-blue-200 focus:!border-blue-500 focus:!ring-blue-500" 
                       placeholder="https://www.amazon.in/dp/B08... " 
                       value={url} 
                       onChange={e => setUrl(e.target.value)} 
                       required={activeMode === 'web'}
                     />
                  </div>
                  <div className="grid grid-cols-1 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">Product Name Hint (Optional)</label>
                      <input type="text" className="mello-input" placeholder="e.g. Organic Honey" value={productName} onChange={e => setProductName(e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className={`w-full mt-auto md:mt-2 h-[56px] text-[16px] font-bold shadow-[0_10px_30px_rgba(11,31,58,0.3)] active-press md:h-[50px] md:text-[14px] rounded-[18px] text-white transition-colors ${loading ? 'bg-[var(--color-border)] text-text-muted' : 'bg-gradient-to-r from-[var(--color-primary)] to-[#0A1A3A] hover:shadow-[0_15px_40px_rgba(11,31,58,0.4)]'}`} disabled={loading}>
              {loading ? (activeMode === 'web' ? 'Scraping URL...' : 'Processing scan...') : (activeMode === 'web' ? 'Execute Web Patrol' : 'Run Compliance Check')}
            </button>
          </form>

          <div className="glass rounded-[24px] p-6 col-span-2 flex flex-col h-[320px] md:h-[480px] border border-[var(--color-border)] shadow-xl relative z-10">
            <h3 className="text-[14px] font-medium tracking-tight mb-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-pass'}`}></div>
              Processing Steps
            </h3>
            <div className="flex-1 font-mono text-[12px] allow-select cursor-text leading-relaxed text-text-muted flex flex-col gap-2 overflow-y-auto bg-[var(--color-background)] rounded-xl p-5 border border-[var(--color-border)] shadow-inner">
              {!loading && logs.length === 0 && <span className="opacity-50">Awaiting input payload...</span>}
              {logs.map((log, i) => (
                <span key={i} className="text-text-primary font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-accent mr-2">&gt;</span>{log}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
