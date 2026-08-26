"use client";
import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  motion, useMotionValue, useTransform, useScroll,
  useSpring, useInView, AnimatePresence
} from 'framer-motion';
import {
  Shield, ScanLine, Upload,
  CheckCircle2, AlertTriangle, HelpCircle, MinusCircle, EyeOff,
  Sun, Moon, Zap, Clock, FileSearch, Scale, Layers, Image as ImageIcon,
  ChevronDown, FileText, Monitor, Server, Database, Eye, Check, X,
  FileCheck, Cpu, Code, Scan
} from 'lucide-react';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, 
  SiPostgresql, SiFramer, SiVercel, SiRender, 
  SiGoogle, SiGithub, SiPython, 
} from 'react-icons/si';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-200"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
      }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

function GrainCanvas() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let frame = 0;
    const alpha = resolvedTheme === 'dark' ? 10 : 16;
    const draw = () => {
      frame++;
      if (frame % 2 !== 0) { rafId = requestAnimationFrame(draw); return; }
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v; data[i+1] = v; data[i+2] = v; data[i+3] = alpha;
      }
      ctx.putImageData(imageData, 0, 0);
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [reduced, resolvedTheme]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ mixBlendMode: 'overlay' }}
    />
  );
}

function KineticText({ text, className }) {
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
      
      {/* Official Government Aesthetic Container */}
      <div className="relative z-10 w-[240px] h-[240px] rounded-full bg-surface border-4 border-double border-[#b8860b] dark:border-[#d4af37] shadow-[0_10px_40px_-10px_rgba(184,134,11,0.3)] flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Inner concentric ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#b8860b]/30 dark:border-[#d4af37]/30" />
        
        {/* Subtle radial backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#b8860b]/5 dark:to-[#d4af37]/10" />

        {/* Central Government Iconography (Balance Scale of Metrology) */}
        <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] relative z-20 mt-2">
          
          {/* Base & Pillar */}
          <path d="M 46 90 L 54 90 L 52 40 L 48 40 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 35 95 L 65 95 L 60 90 L 40 90 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          
          {/* The Balance Beam */}
          <rect x="20" y="38" width="60" height="4" rx="2" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          
          {/* Left Pan (Product/AI) */}
          <line x1="25" y1="42" x2="15" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <line x1="25" y1="42" x2="35" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 10 65 Q 25 75 40 65 Z" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <circle cx="25" cy="62" r="5" fill="#10b981" /> {/* Glowing AI node */}
          
          {/* Right Pan (Law/Book) */}
          <line x1="75" y1="42" x2="65" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <line x1="75" y1="42" x2="85" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 60 65 Q 75 75 90 65 Z" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <rect x="70" y="58" width="10" height="6" fill="currentColor" className="text-text-primary" /> {/* Book block */}

          {/* Center Fulcrum */}
          <circle cx="50" cy="40" r="5" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <circle cx="50" cy="40" r="2" fill="var(--color-surface)" />
        </svg>

        {/* Circular Text (SVG path for perfect text wrapping) */}
        <div className="absolute inset-0 z-30 pointer-events-none animate-[spin_40s_linear_infinite]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path id="textPath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
            <text className="text-[14px] font-medium tracking-[0.15em] uppercase fill-text-primary">
              <textPath href="#textPath" startOffset="0%">
                • LEGAL METROLOGY COMPLIANCE • DEPARTMENT OF CONSUMER AFFAIRS
              </textPath>
            </text>
          </svg>
        </div>

      </div>
    </div>
  );
}

