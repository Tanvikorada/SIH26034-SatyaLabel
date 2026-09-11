"use client";
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

export default function PublicReportPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location denied')
      );
    }

    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English, handles local names better
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setComplaintText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error("Microphone error: " + event.error);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error("Voice typing is not supported in this browser.");
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... Speak your complaint.");
      } catch (e) {
        console.error(e);
      }
    }
  };

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
      if (complaintText) formData.append('complaintText', complaintText);
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
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center relative overflow-x-hidden">
        <div className="orb-saffron"></div>
        <div className="orb-blue"></div>
        <div className="z-10 animate-fade-in glass p-8 rounded-3xl max-w-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-pass-bg text-pass rounded-full flex items-center justify-center mb-6 border border-pass">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
          <p className="text-text-muted mb-8 max-w-xs mx-auto text-sm">Thank you for keeping our markets safe. Your report has been dispatched to the central AI command.</p>
          <button onClick={() => {setSubmitted(false); setFile(null); setPreview(null); setComplaintText('');}} className="btn btn-secondary w-full py-3">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-text-primary flex flex-col items-center justify-center p-4 py-8 relative overflow-x-hidden">
      <div className="orb-saffron"></div>
      <div className="orb-blue"></div>
      <div className="w-full max-w-md glass rounded-[24px] p-6 shadow-2xl z-10 animate-fade-in my-auto">
        
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">SatyaLabel</h1>
            <p className="text-[12px] text-accent font-medium tracking-wide uppercase">Public Reporting Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] hover:border-accent transition-colors flex flex-col items-center justify-center group cursor-pointer">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="text-sm font-medium text-text-primary">1. Tap to Take Photo</span>
                <span className="text-[10px] text-text-muted">Ensure text is readable</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary flex justify-between items-center">
              <span>2. Context & Location Details</span>
              <button 
                type="button" 
                onClick={toggleListen}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--color-surface)] text-text-secondary hover:bg-[var(--color-border)]'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                {isListening ? 'LISTENING...' : 'VOICE TYPE'}
              </button>
            </label>
            <textarea 
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="E.g. Bought this at XYZ store in Mumbai. The MRP is scratched off..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 text-sm min-h-[90px] focus:outline-none focus:border-accent resize-none placeholder:text-text-muted"
            />
          </div>

          <button 
            type="submit" 
            disabled={!file || loading}
            className={`btn w-full py-4 text-sm tracking-wide mt-2 ${!file ? 'opacity-50 cursor-not-allowed bg-[var(--color-surface)] text-text-muted' : 'btn-primary shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Dispatching Report...</>
            ) : (
              'Submit Report to Authorities'
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-[10px] text-text-muted uppercase tracking-widest font-mono">
          <span>Dept of Consumer Affairs</span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-pass' : 'bg-[var(--color-border)]'}`}></span> GPS {location ? 'Locked' : 'Off'}
          </span>
        </div>
      </div>
    </div>
  );
}

