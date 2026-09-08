"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function PublicReportPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location denied')
      );
    }
  }, []);

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Take a photo of the product label first.');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('images', file);
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }

      const res = await fetch(\/public/report, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">Thank you for keeping our markets safe. Your report has been dispatched to the central AI command.</p>
        <button onClick={() => {setSubmitted(false); setFile(null); setPreview(null);}} className="bg-slate-800 hover:bg-slate-700 py-3 px-8 rounded-full font-medium">Submit Another</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-[24px] p-6 shadow-2xl border border-slate-700">
        
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">SatyaLabel</h1>
            <p className="text-[12px] text-amber-400 font-medium tracking-wide uppercase">Public Reporting Portal</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-300 mb-6 leading-relaxed">
          Found a product missing MRP, Manufacturer details, or FSSAI license? Take a photo to alert the authorities immediately.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-600 hover:border-amber-500 transition-colors flex flex-col items-center justify-center group cursor-pointer">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="text-sm font-medium text-slate-300">Tap to Take Photo</span>
                <span className="text-[10px] text-slate-500">Ensure text is readable</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          <button 
            type="submit" 
            disabled={loading || !file}
            className={\w-full py-4 rounded-xl text-sm font-bold tracking-wide flex justify-center items-center gap-2 transition-all \\}
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing Image...</>
            ) : (
              'Submit Report to AI'
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
          <span>Dept of Consumer Affairs</span>
          <span className="flex items-center gap-1">
            <span className={\w-1.5 h-1.5 rounded-full \\}></span> GPS {location ? 'Locked' : 'Off'}
          </span>
        </div>
      </div>
    </div>
  );
}