function PixelsToPenalty() {
  const [loop, setLoop] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setLoop(l => l + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 px-6 md:px-12 relative z-10 bg-transparent border-y border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-20 text-center bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">From Pixels to Penalty</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-y border-[var(--color-border)] relative">
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2 -mt-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-transparent rounded-sm border border-[var(--color-border)]" />)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2 -mb-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-transparent rounded-sm border border-[var(--color-border)]" />)}
          </div>

          {/* Frame 1: Pixels */}
          <div className="border-b md:border-b-0 md:border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-transparent">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">01_PIXELS</div>
            <div className="w-24 h-32 bg-transparent border border-[var(--color-border)] shadow-sm relative overflow-hidden flex flex-col p-2 gap-2">
               <div className="w-full h-3 bg-[var(--color-border)] rounded-sm" />
               <div className="w-3/4 h-2 bg-[var(--color-border)] rounded-sm opacity-50" />
               <div className="w-1/2 h-2 bg-[var(--color-border)] rounded-sm opacity-50" />
               <div className="w-full h-8 bg-[var(--color-border)] rounded-sm mt-auto" />
               <svg key={`f1-${loop}`} className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <motion.rect x="5%" y="5%" width="90%" height="15%" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.2 }} />
                  <motion.rect x="5%" y="28%" width="70%" height="8%" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.2 }} />
               </svg>
            </div>
            <div className="mt-4 font-mono text-[10px] text-[var(--color-text-secondary)] text-center">Vision OCR identifies<br/>declarations on pack</div>
          </div>
          
          {/* Frame 2: Extraction */}
          <div className="border-b md:border-b-0 md:border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-transparent">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">02_EXTRACT</div>
            <div className="w-full max-w-[140px] font-mono text-[9px] text-[var(--color-primary)] bg-transparent p-3 border border-[var(--color-border)] rounded-lg shadow-inner">
               <motion.div key={`f2-${loop}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.1 }}>
                 {"{"}<br/>
                 &nbsp;&nbsp;"mrp": "Rs. 250",<br/>
                 &nbsp;&nbsp;"net_qty": "100g",<br/>
                 &nbsp;&nbsp;"mfg_date": "08/2025"<br/>
                 {"}"}
               </motion.div>
            </div>
            <div className="mt-4 font-mono text-[10px] text-[var(--color-text-secondary)] text-center">Unstructured text to<br/>structured JSON</div>
          </div>

          {/* Frame 3: Verification */}
          <div className="border-b md:border-b-0 md:border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-transparent">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">03_VERIFY</div>
            <div className="relative">
              <Scale size={32} className="text-[var(--color-text-secondary)]" />
              <motion.div key={`f3-${loop}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, type: "spring" }}
                 className="absolute -top-2 -right-3 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                 <AlertTriangle size={10} strokeWidth={3} />
              </motion.div>
            </div>
            <div className="mt-4 font-mono text-[10px] text-[var(--color-text-secondary)] text-center">Rule Engine compares<br/>against LMPC 2011</div>
          </div>
          
          {/* Frame 4: Penalty */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-transparent overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">04_PENALTY</div>
            
            <motion.div key={`f4-${loop}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 0], scale: 1.5 }} transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] pointer-events-none opacity-20" />

            {/* Premium Penalty Card */}
            <motion.div key={`f4c-${loop}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.3 }}
              className="flex flex-col relative z-10 bg-transparent p-4 rounded-xl border border-red-500/20 shadow-lg w-full max-w-[200px] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <div className="flex items-center justify-between mb-3 mt-1">
                 <AlertTriangle size={14} className="text-red-500" />
                 <span className="text-[9px] font-mono text-red-500/90 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">ACTION REQ</span>
              </div>
              <div className="text-[13px] font-medium tracking-tight mb-1 text-[var(--color-text-primary)]">Non-Compliance</div>
              <div className="text-[11px] text-[var(--color-text-secondary)] font-mono leading-tight">Rule 6(1)(f)</div>
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[10px] text-red-400/80 leading-snug">
                 Missing inclusive tax stmt
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InteractivePipelineCard({ title, icon: Icon, children }) {
  return (
    <div className="mello-card p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors bg-[var(--color-surface)] rounded-xl">
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-transparent border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
          <Icon size={16} />
        </div>
        <h3 className="font-medium text-[var(--color-text-primary)] tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
    </div>
  );
}

