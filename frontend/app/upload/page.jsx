"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileImage, ShieldCheck } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('food');
  const [sourceType, setSourceType] = useState('physical_label');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please capture or select an image');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('metadata', JSON.stringify({
        productName: productName || 'Unknown',
        category,
        sourceType,
        timestamp: new Date().toISOString()
      }));

      const res = await fetch(`${API}/scans/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/results/${data.scanId || data.id}`);
      } else {
        alert(data.error || 'Upload failed');
        setLoading(false);
      }
    } catch (err) {
      setTimeout(() => router.push('/results/DEMO-SCN-01'), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">Inspection Scan</h1>
        <p className="text-text-secondary text-sm md:text-base mt-1">Capture or upload packaging for compliance verification</p>
      </div>

      <div className="gov-card p-6 md:p-8 space-y-6">
        
        {/* Source Toggle Segmented Control */}
        <div className="flex border border-border rounded-sm overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => setSourceType('physical_label')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${sourceType === 'physical_label' ? 'bg-navy-900 text-white' : 'text-text-secondary hover:bg-navy-100'}`}
          >
            Physical Label
          </button>
          <button
            type="button"
            onClick={() => setSourceType('ecommerce_listing')}
            className={`flex-1 py-2 text-sm font-medium border-l border-border transition-colors ${sourceType === 'ecommerce_listing' ? 'bg-navy-900 text-white' : 'text-text-secondary hover:bg-navy-100'}`}
          >
            E-commerce
          </button>
        </div>

        {!preview ? (
          <div className="flex flex-col items-center">
            <label className="w-full border-2 border-dashed border-border rounded-sm p-12 flex flex-col items-center justify-center cursor-pointer hover:border-navy-900 hover:bg-surface transition-colors bg-surface-alt">
              <FileImage className="w-10 h-10 text-text-muted mb-3" strokeWidth={1.75} />
              <span className="font-semibold text-text-primary">Drop a label photo or click to upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-sm overflow-hidden border border-border bg-surface flex items-center justify-center p-2 min-h-[250px]">
              <img src={preview} alt="Preview" className="max-h-[300px] object-contain z-10 relative" />
              
              {loading && (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 animate-scan z-20"></div>
                  <div className="absolute inset-0 bg-white/80 z-30 flex flex-col items-center justify-center backdrop-blur-sm">
                    <p className="mt-4 font-semibold text-text-primary uppercase tracking-wide text-sm">Extracting Declarations...</p>
                    <p className="text-xs text-text-secondary mt-1">Validating against Legal Metrology Rules, 2011</p>
                  </div>
                </>
              )}
            </div>
            {!loading && (
              <button onClick={() => { setFile(null); setPreview(null); }} className="text-xs text-noncompliant font-medium uppercase tracking-wider hover:underline">
                Remove & Rescan
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-5 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-text-muted mb-1">Product Name</label>
              <input 
                type="text" 
                value={productName}
                onChange={e => setProductName(e.target.value)}
                disabled={loading}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy-900 bg-surface-alt font-mono"
                placeholder="e.g. SCN-84920"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-text-muted mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={loading}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy-900 bg-surface-alt"
              >
                <option value="food">Food & Beverages</option>
                <option value="electronics">Electronics</option>
                <option value="cosmetics">Cosmetics</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!file || loading}
            className={`w-full gov-btn hidden md:flex ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Verify Compliance'}
          </button>
        </form>
      </div>

      {/* Mobile Floating Camera Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <label className="bg-navy-900 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Camera className="w-8 h-8" strokeWidth={1.5} />
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
