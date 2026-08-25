"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';

export default function Upload() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Select, 2: Processing, 3: Done
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [sourceType, setSourceType] = useState('physical_label');
  
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStep(2);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', productName);
    formData.append('category', category);
    formData.append('source_type', sourceType);

    try {
      const res = await fetch(`${API}/scans/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      
      // Simulate processing delay for UI effect
      setTimeout(() => {
        setStep(3);
        router.push(`/results/${data.id || 'demo-123'}`);
      }, 2000);
    } catch (err) {
      setTimeout(() => {
        setStep(3);
        router.push(`/results/demo-error`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center w-full max-w-2xl">
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 1 ? 'gradient-accent-bg text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-[var(--bg-raised)]'}`}>1</div>
              <span className="text-sm font-medium">Select Image</span>
            </div>
            <div className={`h-1 flex-1 mx-2 rounded ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-raised)]'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 2 ? 'gradient-accent-bg text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-[var(--bg-raised)]'}`}>2</div>
              <span className="text-sm font-medium">Processing</span>
            </div>
            <div className={`h-1 flex-1 mx-2 rounded ${step >= 3 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-raised)]'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 3 ? 'bg-[var(--pass)] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[var(--bg-raised)]'}`}>3</div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <div className="glass rounded-2xl p-1 mb-8 shadow-2xl">
              <div 
                className="bg-[var(--bg-surface)] rounded-xl border-2 border-dashed border-[var(--border-bright)] hover:border-[var(--accent-border)] p-12 text-center transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {preview ? (
                  <div className="mx-auto w-64 h-64 relative rounded-lg overflow-hidden border border-[var(--border)] shadow-md">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--bg-raised)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-display font-medium text-white mb-2">Upload Label Image</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4">Drag and drop or click to browse</p>
                    <p className="text-xs text-[var(--text-faint)]">Supports JPG, PNG, WEBP up to 10MB</p>
                  </div>
                )}
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <form onSubmit={handleUpload} className="card p-8">
              <h3 className="text-lg font-display font-semibold mb-6">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Product Name</label>
                  <input type="text" className="input" placeholder="e.g. Amul Taaza Milk" value={productName} onChange={e => setProductName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                  <select className="input" value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="">Select a category</option>
                    <option value="food">Food & Beverages</option>
                    <option value="cosmetics">Cosmetics</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Apparel</option>
                    <option value="other">Other Packaged Commodity</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Source Type</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3 ${sourceType === 'physical_label' ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border-bright)] bg-[var(--bg-surface)] hover:border-[var(--text-faint)]'}`}>
                      <input type="radio" name="source" value="physical_label" checked={sourceType === 'physical_label'} onChange={() => setSourceType('physical_label')} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sourceType === 'physical_label' ? 'border-[var(--accent)]' : 'border-[var(--text-faint)]'}`}>
                        {sourceType === 'physical_label' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></div>}
                      </div>
                      <span className="font-medium">Physical Product Label</span>
                    </label>
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3 ${sourceType === 'ecommerce_listing' ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border-bright)] bg-[var(--bg-surface)] hover:border-[var(--text-faint)]'}`}>
                      <input type="radio" name="source" value="ecommerce_listing" checked={sourceType === 'ecommerce_listing'} onChange={() => setSourceType('ecommerce_listing')} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sourceType === 'ecommerce_listing' ? 'border-[var(--accent)]' : 'border-[var(--text-faint)]'}`}>
                        {sourceType === 'ecommerce_listing' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></div>}
                      </div>
                      <span className="font-medium">E-commerce Listing</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[var(--border-muted)]">
                <button type="submit" className="btn btn-primary px-8" disabled={!file}>
                  Analyze Compliance <span className="ml-2">→</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <div className="card p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--bg-raised)]">
                <div className="h-full bg-[var(--accent)] w-1/2 animate-scan"></div>
              </div>
              <h2 className="text-2xl font-display font-bold mb-8 gradient-accent">Analyzing Label...</h2>
              
              {preview && (
                <div className="w-48 h-48 mx-auto mb-8 relative rounded-xl overflow-hidden shadow-2xl border-2 border-[var(--border-bright)] scan-line-container">
                  <img src={preview} alt="Scanning" className="w-full h-full object-cover grayscale opacity-80" />
                  <div className="absolute inset-0 bg-[var(--accent)] opacity-10"></div>
                </div>
              )}
              
              <div className="space-y-4 text-left px-8">
                <div className="flex items-center gap-4 text-[var(--pass)]">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="font-medium">Extracting OCR text</span>
                </div>
                <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                  <div className="w-6 h-6 flex items-center justify-center"><div className="w-2 h-2 bg-current rounded-full"></div></div>
                  <span>Identifying mandatory fields</span>
                </div>
                <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                  <div className="w-6 h-6 flex items-center justify-center"><div className="w-2 h-2 bg-current rounded-full"></div></div>
                  <span>Running LLM rule checks</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