function UploadMicroApp() {
  const [state, setState] = useState('empty'); 
  useEffect(() => {
    const timer = setInterval(() => setState(s => s === 'empty' ? 'uploaded' : 'empty'), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full cursor-pointer" onClick={() => setState(s => s === 'empty' ? 'uploaded' : 'empty')}>
      <div className="flex-1 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-transparent flex items-center justify-center p-4 overflow-hidden relative transition-all duration-300 group-hover:border-[var(--color-primary)]">
        <AnimatePresence mode="wait">
          {state === 'empty' ? (
            <motion.div key="e" exit={{opacity: 0, scale: 0.9}} className="flex flex-col items-center gap-2 opacity-50">
              <Upload size={24} className="mb-1" />
              <span className="text-xs font-medium">Drop label image here</span>
            </motion.div>
          ) : (
            <motion.div key="u" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-2 rounded bg-transparent border border-[var(--color-border)] overflow-hidden shadow-inner flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300&h=300" className="opacity-80 object-cover w-full h-full mix-blend-luminosity" alt="Label" />
              <div className="absolute inset-0 border-2 border-[var(--color-primary)] opacity-50 rounded" />
              <CheckCircle2 size={32} className="absolute text-[var(--color-pass)] bg-transparent rounded-full p-1 shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OCRMicroApp() {
  const [state, setState] = useState('idle');
  useEffect(() => {
    let t1, t2;
    const cycle = () => {
      setState('scanning');
      t1 = setTimeout(() => {
        setState('done');
        t2 = setTimeout(cycle, 2500);
      }, 1500);
    };
    cycle();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full cursor-pointer" onClick={() => setState('scanning')}>
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-transparent p-3 relative overflow-hidden flex flex-col justify-end transition-all">
        {state === 'idle' && <div className="opacity-50 m-auto text-center text-xs font-mono">Awaiting Image...</div>}
        {state === 'scanning' && (
          <div className="absolute inset-0 flex flex-col">
            <motion.div className="w-full h-1 bg-[var(--color-accent)] z-10 shadow-[0_0_10px_var(--color-accent)]" animate={{ y: [0, 160] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            <div className="m-auto font-mono text-[10px] text-[var(--color-text-secondary)]">Analyzing pixel density...<br/>Extracting bounding boxes...</div>
          </div>
        )}
        {state === 'done' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col bg-[#0d1117] text-[#c9d1d9] rounded p-3 font-mono text-[10px] border border-[#30363d] overflow-hidden">
             <div className="text-[#79c0ff]">"extracted_data": {"{"}</div>
             <div className="pl-4"><span className="text-[#a5d6ff]">"mrp"</span>: <span className="text-[#a5d6ff]">"Rs 50"</span>,</div>
             <div className="pl-4"><span className="text-[#a5d6ff]">"qty"</span>: <span className="text-[#a5d6ff]">"100g"</span></div>
             <div className="text-[#79c0ff]">{"}"}</div>
             <div className="mt-auto text-[8px] text-[#8b949e]">✔ Confidence: 98.4%</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function RuleMicroApp() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % 3), 2000);
    return () => clearInterval(timer);
  }, []);
  
  const rules = [
    { rule: "Rule 6(1)(a)", text: "Generic Name", stat: "PASS", color: "var(--color-pass)", bg: "rgba(34,197,94,0.1)" },
    { rule: "Rule 18(1)", text: "MRP Format", stat: "FAIL", color: "var(--color-fail)", bg: "rgba(239,68,68,0.1)" },
    { rule: "Rule 8", text: "PDP Placement", stat: "REVIEW", color: "var(--color-warning)", bg: "rgba(245,158,11,0.1)" }
  ];

  return (
    <div className="flex flex-col gap-4 h-full cursor-pointer" onClick={() => setActive(a => (a+1)%3)}>
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-transparent p-4 flex items-center justify-center relative overflow-hidden">
         <AnimatePresence mode="wait">
           <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
             className="w-full h-full flex flex-col justify-between border border-[var(--color-border)] rounded bg-transparent p-3">
             <div className="flex justify-between items-start">
               <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{rules[active].rule}</div>
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rules[active].color, boxShadow: `0 0 8px ${rules[active].color}` }} />
             </div>
             <div className="text-[13px] font-medium tracking-tight mt-2 mb-3">{rules[active].text}</div>
             <div className="mt-auto flex justify-end">
               <div className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ color: rules[active].color, backgroundColor: rules[active].bg }}>
                 {rules[active].stat}
               </div>
             </div>
           </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}

function PipelineSection() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto relative z-10">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Live Automated Pipeline</h2>
        <p className="text-[var(--color-text-secondary)]">Experience the architecture continuously at work in real-time.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        <InteractivePipelineCard title="1. Capture" icon={Upload}><UploadMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="2. Extract" icon={ScanLine}><OCRMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="3. Adjudicate" icon={Scale}><RuleMicroApp /></InteractivePipelineCard>
      </div>
    </section>
  );
}

function TheCaseFile() {
  const [mode, setMode] = useState('ai'); 
  
  useEffect(() => {
    const timer = setInterval(() => setMode(m => m === 'ai' ? 'manual' : 'ai'), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Paradigm Shift</h2>
        <p className="text-[var(--color-text-secondary)]">The difference in time is the difference in scale.</p>
      </div>

      <div className="h-[420px] w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg flex flex-col bg-transparent">
        {/* Header Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-transparent">
          <button onClick={() => setMode('manual')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'manual' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-transparent' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            Manual Inspection
          </button>
          <button onClick={() => setMode('ai')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'ai' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-transparent' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            SatyaLabel AI
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {mode === 'manual' ? (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><FileSearch size={20} /> <span>Visual checking (5-10 mins)</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><Layers size={20} /> <span>Cross-referencing 30+ rules</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><FileText size={20} /> <span>Manual notice drafting</span></div>
                </div>
                <div className="w-[1px] h-32 bg-[var(--color-border)] hidden md:block" />
                <div className="flex-1 text-center">
                  <div className="text-5xl font-mono text-[var(--color-text-muted)] mb-2">15m</div>
                  <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-text-secondary)]">Average per Label</div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 items-center justify-center bg-transparent">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><ScanLine size={20} className="text-[var(--color-accent)]" /> <span>Instant deterministic OCR</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><Cpu size={20} className="text-[var(--color-accent)]" /> <span>Automated Rule Engine</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><FileCheck size={20} className="text-[var(--color-accent)]" /> <span>One-click PDF Notice</span></div>
                </div>
                <div className="w-[1px] h-32 bg-[var(--color-border)] hidden md:block" />
                <div className="flex-1 text-center">
                  <div className="text-5xl font-mono text-[var(--color-accent)] mb-2 drop-shadow-[0_0_8px_var(--color-accent)]">4.2s</div>
                  <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-text-secondary)]">Average per Label</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RulingLedger() {
  const [items, setItems] = useState([
    { id: 1, rule: 'Rule 6(1)(a)', text: 'Name of Commodity', status: 'PASS' },
    { id: 2, rule: 'Rule 6(1)(c)', text: 'Net Quantity', status: 'PASS' },
    { id: 3, rule: 'Rule 6(1)(e)', text: 'MRP Details', status: 'FAIL' },
    { id: 4, rule: 'Rule 9(3)', text: 'Legibility & Font', status: 'PASS' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        const last = next.pop();
        return [last, ...next];
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Live Compliance Ledger</h2>
        <p className="text-[var(--color-text-secondary)]">Rooted directly in the Legal Metrology Rules, 2011.</p>
      </div>

      <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-transparent shadow-lg max-w-[800px] mx-auto relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-col p-6 gap-3">
          <AnimatePresence>
            {items.map((row, i) => (
              <motion.div key={row.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1 - (i * 0.25), y: 0, scale: 1 - (i * 0.05) }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                className="flex items-center justify-between p-4 bg-transparent border border-[var(--color-border)] rounded-xl"
                style={{ zIndex: items.length - i }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'PASS' ? 'bg-[var(--color-pass)] shadow-[0_0_8px_var(--color-pass)]' : 'bg-[var(--color-fail)] shadow-[0_0_8px_var(--color-fail)]'}`} />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{row.rule}</span>
                    <span className="font-medium text-[14px] text-[var(--color-text-primary)]">{row.text}</span>
                  </div>
                </div>
                <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.status === 'PASS' ? 'text-[var(--color-pass)] bg-[#22c55e1a]' : 'text-[var(--color-fail)] bg-[#ef44441a]'}`}>
                  {row.status}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent overflow-hidden">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Analysis Pipeline</h2>
        <p className="text-[var(--color-text-secondary)]">How raw pixels become deterministic legal rulings.</p>
      </div>

      <div className="relative w-full max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
         {/* Animated connector line behind on desktop */}
         <div className="hidden md:block absolute top-1/2 left-[5%] right-[5%] h-[1px] bg-[var(--color-border)] -translate-y-1/2 z-0 overflow-hidden">
             <motion.div className="h-full bg-[var(--color-text-primary)] opacity-40 w-1/3" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
         </div>

         {/* Nodes */}
         <TechNode icon={<Scan size={24}/>} title="1. Capture" subtitle="Mobile Web/Edge" delay={0} />
         <TechNode icon={<Cpu size={24}/>} title="2. Engine" subtitle="Node.js (Render)" delay={0.2} />
         <TechNode icon={<Zap size={24}/>} title="3. Vision AI" subtitle="Gemini 1.5 Pro" delay={0.4} />
         <TechNode icon={<FileText size={24}/>} title="4. Rules" subtitle="Deterministic Logic" delay={0.6} />
         <TechNode icon={<Database size={24}/>} title="5. Ledger" subtitle="Supabase (PG)" delay={0.8} />
      </div>
    </section>
  );
}

function TechNode({ icon, title, subtitle, delay }) {
  return (
     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay }} viewport={{ once: true }}
       className="relative z-10 flex flex-col items-center gap-4 p-6 bg-transparent border border-[var(--color-border)] rounded-2xl w-full md:w-[170px] shadow-sm hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:-translate-y-1 transition-all group backdrop-blur-sm">
         <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:scale-110 transition-transform shadow-md">
           {icon}
         </div>
         <div className="text-center">
            <div className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1">{title}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{subtitle}</div>
         </div>
     </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>

      <GrainCanvas />

      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0"
        style={{ background: 'color-mix(in srgb, var(--color-background) 90%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
            <Shield size={14} color="var(--color-surface)" />
          </div>
          <span className="font-medium text-[17px] tracking-tight" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Go to Dashboard</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-16 pb-8 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-h-[58vh]">
          <div className="flex flex-col items-start relative z-10">
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-mono mb-8"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)', animation: 'typewriter-blink 2s ease-in-out infinite' }} />
              SIH 2026 Problem ID SIH26034
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)] via-[var(--color-background)] to-transparent -z-10 md:hidden blur-md opacity-80" />

            <KineticText
              text="Every declaration, checked against the law in seconds."
              className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6"
            />

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-[17px] mb-10 max-w-[520px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}>
              SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 deterministically.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex items-center gap-4 flex-wrap">
              <Link href="/login" className="mello-btn-primary !px-7 !py-3 !text-[15px] shadow-lg">Start Scanning</Link>
            </motion.div>
          </div>

          <motion.div className="flex items-center justify-center relative z-0"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 130, damping: 22 }}>
            <HeroSeal />
          </motion.div>
        </div>
      </section>

      <PixelsToPenalty />
      <PipelineSection />
      <TheCaseFile />
      <RulingLedger />
      <TechStack />

      {/* FINAL CTA */}
      <section className="py-32 px-6 text-center flex flex-col items-center relative z-10 border-t border-[var(--color-border)] bg-transparent">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
          Your label. The law. One scan.
        </h2>
        <p className="text-[16px] mb-12 max-w-[380px] text-[var(--color-text-secondary)]">
          No manual cross-referencing. No ambiguity. A deterministic answer with the rule cited.
        </p>
        <Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-lg">
          Launch App
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-7 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] relative z-10"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-6">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</span>
        </div>
        <div>Smart India Hackathon 2026 Ministry of Consumer Affairs</div>
      </footer>
    </div>
  );
}
