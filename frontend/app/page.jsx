"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import DemoCard from '../components/DemoCard';
import PipelineDiagram from '../components/PipelineDiagram';

// Filmstrip component for Rule validation
function RuleFilmstrip() {
  return (
    <div className="relative h-[120px] w-full overflow-hidden bg-surface rounded-xl border border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface z-10 pointer-events-none" />
      <motion.div 
        className="flex flex-col items-center justify-start absolute top-0 left-0 w-full"
        initial={{ y: 0 }}
        animate={{ y: -480 }} // scroll up
        transition={{ duration: 2.2, ease: [0.1, 0.9, 0.2, 1] }} // slot machine ease out
      >
        {["Rule 6(1)(a)", "Rule 7(2)", "Rule 18(1)", "Rule 6(1)(c)", "Rule 9(3)", "Rule 26", "Rule 6(1)(e)", "Rule 4(1)", "Rule 6(1)(f)"].map((r, i) => (
          <div key={i} className="h-[60px] flex items-center justify-center text-text-secondary font-mono text-[14px]">
            {r}
          </div>
        ))}
      </motion.div>
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60px] border-y border-accent/50 bg-accent/5 z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.2 }}
      />
      {/* Haptic pulse */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent rounded-full z-0 blur-xl "
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 2] }}
        transition={{ delay: 2.2, duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

export default function LandingPage() {
  const scanSteps = [
    {
      label: "Idle",
      durationMs: 1500,
      content: (
        <div className="flex flex-col items-center opacity-50">
          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-3">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <span className="text-[13px] font-medium">Drop label image</span>
        </div>
      )
    },
    {
      label: "Image Uploaded",
      durationMs: 1500,
      content: (
        <div className="w-full h-[180px] bg-surface rounded-xl overflow-hidden relative border border-border">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-80" alt="Product label" />
        </div>
      )
    },
    {
      label: "Processing",
      durationMs: 2500,
      content: (
        <div className="w-full h-[180px] bg-surface rounded-xl overflow-hidden relative border border-border">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-40 grayscale" alt="Scanning" />
          <div className="absolute inset-0 scan-line-container">
            <div className="w-full h-1 bg-accent  absolute top-0 animate-scan"></div>
          </div>
        </div>
      )
    }
  ];

  const validateSteps = [
    {
      label: "OCR Extraction",
      durationMs: 1500,
      content: (
        <div className="flex flex-col gap-2 w-full text-left font-mono text-[11px] text-text-primary">
          <div className="bg-surface p-3 rounded-lg border border-border">{'{\n  "mrp": "Rs. 150.00",\n  "net_weight": "500g",\n  "date": "10/2023"\n}'}</div>
        </div>
      )
    },
    {
      label: "Rule Matching",
      durationMs: 3500,
      content: (
        <RuleFilmstrip />
      )
    },
    {
      label: "Result",
      durationMs: 2000,
      content: (
        <div className="mello-badge-review scale-125">Rule 6(1)(f)</div>
      )
    }
  ];

  const reportSteps = [
    {
      label: "PDF Generated",
      durationMs: 2000,
      content: (
        <div className="flex flex-col items-center">
          <div className="w-16 h-20 bg-surface border border-border rounded shadow-lg flex flex-col p-2 gap-2 relative">
             <div className="w-full h-1 bg-border rounded-full"></div>
             <div className="w-3/4 h-1 bg-border rounded-full"></div>
             <div className="w-full h-1 bg-border rounded-full mt-2"></div>
             <div className="w-1/2 h-1 bg-border rounded-full"></div>
             <div className="absolute -bottom-2 -right-2 mello-badge-fail scale-50">FAIL</div>
          </div>
        </div>
      )
    }
  ];

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 25, staggerChildren: 0.08 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 25 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary font-sans selection:bg-accent/30 relative overflow-hidden">
      
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none bg-background z-0" />

      <nav className="w-full flex items-center justify-between px-6 py-4 md:px-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-[#d97706] flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span className="font-outfit font-medium text-[18px] tracking-tight">SatyaLabel</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-text-muted">
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
          <a href="#rules-engine" className="hover:text-text-primary transition-colors">The Rules Engine</a>
          <a href="#tech" className="hover:text-text-primary transition-colors">Tech</a>
        </div>
        <div>
          <Link href="/login" className="mello-btn-primary !px-5">Enter App</Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section 
        className="pt-24 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto text-center flex flex-col items-center relative z-10"
        initial="hidden" animate="visible" variants={sectionVariants}
      >
        <motion.h1 variants={childVariants} className="text-[52px] md:text-[72px] font-medium tracking-[-0.03em] leading-[1.05] mb-6 max-w-[900px]">
          Every declaration, checked against the law - in seconds.
        </motion.h1>
        <motion.p variants={childVariants} className="text-[18px] md:text-[20px] text-text-secondary mb-12 max-w-[640px] leading-relaxed">
          SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 - instantly, with the exact rule cited.
        </motion.p>
        <motion.div variants={childVariants} className="flex items-center gap-4">
          <Link href="/login" className="mello-btn-primary !px-8 !py-3 !text-[15px]">Enter App &rarr;</Link>
          <a href="#how-it-works" className="mello-btn-secondary !px-8 !py-3 !text-[15px]">See how it works</a>
        </motion.div>
      </motion.section>

      {/* Pipeline Diagram Section */}
      <motion.section 
        className="px-6 md:px-12 w-full max-w-[1200px] mx-auto relative z-10 pb-16"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
      >
        <PipelineDiagram />
      </motion.section>

      {/* How it Works - Demo Cards */}
      <motion.section 
        id="how-it-works" 
        className="py-24 px-6 md:px-12 bg-background border-y border-border relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
      >
        <div className="max-w-[1200px] mx-auto">
          <motion.div variants={childVariants} className="mb-16">
            <h2 className="text-[32px] font-medium tracking-tight mb-4">The Pipeline</h2>
            <p className="text-[16px] text-text-secondary max-w-[500px]">From raw pixels to a formal notice of inspection, completely automated via edge OCR and strict deterministic rule checks.</p>
          </motion.div>
          
          <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DemoCard steps={scanSteps} autoPlay={true} loop={true} showCursor={true} />
            <DemoCard steps={validateSteps} autoPlay={true} loop={true} />
            <DemoCard steps={reportSteps} autoPlay={false} loop={false} />
          </motion.div>
        </div>
      </motion.section>

      {/* Before / After Comparison */}
      <motion.section 
        className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
      >
        <motion.div variants={childVariants} className="mb-12 text-center">
          <h2 className="text-[32px] font-medium tracking-tight mb-4">The Transformation</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 bg-surface rounded-[24px] border border-border overflow-hidden shadow-md">
          {/* Left: Manual */}
          <motion.div 
            className="p-10 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center items-center text-center opacity-100"
            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 0.7, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } }}
          >
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="text-[20px] font-medium text-text-primary mb-2">Manual Inspection</h3>
            <p className="text-[15px] text-text-muted">15-30 minutes per product. Error-prone. Hard to enforce uniformly at scale.</p>
          </motion.div>

          {/* Right: Automated */}
          <motion.div 
            className="p-10 flex flex-col justify-center items-center text-center bg-background relative overflow-hidden"
            variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.1 } } }}
          >
            <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-6 relative z-10 ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #fb923c)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h3 className="text-[20px] font-medium text-text-primary mb-2 relative z-10">SatyaLabel</h3>
            <p className="text-[15px] text-text-secondary relative z-10">2-4 seconds per product. Perfectly consistent. Scales to millions of SKUs.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* The Rules Engine */}
      <motion.section 
        id="rules-engine" 
        className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
      >
        <motion.div variants={childVariants} className="mb-16 md:w-2/3">
          <h2 className="text-[32px] font-medium tracking-tight mb-4">Rooted in law, not &quot;AI says so&quot;.</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">
            Violations are matched deterministically to the actual Legal Metrology (Packaged Commodities) Rules, 2011. There are no hallucinations in the ruling.
          </p>
        </motion.div>

        {/* Interactive Stamp Cards */}
        <motion.div variants={childVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
          {[
            { badge: "PASS", class: "mello-badge-pass", desc: "Fully compliant with rule." },
            { badge: "POTENTIAL NON-COMPLIANCE", class: "mello-badge-fail", desc: "Clear violation detected." },
            { badge: "MANUAL REVIEW", class: "mello-badge-review", desc: "Ambiguous phrasing found." },
            { badge: "NOT APPLICABLE", class: "mello-badge-na", desc: "Exempt commodity type." },
            { badge: "NOT VERIFIED", class: "bg-surface border border-border text-[#fb923c] px-[10px] py-[4px] rounded-full text-[12px] font-medium inline-block", desc: "Text missing or unreadable." },
          ].map((status, i) => (
            <motion.div 
              key={i} 
              className="mello-card-flat p-5 flex flex-col justify-start"
              variants={childVariants}
              whileHover={{ scale: 1.02 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, delay: i * 0.4, ease: "easeInOut" }}
            >
              <div className="mb-4">
                 <div className={status.class + " inline-block"}>{status.badge}</div>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed">{status.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Rule Citation Example */}
        <motion.div variants={childVariants} className="mello-card-flat p-8 relative overflow-hidden bg-background">
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 bg-surface p-4 rounded-xl border border-border font-mono text-[13px] text-text-primary shadow-inner w-full">
              <div className="text-text-muted mb-2">// Raw Extracted Text</div>
              <div className="text-text-secondary bg-background p-3 rounded border border-border mb-2 overflow-x-auto">
                &quot;MRP Rs. 150.00&quot;
              </div>
              <div className="text-text-muted mb-2">// Parsed Data</div>
              <div className="text-text-secondary bg-background p-3 rounded border border-border overflow-x-auto">
                {"{ mrp_value: 150, taxes_included: false }"}
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>

            <div className="flex-1 w-full">
              <h3 className="text-[14px] font-medium uppercase tracking-widest text-text-muted mb-4">Deterministic Logic</h3>
              <div className="mello-card-flat bg-surface/50 p-5 border-l-2 border-l-accent">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between items-start gap-2 mb-2">
                  <span className="font-mono text-[13px] text-text-primary">Rule 6(1)(f)</span>
                  <div className="mello-badge-fail whitespace-nowrap">POTENTIAL NON-COMPLIANCE</div>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed mt-3">
                  MRP must be declared inclusive of all taxes. Missing &quot;(incl. of all taxes)&quot; phrase.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Tech & Hackathon Footer */}
      <motion.section 
        id="tech" 
        className="py-24 px-6 md:px-12 bg-background border-t border-border relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <motion.div variants={childVariants} className="mello-card-flat p-8 flex flex-col h-full">
            <h3 className="text-[14px] font-medium text-text-primary mb-6">Stack Overview</h3>
            <ul className="flex flex-col gap-4 text-[14px]">
              <li className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Frontend</span><span className="text-text-secondary font-medium">Next.js App Router, Tailwind</span></li>
              <li className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Backend</span><span className="text-text-secondary font-medium">Express.js API</span></li>
              <li className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Database</span><span className="text-text-secondary font-medium">PostgreSQL (Supabase)</span></li>
              <li className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Extraction</span><span className="text-text-secondary font-medium">Tesseract + Gemini Vision</span></li>
              <li className="flex justify-between"><span className="text-text-muted">Deployment</span><span className="text-text-secondary font-medium">Vercel (Edge)</span></li>
            </ul>
          </motion.div>

          <motion.div variants={childVariants} className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span>
              <span className="text-[12px] font-medium font-mono text-text-secondary">SIH26034</span>
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">Ministry of Consumer Affairs</h3>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
              Built for the Smart India Hackathon 2026. Manual label inspection cannot scale to millions of SKUs. Edge-cached AI extraction with deterministic rule engines can.
            </p>
          </motion.div>

        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section 
        className="py-32 px-6 text-center flex flex-col items-center relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
      >
        <motion.h2 variants={childVariants} className="text-[40px] font-medium tracking-tight mb-8">Your label. The law. One scan.</motion.h2>
        <motion.div variants={childVariants}>
          <Link href="/login" className="mello-btn-primary !px-8 !py-3 !text-[15px]">Enter App</Link>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-text-muted relative z-10 bg-background">
        <div className="flex items-center gap-6">
          <span className="text-text-primary font-medium">SatyaLabel</span>
          <a href="#how-it-works" className="hover:text-text-secondary transition-colors">How it works</a>
          <a href="#rules-engine" className="hover:text-text-secondary transition-colors">Rules</a>
          <a href="#tech" className="hover:text-text-secondary transition-colors">Tech</a>
        </div>
        <div>
          Smart India Hackathon 2026 Prototype
        </div>
      </footer>
    </div>
  );
}
