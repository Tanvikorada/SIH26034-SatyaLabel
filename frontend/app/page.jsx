'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

function StaggeredText({ text, className }) {
  return (
    <h1 className={className} style={{ color: 'var(--color-text-primary)' }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i} className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 15, rotateX: 45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center group cursor-default mx-auto">
      {/* Glow Behind */}
      <div className="absolute inset-0 bg-saffron/20 blur-[60px] rounded-full mix-blend-screen opacity-50 dark:opacity-20 animate-pulse" />

      {/* Official Government Aesthetic Container */}
      <div className="relative z-10 w-[240px] h-[240px] rounded-full bg-surface border-4 border-double border-[#b8860b] dark:border-[#d4af37] shadow-[0_10px_40px_-10px_rgba(184,134,11,0.3)] flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
        <div className="absolute inset-2 rounded-full border border-dashed border-[#b8860b]/30 dark:border-[#d4af37]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#b8860b]/5 dark:to-[#d4af37]/10" />

        <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] relative z-20 mt-2">
          {/* Base & Pillar */}
          <path d="M 46 90 L 54 90 L 52 40 L 48 40 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 35 95 L 65 95 L 60 90 L 40 90 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          
          {/* The Balance Beam */}
          <path d="M 20 40 L 80 40 L 78 35 L 22 35 Z" fill="currentColor" className="text-[#d4af37]" />
          <circle cx="50" cy="37" r="4" fill="currentColor" className="text-[#d4af37]" />
          
          {/* Left Pan */}
          <path d="M 20 40 L 10 65 L 30 65 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d4af37]" />
          <path d="M 10 65 C 10 75, 30 75, 30 65 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          
          {/* Right Pan */}
          <path d="M 80 40 L 70 65 L 90 65 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d4af37]" />
          <path d="M 70 65 C 70 75, 90 75, 90 65 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
        </svg>

        <div className="relative z-20 mt-4 text-center">
          <p className="text-[10px] font-bold tracking-widest text-[#1e3a8a] dark:text-[#60a5fa] uppercase opacity-90">Dept of</p>
          <p className="text-[12px] font-black tracking-wider text-[#b8860b] dark:text-[#d4af37] uppercase">Consumer Affairs</p>
        </div>
      </div>
      
      {/* Rotating Circular Text SVG */}
      <svg className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none opacity-40 dark:opacity-20" viewBox="0 0 200 200">
        <path id="circlePath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
        <text className="text-[12px] font-mono tracking-[0.3em] uppercase fill-current" style={{ color: 'var(--color-text-primary)' }}>
          <textPath href="#circlePath" startOffset="0%">
            LEGAL METROLOGY ACT 2011 · GOVERNMENT OF INDIA · 
          </textPath>
        </text>
      </svg>
    </div>
  );
}

const steps = [
  {
    title: '1. Capture & Smart Grid',
    desc: 'The Progressive Web App (PWA) captures multiple angles of the product. Our Smart Grid stitches images into a high-res 2x2 layout preserving maximum optical clarity.',
    icon: '📸',
    tech: 'Next.js + HTML5 Canvas'
  },
  {
    title: '2. Dual-Layer AI Extraction',
    desc: 'Tesseract OCR runs a deterministic spatial scan to lock onto font metrics, while Groq Qwen-VL (Vision LLM) extracts unstructured layout data into strict JSON.',
    icon: '🧠',
    tech: 'Tesseract + Groq (Qwen 3.8B)'
  },
  {
    title: '3. Legal Metrology Rules Engine',
    desc: 'Extracted JSON bypasses LLM hallucinations entirely and hits a hardcoded, deterministic rules engine checking all 38 rules of the 2011 Packaged Commodities Act.',
    icon: '⚖️',
    tech: 'Node.js Regex Engine'
  },
  {
    title: '4. Immutable Ledger & Enforcement',
    desc: 'Violations generate legally binding PDF notices instantly. Hashes of the evidence are committed to the PostgreSQL ledger, ensuring chain-of-custody.',
    icon: '📜',
    tech: 'PostgreSQL + PDF-lib'
  }
];

