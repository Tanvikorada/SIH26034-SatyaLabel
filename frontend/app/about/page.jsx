"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Scale, Cpu, FileText } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export default function AboutPage() {
  const router = useRouter();
  const RULES_VERSION = 'v1.4 — LM(PC) Rules 2011, Amendment 2022';
  const APP_VERSION   = '2.5.0';
  const BUILD_DATE    = '2026-09-04';

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      
      {/* ── App Bar ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[var(--color-border)] h-16 flex items-center px-4 md:px-6">
        <button 
          onClick={() => { triggerHaptic('light'); router.back(); }}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="text-[17px] font-bold ml-2">About SatyaLabel</h1>
      </div>

      <main className="max-w-[700px] mx-auto px-4 md:px-6 py-8 animate-fade-in">
        
        {/* ── Header / Logo Area ───────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4500A] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            <ShieldCheck size={40} className="text-white relative z-10" />
          </div>
          <h2 className="text-[28px] font-bold tracking-tight text-text-primary">SatyaLabel</h2>
          <p className="text-[15px] font-medium text-accent uppercase tracking-widest mt-1">SIH26034</p>
          <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto leading-relaxed">
            AI-driven compliance engine for the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        {/* ── Info Cards ───────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          
          <section className="glass rounded-[24px] border border-border/50 p-6 shadow-sm">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted mb-4">Project Overview</h3>
            <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
              <p>
                <strong>SatyaLabel</strong> is built for the Smart India Hackathon (SIH) under the problem statement <strong>SIH26034</strong> issued by the <strong>Department of Consumer Affairs, Government of India</strong>.
              </p>
              <p>
                The objective is to automate the scrutiny of pre-packaged commodity labels. By leveraging advanced Vision AI, the system instantly identifies mandatory declarations like Product Name, Net Quantity, MRP, Manufacturer Details, and FSSAI Licenses.
              </p>
            </div>
          </section>

          <section className="glass rounded-[24px] border border-border/50 p-6 shadow-sm">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted mb-4">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="mt-1 text-accent"><Cpu size={20} /></div>
                <div>
                  <h4 className="font-semibold text-text-primary text-[14px]">Vision Extraction</h4>
                  <p className="text-[13px] text-text-secondary mt-1">Extracts nested text using Gemini Flash Vision and Tesseract OCR fallbacks.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 text-accent"><Scale size={20} /></div>
                <div>
                  <h4 className="font-semibold text-text-primary text-[14px]">Rule Validation</h4>
                  <p className="text-[13px] text-text-secondary mt-1">Executes 14+ specific clauses of the LM(PC) rules against extracted data.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 text-accent"><FileText size={20} /></div>
                <div>
                  <h4 className="font-semibold text-text-primary text-[14px]">Exportable Audits</h4>
                  <p className="text-[13px] text-text-secondary mt-1">Generates legally compliant PDF notices and CSV data exports.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
            <div className="p-5 bg-black/5 dark:bg-white/5 border-b border-border/50">
              <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted">System Details</h3>
            </div>
            <div className="p-5 text-[13px] text-text-secondary space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">App Version</span>
                <span className="font-semibold text-text-primary">{APP_VERSION}</span>
                
                <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">Build Date</span>
                <span className="font-semibold text-text-primary">{BUILD_DATE}</span>
                
                <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">Rules Engine</span>
                <span className="font-semibold text-text-primary">{RULES_VERSION}</span>
                
                <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">Frontend</span>
                <span className="font-semibold text-text-primary">Next.js 16 (App Router)</span>
                
                <span className="text-text-muted font-mono text-[11px] uppercase tracking-wider">Backend</span>
                <span className="font-semibold text-text-primary">Node.js + PostgreSQL</span>
              </div>
            </div>
          </section>

          {/* THE SIGNATURE PILL */}
          <div className="mt-16 pb-12 flex justify-center">
            <div className="relative group cursor-pointer select-none">
              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-rose-500/30 to-amber-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Glass Capsule */}
              <div className="relative glass border border-border/50 rounded-full px-6 py-3 flex items-center gap-2.5 transition-all duration-300 group-hover:border-accent/40 group-active:scale-95 shadow-sm">
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-text-secondary">Crafted with</span>
                <svg className="w-4 h-4 text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-text-secondary">by</span>
                <span className="text-[14px] font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-accent to-amber-400 drop-shadow-sm ml-1">
                  Tanvi
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
