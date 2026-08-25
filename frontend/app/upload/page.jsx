"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Camera, FileImage, ShieldCheck } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');

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
      console.error(err);
      // Fallback for demo purposes if backend fails
      setTimeout(() => router.push('/results/DEMO-SCN-01'), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">New Inspection Scan</h1>
        <p className="text-gray-500">Capture or upload a product label for compliance verification</p>
      </div>

      <div className="gov-card p-6 md:p-8 space-y-8">
        {!preview ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#0f172a] hover:bg-gray-50 transition-colors">
              <Camera className="w-12 h-12 text-gray-400 mb-3" />
              <span className="font-medium text-[#0f172a]">Launch Camera</span>
              <span className="text-sm text-gray-500 mt-1 text-center">Capture packaging directly</span>
              {/* capture="environment" forces the rear camera on mobile */}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>

            <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#0f172a] hover:bg-gray-50 transition-colors">
              <FileImage className="w-12 h-12 text-gray-400 mb-3" />
              <span className="font-medium text-[#0f172a]">Upload Image</span>
              <span className="text-sm text-gray-500 mt-1 text-center">Select from gallery/files</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
              <img src={preview} alt="Preview" className="max-h-64 object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[#059669] rounded-full animate-spin"></div>
                  <p className="mt-4 font-semibold text-[#0f172a]">Running Compliance Engine...</p>
                  <p className="text-sm text-gray-500">Extracting text & verifying rules</p>
                </div>
              )}
            </div>
            {!loading && (
              <button onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-red-600 font-medium hover:underline">
                Remove & Rescan
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name / Brand (Optional)</label>
            <input 
              type="text" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-[#0f172a]"
              placeholder="e.g. Haldiram Bhujia 200g"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!file || loading}
            className={`w-full gov-btn flex items-center justify-center gap-2 py-3 ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Verify Compliance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
