"use client";

import Link from 'next/link';
import DemoCard from '@/components/DemoCard';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const scanSteps = [
    {
      label: "Idle",
      durationMs: 1500,
      content: (
        <div className="flex flex-col items-center opacity-50">
          <div className="w-12 h-12 rounded-full bg-graphite flex items-center justify-center mb-3">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <span className="text-[13px] font-medium">Drop label image</span>
        </div>
      )
    },
    {
      label: "Image Uploaded",
      durationMs: 1500,
      content: (
        <div className="w-full h-[180px] bg-charcoal rounded-xl overflow-hidden relative border border-graphite">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-80" alt="Product label" />
        </div>
      )
    },
    {
      label: "Extracting Declarations...",
      durationMs: 2500,
      content: (
        <div className="w-full h-[180px] bg-charcoal rounded-xl overflow-hidden relative border border-graphite">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-40 grayscale" alt="Scanning" />
          <motion.div 
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_10px_#fff]"
          />
        </div>
      )
    },
    {
      label: "Fields Resolved",
      durationMs: 3000,
      content: (
        <div className="w-full flex flex-col gap-3 font-mono text-[13px]">
          <div className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Net Qty</span><span className="text-white">100g</span></div>
          <div className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">MRP</span><span className="text-white">₹50.00</span></div>
          <div className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Mfg Date</span><span className="text-white">10/2025</span></div>
          <div className="flex justify-between"><span className="text-fog">Brand</span><span className="text-white">NatureFarm</span></div>
        </div>
      )
    }
  ];

  const validateSteps = [
    {
      label: "Checking Legal Metrology Rules...",
      durationMs: 2000,
      content: (
        <div className="w-full flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-mist border-t-white rounded-full mb-4"
          />
          <div className="h-6 overflow-hidden relative w-full text-center">
             <motion.div
               animate={{ y: [0, -24, -48, -72] }}
               transition={{ duration: 1.5, ease: "steps(3)" }}
               className="font-mono text-[13px] text-fog flex flex-col"
             >
               <span>Rule 6(1)(a) - Mfg Name...</span>
               <span>Rule 6(1)(c) - Net Qty...</span>
               <span>Rule 6(1)(d) - Mfg Date...</span>
               <span>Rule 6(1)(f) - MRP Format...</span>
             </motion.div>
          </div>
        </div>
      )
    },
    {
      label: "Violation Found",
      durationMs: 4000,
      content: (
        <div className="w-full flex flex-col items-center text-center">
           <div className="mello-badge-fail mb-4 text-[14px] px-3 py-1 scale-110">POTENTIAL NON-COMPLIANCE</div>
           <div className="text-[16px] font-medium text-white mb-2">Rule 6(1)(f)</div>
           <p className="text-[13px] text-mist leading-relaxed">MRP is declared, but the phrase "Inclusive of all taxes" is missing from the label.</p>
        </div>
      )
    }
  ];

  const reportSteps = [
    {
      label: "Generate Notice",
      content: (
        <div className="w-full flex flex-col items-center justify-center gap-6">
           <div className="text-[14px] text-mist text-center">Review complete.<br/>Generate formal inspection notice?</div>
           <button className="mello-btn-primary pointer-events-none">Generate PDF</button>
        </div>
      )
    },
    {
      label: "Compiling Report",
      durationMs: 1500,
      content: (
        <div className="w-full flex flex-col items-center gap-4">
           <div className="w-12 h-16 bg-charcoal border border-graphite rounded flex items-center justify-center relative overflow-hidden">
             <motion.div 
               initial={{ height: 0 }} 
               animate={{ height: "100%" }} 
               transition={{ duration: 1.2 }}
               className="absolute bottom-0 w-full bg-white/10" 
             />
             <span className="text-[10px] font-mono font-bold">PDF</span>
           </div>
           <span className="text-[12px] text-fog animate-pulse">Assembling evidence...</span>
        </div>
      )
    },
    {
      label: "Report Ready",
      content: (
        <div className="w-full flex flex-col items-center gap-4">
           <div className="w-12 h-16 bg-white rounded flex items-center justify-center text-midnight shadow-[0_0_20px_rgba(255,255,255,0.2)]">
             <span className="text-[12px] font-mono font-bold">PDF</span>
           </div>
           <button className="mello-btn-secondary pointer-events-none">Download Report</button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-midnight text-white selection:bg-white selection:text-midnight">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-6 md:px-12 h-[80px]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-midnight"></div>
          </div>
          <span className="font-medium tracking-tight text-[16px] text-white">satyalabel</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-mist">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#rules-engine" className="hover:text-white transition-colors">The Rules Engine</a>
          <a href="#tech" className="hover:text-white transition-colors">Tech</a>
        </div>
        <div>
          <Link href="/login" className="mello-btn-primary !px-5">Enter App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-32 px-6 md:px-12 max-w-[1200px] mx-auto text-center flex flex-col items-center">
        <h1 className="text-[52px] md:text-[72px] font-medium tracking-[-0.03em] leading-[1.05] mb-6 max-w-[900px]">
          Every declaration, checked against the law — in seconds.
        </h1>
        <p className="text-[18px] md:text-[20px] text-mist mb-12 max-w-[640px] leading-relaxed">
          SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 — instantly, with the exact rule cited.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="mello-btn-primary !px-8 !py-3 !text-[15px]">Enter App &rarr;</Link>
          <a href="#how-it-works" className="mello-btn-secondary !px-8 !py-3 !text-[15px]">See how it works</a>
        </div>
      </section>

      {/* How it Works - Demo Cards */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-obsidian border-y border-graphite">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-[32px] font-medium tracking-tight mb-4">The Pipeline</h2>
            <p className="text-[16px] text-mist max-w-[500px]">From raw pixels to a formal notice of inspection, completely automated via edge OCR and strict deterministic rule checks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DemoCard steps={scanSteps} autoPlay={true} loop={true} />
            <DemoCard steps={validateSteps} autoPlay={true} loop={true} />
            <DemoCard steps={reportSteps} autoPlay={false} loop={false} />
          </div>
        </div>
      </section>

      {/* The Rules Engine */}
      <section id="rules-engine" className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="mb-16 md:w-2/3">
          <h2 className="text-[32px] font-medium tracking-tight mb-4">Rooted in law, not "AI says so".</h2>
          <p className="text-[16px] text-mist leading-relaxed">
            Violations are matched deterministically to the actual Legal Metrology (Packaged Commodities) Rules, 2011. There are no hallucinations in the ruling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-20">
           <div className="flex flex-col gap-2 border-b border-graphite pb-6">
             <span className="font-mono text-[13px] text-white">Rule 6(1)(a)</span>
             <span className="text-[15px] text-mist">Manufacturer / Packer / Importer Name and Address presence.</span>
           </div>
           <div className="flex flex-col gap-2 border-b border-graphite pb-6">
             <span className="font-mono text-[13px] text-white">Rule 6(1)(c)</span>
             <span className="text-[15px] text-mist">Net Quantity must use standard metric legal units.</span>
           </div>
           <div className="flex flex-col gap-2 border-b border-graphite pb-6">
             <span className="font-mono text-[13px] text-white">Rule 6(1)(f)</span>
             <span className="text-[15px] text-mist">MRP must be declared inclusive of all taxes with standard symbol.</span>
           </div>
           <div className="flex flex-col gap-2 border-b border-graphite pb-6">
             <span className="font-mono text-[13px] text-white">Rule 7(3)</span>
             <span className="text-[15px] text-mist">Minimum letter height computed via bounding boxes (≥1mm).</span>
           </div>
        </div>

        <div className="mello-card-flat p-8">
           <h3 className="text-[13px] font-medium uppercase tracking-widest text-fog mb-8">Status Taxonomy</h3>
           <div className="flex flex-wrap gap-4">
             <div className="mello-badge-pass">PASS</div>
             <div className="mello-badge-fail">POTENTIAL NON-COMPLIANCE</div>
             <div className="mello-badge-review">MANUAL REVIEW</div>
             <div className="mello-badge-na">NOT APPLICABLE</div>
             <div className="bg-charcoal border border-graphite text-[#fb923c] px-[10px] py-[4px] rounded-full text-[12px] font-medium">NOT VERIFIED</div>
           </div>
        </div>
      </section>

      {/* Tech & Hackathon Footer */}
      <section id="tech" className="py-24 px-6 md:px-12 bg-obsidian border-t border-graphite">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="mello-card-flat p-8 flex flex-col h-full">
            <h3 className="text-[14px] font-medium text-white mb-6">Stack Overview</h3>
            <ul className="flex flex-col gap-4 text-[14px]">
              <li className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Frontend</span><span className="text-mist font-medium">Next.js App Router, Tailwind</span></li>
              <li className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Backend</span><span className="text-mist font-medium">Express.js API</span></li>
              <li className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Database</span><span className="text-mist font-medium">PostgreSQL (Supabase)</span></li>
              <li className="flex justify-between border-b border-graphite pb-2"><span className="text-fog">Extraction</span><span className="text-mist font-medium">Tesseract + Gemini Vision</span></li>
              <li className="flex justify-between"><span className="text-fog">Deployment</span><span className="text-mist font-medium">Vercel (Edge)</span></li>
            </ul>
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-graphite bg-charcoal w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span>
              <span className="text-[12px] font-medium font-mono text-mist">SIH26034</span>
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">Ministry of Consumer Affairs</h3>
            <p className="text-[15px] text-mist leading-relaxed mb-8">
              Built for the Smart India Hackathon 2026. Manual label inspection cannot scale to millions of SKUs. Edge-cached AI extraction with deterministic rule engines can.
            </p>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center flex flex-col items-center">
        <h2 className="text-[40px] font-medium tracking-tight mb-8">Your label. The law. One scan.</h2>
        <Link href="/login" className="mello-btn-primary !px-8 !py-3 !text-[15px]">Enter App</Link>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-12 border-t border-graphite flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-fog">
        <div className="flex items-center gap-6">
          <span className="text-white font-medium">SatyaLabel</span>
          <a href="#how-it-works" className="hover:text-mist transition-colors">How it works</a>
          <a href="#rules-engine" className="hover:text-mist transition-colors">Rules</a>
          <a href="#tech" className="hover:text-mist transition-colors">Tech</a>
        </div>
        <div>
          Smart India Hackathon 2026 Prototype
        </div>
      </footer>
    </div>
  );
}
