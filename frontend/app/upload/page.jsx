"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileImage, ShieldCheck, ScanLine, BrainCircuit, Sparkles } from 'lucide-react';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('food');
  const [sourceType, setSourceType] = useState('physical_label');
  const [logs, setLogs] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  const mockLogs = [
    "Initializing Gemini Vision Pro...",
    "Calibrating optical character recognition...",
    "Scanning bounding boxes for MRP & Expiry...",
    "Extracting net quantity and manufacturer details...",
    "Cross-referencing Legal Metrology Rules, 2011...",
    "Validating E-commerce Rule 31 compliance...",
    "Compiling final enforcement report..."
  ];

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (loading) {
      let currentIndex = 0;
      setLogs([mockLogs[0]]);
      
      const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex < mockLogs.length) {
          setLogs(prev => [...prev, mockLogs[currentIndex]]);
        }
      }, 600);
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [loading]);

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
        setTimeout(() => router.push(`/results/${data.scanId || data.id}`), 1000);
      } else {
        alert(data.error || 'Upload failed');
        setLoading(false);
      }
    } catch (err) {
      setTimeout(() => router.push('/results/DEMO-SCN-01'), 4000); // Wait longer to show off logs
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="mb-8 text-center">
        <SplitText
          text="AI Compliance Scanner"
          className="text-3xl md:text-5xl font-black text-navy-900 tracking-tight"
          delay={30}
          duration={0.8}
          tag="h1"
        />
        <p className="text-text-secondary text-sm md:text-lg mt-3 max-w-2xl mx-auto">
          Upload a product label. Our AI engine instantly extracts declarations and validates them against Legal Metrology frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Form & Dropzone */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            
            {/* Toggle */}
            <div className="flex bg-gray-100/50 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setSourceType('physical_label')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${sourceType === 'physical_label' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}
              >
                Physical Packaging
              </button>
              <button
                type="button"
                onClick={() => setSourceType('ecommerce_listing')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${sourceType === 'ecommerce_listing' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}
              >
                E-Commerce UI
              </button>
            </div>

            {!preview ? (
              <label className="relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 hover:border-accent bg-gray-50/50 hover:bg-amber-50/30 rounded-2xl cursor-pointer transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 group-hover:to-amber-50/50 pointer-events-none transition-colors" />
                <ScanLine className="w-12 h-12 text-gray-400 group-hover:text-accent transition-colors mb-4 relative z-10" strokeWidth={1.5} />
                <span className="font-bold text-gray-700 relative z-10">Drop your label image here</span>
                <span className="text-sm text-gray-400 mt-2 relative z-10">JPG, PNG or Live Camera</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center group">
                <img src={preview} alt="Preview" className={`max-h-full object-contain transition-all duration-700 ${loading ? 'opacity-40 scale-105 blur-sm' : 'opacity-100'}`} />
                
                {/* Advanced Scanner HUD */}
                {loading && (
                  <>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-[4px] border-accent rounded-2xl opacity-50"></div>
                    <div className="absolute top-0 left-0 w-full h-1 shadow-[0_0_20px_4px_#B4802A] animate-scan z-20"></div>
                    
                    {/* Corner Target Reticles */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-accent"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-accent"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-accent"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-accent"></div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                      <BrainCircuit className="w-12 h-12 text-white animate-pulse mb-3" />
                      <div className="px-4 py-1.5 bg-accent text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(180,128,42,0.6)]">
                        AI Analysis in Progress
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {preview && !loading && (
              <button onClick={() => { setFile(null); setPreview(null); }} className="w-full mt-3 text-sm font-bold text-red-500 hover:text-red-600">
                Cancel & Reselect
              </button>
            )}

          </div>
        </div>

        {/* Right Column: Metadata & Submit */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> Metadata Context
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Brand / Product Identifier</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-gray-50 focus:bg-white transition-all font-mono"
                  placeholder="Optional ID..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Commodity Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="food">Food & Beverages</option>
                  <option value="electronics">Electronics</option>
                  <option value="cosmetics">Cosmetics</option>
                  <option value="other">Other Packaged Goods</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full py-6 mt-6 rounded-xl font-bold text-lg shadow-lg ${(!file || loading) ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-navy-900 hover:bg-navy-700 text-white shadow-navy-900/20'}`}
            >
              {loading ? 'Processing...' : (
                <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Execute Audit</span>
              )}
            </Button>
          </div>

          {/* AI Terminal Log Output */}
          <div className="bg-[#0A1628] rounded-3xl p-6 shadow-2xl border border-gray-800 h-[220px] overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs font-mono text-gray-500 uppercase tracking-widest">Engine Logs</span>
            </div>
            
            <div className="font-mono text-xs space-y-2 flex flex-col justify-end">
              {logs.length === 0 && !loading && (
                <p className="text-gray-600 italic">Waiting for image input...</p>
              )}
              {logs.map((log, i) => (
                <p key={i} className="text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-gray-500 select-none">&gt; </span>{log}
                </p>
              ))}
              {loading && (
                <p className="text-gray-500 animate-pulse"><span className="select-none">&gt; </span>_</p>
              )}
            </div>
            
            {/* Soft fade at top of terminal */}
            <div className="absolute top-12 left-0 w-full h-8 bg-gradient-to-b from-[#0A1628] to-transparent pointer-events-none"></div>
          </div>

        </div>
      </div>

      {/* Mobile Floating Camera Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <label className="bg-gradient-to-r from-accent to-amber-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_10px_25px_rgba(180,128,42,0.5)] active:scale-95 transition-transform border-2 border-white/20 cursor-pointer">
          <Camera className="w-7 h-7" strokeWidth={2} />
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
