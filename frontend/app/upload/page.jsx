"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { openDB } from 'idb';
import NavBar from '@/components/NavBar';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('food');
  const [sourceType, setSourceType] = useState('physical_label');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, [router]);

  const saveToSyncQueue = async (fileBlob, metadata) => {
    try {
      const db = await openDB('SatyaLabelDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('sync-queue')) {
            db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
          }
        },
      });
      await db.add('sync-queue', { file: fileBlob, metadata, status: 'pending', timestamp: Date.now() });
    } catch (e) {
      console.error('IDB Error', e);
    }
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('No image selected');
    
    setLoading(true);
    const toastId = toast.loading('Initializing compliance scan...');
    const metadata = { productName: productName || 'Unknown', category, sourceType, timestamp: new Date().toISOString() };
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('metadata', JSON.stringify(metadata));

      const res = await fetch(`${API}/scans/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      toast.success('Scan complete', { id: toastId });
      setTimeout(() => router.push(`/results/${data.scanId || data.id || 'mock'}`), 1000);
    } catch (err) {
      await saveToSyncQueue(file, metadata);
      toast.warning('Network Offline', { id: toastId, description: 'Scan queued locally.' });
      setTimeout(() => router.push('/dashboard'), 3000); 
    }
  };

  useEffect(() => {
    if (loading) {
      const msgs = ['Initializing Vision Engine...', 'Detecting bounding boxes...', 'Extracting textual tokens...', 'Applying Legal Metrology Act...', 'Computing compliance vectors...'];
      let i = 0;
      const interval = setInterval(() => {
        if (i < msgs.length) {
          setLogs(prev => [...prev, `> ${msgs[i]}`]);
          i++;
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-midnight text-white">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Upload Scan</h1>
        <p className="text-[15px] text-mist mb-10">Submit physical or ecommerce labels for AI compliance checking.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <form onSubmit={handleUpload} className="mello-card p-8 col-span-3 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-pearl">Product Image</label>
              <div className="relative w-full h-[240px] border border-dashed border-graphite rounded-xl flex flex-col items-center justify-center bg-charcoal overflow-hidden group hover:border-mist transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <>
                     <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center mb-3">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                     </div>
                     <span className="text-[14px] text-mist font-medium">Click or drag image to upload</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-pearl">Product Name (Optional)</label>
                <input type="text" className="mello-input" placeholder="e.g. Organic Honey" value={productName} onChange={e => setProductName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-pearl">Source Type</label>
                <select className="mello-input appearance-none" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                  <option value="physical_label">Physical Label (Package)</option>
                  <option value="ecommerce_listing">E-Commerce Listing</option>
                </select>
              </div>
            </div>

            <button type="submit" className="mello-btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Processing scan...' : 'Run Compliance Check'}
            </button>
          </form>

          <div className="mello-card-flat p-6 col-span-2 flex flex-col h-[480px]">
            <h3 className="text-[14px] font-medium tracking-tight mb-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-[#4ade80] animate-pulse' : 'bg-graphite'}`}></div>
              System Output
            </h3>
            <div className="flex-1 font-mono text-[12px] leading-relaxed text-ash flex flex-col gap-2 overflow-y-auto bg-midnight rounded-lg p-4 border border-graphite">
              {!loading && logs.length === 0 && <span>Awaiting input payload...</span>}
              {logs.map((log, i) => (
                <span key={i} className="text-pearl animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
