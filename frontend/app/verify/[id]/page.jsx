"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, AlertTriangle, Camera, CheckCircle2, Search, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function VerifyProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reporting state
  const [showReport, setShowReport] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Fetch product details
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/public/verify/${id}`);
        if (res.ok) {
          const json = await res.json();
          setProduct(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // Get location for report
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location denied')
      );
    }
  }, [id]);

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Take a photo of the product first.');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('images', file);
      if (product) {
        formData.append('product_name', product.productName || product.product_name);
      }
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }

      const res = await fetch(`${API}/public/report`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If successfully submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center relative overflow-x-hidden">
        <div className="orb-saffron"></div>
        <div className="orb-blue"></div>
        <div className="z-10 animate-fade-in glass p-8 rounded-3xl max-w-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-pass-bg text-pass rounded-full flex items-center justify-center mb-6 border border-pass">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
          <p className="text-text-muted mb-8 max-w-xs mx-auto text-sm">
            Thank you for protecting consumer rights. This discrepancy has been securely routed to the authorities.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-secondary w-full py-3">Scan Another Product</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pb-20">
      <div className="orb-saffron"></div>
      <div className="orb-blue opacity-50"></div>
      
      {/* Official Header */}
      <div className="bg-[#1E3A8A] w-full pt-[env(safe-area-inset-top)] sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 p-4 shrink-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-10 w-auto object-contain brightness-0 invert opacity-90" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">Dept. of Consumer Affairs</span>
            <span className="font-bold text-[16px] text-white leading-none">SatyaLabel Verification</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-md mx-auto w-full z-10 flex flex-col mt-4">
        
        {/* Product Identity Card */}
        <div className="glass rounded-3xl p-6 border border-[var(--color-border)] shadow-xl mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Registered Product</span>
          </div>

          {product ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Brand Name</span>
                <p className="font-semibold text-lg">{product.brandName || product.brand_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Product Name</span>
                <p className="font-semibold">{product.productName || product.product_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Registered ID</span>
                <p className="font-mono text-xs text-text-secondary">{product.id}</p>
              </div>
            </div>
          ) : (
             <div className="flex flex-col gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-500">Unregistered QR Code</span>
                  <span className="text-xs text-text-secondary mt-1">This product ID was not found in the official registry. It may be counterfeit.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        {!showReport ? (
          <div className="flex flex-col gap-4 animate-fade-in">
             <div className="p-5 glass rounded-2xl border border-accent/30 bg-accent/5">
               <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-accent">
                 <Search size={16} /> Inspect the Packaging
               </h3>
               <p className="text-xs text-text-secondary leading-relaxed mb-4">
                 Does the physical product in your hand match these registered details? Check for missing MRP, Manufacturer Address, or expiry dates.
               </p>
               <button onClick={() => setShowReport(true)} className="btn w-full bg-accent hover:bg-orange-600 text-white font-bold py-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                 Report Discrepancy
               </button>
             </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 border border-[var(--color-border)] animate-fade-in">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold">Submit Grievance</h3>
               <button onClick={() => setShowReport(false)} className="text-xs font-semibold text-text-muted hover:text-text-primary px-2 py-1 rounded-md bg-[var(--color-surface)]">Cancel</button>
             </div>
             
             <form onSubmit={handleReportSubmit} className="flex flex-col gap-5">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] hover:border-accent transition-colors flex flex-col items-center justify-center group cursor-pointer">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Camera size={24} className="text-accent" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">Take Photo of Label</span>
                      <span className="text-[10px] text-text-muted">Capture the missing or incorrect info</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                <button type="submit" disabled={!file || submitting} className={`btn w-full py-4 text-sm tracking-wide ${!file ? 'opacity-50 cursor-not-allowed bg-[var(--color-surface)] text-text-muted' : 'btn-primary'}`}>
                  {submitting ? 'Encrypting & Sending...' : 'Submit to Authorities'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}

