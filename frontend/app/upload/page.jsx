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
    if (!file) return toast.error('No image selected', { description: 'Please capture or upload a product label.' });
    
    setLoading(true);
    const toastId = toast.loading('Initializing compliance scan...');
    
    const metadata = {
      productName: productName || 'Unknown',
      category,
      sourceType,
      timestamp: new Date().toISOString()
    };
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('metadata', JSON.stringify(metadata));

      const res = await fetch(${API}/scans/upload, {
        method: 'POST',
        headers: { 'Authorization': Bearer  },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Scan complete', { id: toastId, description: 'Redirecting to enforcement report.' });
        setTimeout(() => router.push(/results/), 1000);
      } else {
        toast.error('Scan failed', { id: toastId, description: data.error || 'Server rejected the upload.' });
        setLoading(false);
      }
    } catch (err) {
      await saveToSyncQueue(file, metadata);
      toast.warning('Network Offline', { id: toastId, description: 'Scan queued locally. Will sync when reconnected.' });
      setTimeout(() => router.push('/dashboard'), 4000); 
    }
  };

  // Add dummy logs if loading
  useEffect(() => {
    if (loading) {
      const msgs = ['Initializing Vision Engine...', 'Detecting bounding boxes...', 'Extracting textual tokens...', 'Applying Legal Metrology Act, 2011...', 'Computing compliance vectors...'];
      let i = 0;
      const interval = setInterval(() => {
        if (i < msgs.length) {
          setLogs(prev => [...prev, > ]);
          i++;
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <div className="max-w-[800px] mx-auto px-6 py-[80px]">
        <h1 className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-2">Upload Scan</h1>
        <p className="text-[18px] text-fog mb-12">Submit physical or ecommerce labels for AI compliance checking.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
          {/* Form */}
          <form onSubmit={handleUpload} className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-obsidian-ink">Product Image</label>
              <div className="relative w-full h-[200px] border border-ash rounded-lg flex items-center justify-center bg-canvas overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[14px] text-fog">Drag & Drop or Click</span>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg,image/png" 
                  onChange={handleFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-obsidian-ink">Product Name (Optional)</label>
              <input type="text" className="privy-input" value={productName} onChange={e => setProductName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-obsidian-ink">Source Type</label>
              <select className="privy-input bg-white appearance-none" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                <option value="physical_label">Physical Label (Package)</option>
                <option value="ecommerce_listing">E-Commerce Listing</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? 'Processing...' : 'Run Compliance Check →'}
            </button>
          </form>

          {/* Extrapolated Terminal Area */}
          <div className="privy-card-dark flex flex-col h-full min-h-[300px]">
            <h3 className="text-[14px] font-bold mb-4 tracking-[-0.02em]">System Output</h3>
            <div className="flex-1 font-mono text-[13px] text-fog flex flex-col gap-2 overflow-y-auto">
              {!loading && logs.length === 0 && (
                <span>Awaiting input payload...</span>
              )}
              {logs.map((log, i) => (
                <span key={i} className="text-canvas animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