function PixelsToPenalty() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto relative z-10">
      <div className="mb-20 text-center">
        <h2 className="text-3xl font-semibold mb-3">Pixels to Penalty</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">The exact lifecycle of a scan. No black boxes. Pure transparency.</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 md:left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-saffron/50 via-saffron/20 to-transparent" />
        
        <div className="space-y-16">
          {steps.map((step, i) => (
            <div key={i} className={`relative flex flex-col md:flex-row gap-8 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="absolute left-6 md:left-[50%] w-3 h-3 bg-saffron rounded-full transform -translate-x-[5px] md:-translate-x-[5.5px] shadow-[0_0_15px_#ff9933]" />
              
              <div className="w-full md:w-1/2 flex justify-start md:justify-end md:px-12 pl-12">
                <div className="bg-surface border border-[var(--color-border)] p-8 rounded-2xl shadow-xl w-full max-w-md hover:border-saffron/40 transition-colors">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">{step.desc}</p>
                  <span className="text-xs font-mono text-saffron/80 bg-saffron/10 px-2 py-1 rounded border border-saffron/20">{step.tech}</span>
                </div>
              </div>
              <div className="hidden md:block w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const techNodes = [
  { name: 'Next.js 14', role: 'Edge Rendering', type: 'frontend', col: 'col-span-1' },
  { name: 'TailwindCSS', role: 'Utility Styling', type: 'frontend', col: 'col-span-1' },
  { name: 'PWA Service Workers', role: 'Offline Queuing', type: 'frontend', col: 'col-span-2' },
  { name: 'Node.js Express', role: 'API Routing', type: 'backend', col: 'col-span-2' },
  { name: 'Multer', role: 'Multi-part Image Stream', type: 'backend', col: 'col-span-1' },
  { name: 'PostgreSQL', role: 'Immutable Ledger', type: 'data', col: 'col-span-1' },
  { name: 'Sequelize ORM', role: 'Database Schemas', type: 'data', col: 'col-span-2' },
  { name: 'Groq Cloud', role: 'LPU Inference (<1s)', type: 'ai', col: 'col-span-2' },
  { name: 'Qwen 3.8B Vision', role: 'Multimodal Spatial JSON Extraction', type: 'ai', col: 'col-span-2' },
  { name: 'Tesseract.js', role: 'Deterministic Font Measurement', type: 'ai', col: 'col-span-1' },
  { name: 'PDF-lib', role: 'Notice Generation', type: 'backend', col: 'col-span-1' },
  { name: 'Regex Metrology Engine', role: 'Rule 2011 Act Enforcer', type: 'logic', col: 'col-span-2' }
];

function TechStack() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto border-t border-[var(--color-border)] relative z-10">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-semibold mb-3">Enterprise Architecture</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">A highly parallelized, hybrid deterministic-AI stack built for zero-latency field audits.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {techNodes.map((tech, i) => (
          <div key={i} className={`bg-surface border border-[var(--color-border)] p-5 rounded-xl hover:bg-saffron/5 hover:border-saffron/30 transition-all cursor-crosshair group flex flex-col justify-between min-h-[120px] ${tech.col}`}>
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm">{tech.name}</h4>
              <div className={`w-2 h-2 rounded-full ${tech.type === 'frontend' ? 'bg-blue-400' : tech.type === 'backend' ? 'bg-green-400' : tech.type === 'ai' ? 'bg-purple-400' : 'bg-saffron'}`} />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors mt-4 font-mono">
              {tech.role}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[var(--color-text-secondary)] font-mono">
        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /> Edge / Client</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /> Backend / Core</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full" /> AI Inference</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-saffron rounded-full" /> Logic / Ledger</span>
      </div>
    </section>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="flex flex-col items-center p-6 w-full">
      <span className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-saffron">{number}</span>
      <span className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] text-center">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* Decorative Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <NavBar />

      <main className="relative pt-32 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 z-10 mb-20">
          <div className="flex-1 max-w-xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-saffron bg-saffron/10 px-3 py-1 rounded-full border border-saffron/20">
                SIH26034 · Problem Statement 1718
              </span>
            </motion.div>
            
            <StaggeredText 
              text="Automating Legal Metrology with AI." 
              className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            />
            
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-[17px] mb-10 max-w-[520px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}>
              SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 deterministically. No manual cross-referencing. No ambiguity.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex items-center gap-4 flex-wrap">
              <Link href="/upload" className="mello-btn-primary !px-8 !py-4 !text-[16px] shadow-[0_4px_20px_rgba(255,153,51,0.2)]">Launch Field Scanner</Link>
              <Link href="/history" className="px-8 py-4 rounded-lg font-medium border border-[var(--color-border)] hover:bg-surface transition-colors">View Ledger</Link>
            </motion.div>
          </div>

          <motion.div className="flex-1 flex items-center justify-center relative z-0"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 130, damping: 22 }}>
            <HeroSeal />
          </motion.div>
        </section>

        {/* STATS */}
        <section className="py-12 border-y border-[var(--color-border)] bg-surface/50 backdrop-blur-sm relative z-10 mb-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-around divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
            <StatCard number="38" label="Mandatory Rules" />
            <StatCard number="<4s" label="Audit Latency" />
            <StatCard number="100%" label="Offline Queuing" />
          </div>
        </section>

        <PixelsToPenalty />
        
        <TechStack />

        {/* FINAL CTA */}
        <section className="py-32 px-6 text-center flex flex-col items-center relative z-10 bg-transparent mt-20">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Your label. The law. One scan.
          </h2>
          <p className="text-[16px] mb-12 max-w-[380px] text-[var(--color-text-secondary)]">
            Equip Legal Metrology officers with the ultimate inspection tool. No specialized hardware required.
          </p>
          <Link href="/upload" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-[0_4px_30px_rgba(255,153,51,0.3)] hover:scale-105 transition-transform">
            Start Live Demo
          </Link>
        </section>
      </main>
      
      <footer className="border-t border-[var(--color-border)] py-8 px-6 text-center text-[var(--color-text-secondary)] text-sm z-10 relative bg-background">
        <p className="mb-1">Developed for Smart India Hackathon 2024</p>
        <p>Ministry of Consumer Affairs, Food and Public Distribution</p>
      </footer>
    </div>
  );
}
