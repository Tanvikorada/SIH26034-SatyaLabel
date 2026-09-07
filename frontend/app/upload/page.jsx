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
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [sourceType, setSourceType] = useState('physical_label');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) router.push('/login');
  }, [router]);

  const handleFile = (e) => {
    triggerHaptic('medium');
    const selected = e.target.files?.[0];
    if (selected && files.length < 3) {
      setFiles(prev => [...prev, selected]);
      setPreviews(prev => [...prev, URL.createObjectURL(selected)]);
    }
    e.target.value = null;
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
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
      formData.append('product_name', productName || '');
      formData.append('source_type', sourceType || 'physical_label');
      if (rawText) formData.append('raw_text', rawText);

      const res = await fetch(`${API}/scans`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || json.message || 'Upload failed');

      const batchId = (json.data || json).batch_id;
      if (!batchId) {
        toast.warning('Check History for results.', { id: toastId });
        setTimeout(() => router.push('/history'), 1500);
        return;
      }

      // Poll every 3s — SSE is unreliable on Render free tier (connections drop silently)
      const steps = [
        'Initializing Vision Engine...',
        'Extracting text from image...',
        'Applying Legal Metrology rules...',
        'Computing compliance score...',
        'Saving compliance report...',
        'Finalizing...'
      ];
      let stepIdx = 0;

      const poll = setInterval(async () => {
        try {
          if (stepIdx < steps.length) {
            toast.loading(steps[stepIdx], { id: toastId });
            setLogs(prev => [...prev, `> ${steps[stepIdx]}`]);
            stepIdx++;
          }

          const br = await fetch(`${API}/scans/batch/${batchId}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
          });
          if (!br.ok) return;

          const bd = (await br.json()).data;
          if (!bd) return;

          if (bd.status === 'completed' || bd.status === 'complete') {
            clearInterval(poll);
            const scanId = bd.scans?.[0]?.id;
            if (!scanId) return; // keep polling until scan row appears
            toast.success('Scan complete! Loading results...', { id: toastId });
            setTimeout(() => router.push(`/results/${scanId}`), 400);
          } else if (bd.status === 'failed') {
            clearInterval(poll);
            const msg = bd.error_message || 'Scan failed';
            setLogs(prev => [...prev, `> ERROR: ${msg}`]);
            toast.error(`Scan failed: ${msg}`, { id: toastId });
            setLoading(false);
          }
        } catch (_) {
          // Keep polling on transient network errors
        }
      }, 3000);

      // Safety: stop after 3 minutes
      setTimeout(() => {
        clearInterval(poll);
        toast.error('Scan timed out. Check History for results.', { id: toastId });
        setLoading(false);
        router.push('/history');
      }, 180000);

    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {loading && <div className="fixed inset-0 z-[99999] bg-background flex items-center justify-center"><DynamicLoader /></div>}
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Initialize Scan</h1>
        <p className="text-[15px] text-text-secondary mb-10 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> OCR Pipeline Active. Awaiting payload.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-6 flex-1 md:flex-none min-h-[calc(100vh-140px)] h-auto md:h-auto">
          <form onSubmit={handleUpload} className="mello-card p-4 md:p-8 col-span-3 flex flex-col gap-4 md:gap-6 h-full md:h-auto border-0 md:border md:shadow-sm bg-transparent md:bg-[var(--color-surface)]">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">Product Image</label>
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

            <button type="submit" className="mello-btn-primary w-full mt-auto md:mt-2 h-[56px] text-[16px] font-bold shadow-[0_10px_30px_rgba(11,31,58,0.3)] active-press md:h-auto md:text-[14px]" disabled={loading}>
              {loading ? 'Processing scan...' : 'Run Compliance Check'}
            </button>
          </form>

          <div className="mello-card-flat p-6 col-span-2 flex flex-col h-[320px] md:h-[480px]">
            <h3 className="text-[14px] font-medium tracking-tight mb-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-[#4ade80] animate-pulse' : 'bg-border'}`}></div>
              Processing Steps
            </h3>
            <div className="flex-1 font-mono text-[12px] allow-select cursor-text leading-relaxed text-text-muted flex flex-col gap-2 overflow-y-auto bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-inner">
              {!loading && logs.length === 0 && <span>Awaiting input payload...</span>}
              {logs.map((log, i) => (
                <span key={i} className="text-slate-700 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
