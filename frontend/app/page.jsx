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
  FileCheck, Cpu, Code
} from 'lucide-react';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, 
  SiPostgresql, SiFramer, SiVercel, SiRender, 
  SiGoogle, SiGithub, SiPython,  as Dummy
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
  const SIZE = 400;
  const CX = SIZE/2;
  const CY = SIZE/2;

  // Fixed at a place, slowly rotating
  return (
    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
      <div className="absolute inset-4 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }} />
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative z-10 overflow-visible">
        <circle cx={CX} cy={CY} r={180} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: 'linear' }} style={{ transformOrigin: 'center' }}>
          <defs>
            <path id="textPath" d={`M ${CX},${CY - 165} A 165,165 0 1,1 ${CX - 0.1},${CY - 165}`} />
          </defs>
          <text fontSize="11" fill="var(--color-text-secondary)" letterSpacing="2.5" style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>
            <textPath href="#textPath" startOffset="0%">
              MINISTRY OF CONSUMER AFFAIRS • LEGAL METROLOGY DIVISION • SIH26034 •
            </textPath>
          </text>
        </motion.g>
        <circle cx={CX} cy={CY} r={146} fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
        <motion.path 
           d={`M ${CX} 0 L ${CX} 40 M ${CX} 360 L ${CX} 400 M 0 ${CY} L 40 ${CY} M 360 ${CY} L 400 ${CY}`}
           stroke="var(--color-border)" strokeWidth="1"
           initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <foreignObject x={CX - 80} y={CY - 80} width="160" height="160">
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-[0_0_40px_rgba(11,31,58,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)]" />
            <Shield size={42} color="var(--color-primary)" className="mb-2" />
            <div className="text-[12px] font-mono tracking-widest font-bold" style={{ color: 'var(--color-text-primary)' }}>APPROVED</div>
          </div>
        </foreignObject>
      </svg>
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
    <section className="py-24 px-6 md:px-12 relative z-10 bg-[var(--color-surface)] border-y border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-medium tracking-tight mb-16 text-center">From Pixels to Penalty</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-y border-[var(--color-border)] relative">
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2 -mt-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-[var(--color-background)] rounded-sm border border-[var(--color-border)]" />)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2 -mb-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-[var(--color-background)] rounded-sm border border-[var(--color-border)]" />)}
          </div>

          {/* Frame 1: Pixels */}
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">01_PIXELS</div>
            <div className="w-24 h-32 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm relative overflow-hidden flex flex-col p-2 gap-2">
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
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">02_EXTRACT</div>
            <div className="w-full max-w-[140px] font-mono text-[9px] text-[var(--color-primary)] bg-[var(--color-surface)] p-3 border border-[var(--color-border)] rounded-lg shadow-inner">
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
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
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
          <div className="p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)] overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">04_PENALTY</div>
            
            <motion.div key={`f4-${loop}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 0], scale: 1.5 }} transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] pointer-events-none opacity-20" />

            {/* Premium Penalty Card */}
            <motion.div key={`f4c-${loop}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.3 }}
              className="flex flex-col relative z-10 bg-[var(--color-surface)] p-4 rounded-xl border border-red-500/20 shadow-lg w-full max-w-[200px] overflow-hidden">
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
    <div className="mello-card p-6 flex flex-col gap-4 h-full relative overflow-hidden group border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
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
      <div className="flex-1 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-background)] flex items-center justify-center p-4 overflow-hidden relative transition-all duration-300 group-hover:border-[var(--color-primary)]">
        <AnimatePresence mode="wait">
          {state === 'empty' ? (
            <motion.div key="e" exit={{opacity: 0, scale: 0.9}} className="flex flex-col items-center gap-2 opacity-50">
              <Upload size={24} className="mb-1" />
              <span className="text-xs font-medium">Drop label image here</span>
            </motion.div>
          ) : (
            <motion.div key="u" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-inner flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300&h=300" className="opacity-80 object-cover w-full h-full mix-blend-luminosity" alt="Label" />
              <div className="absolute inset-0 border-2 border-[var(--color-primary)] opacity-50 rounded" />
              <CheckCircle2 size={32} className="absolute text-[var(--color-pass)] bg-[var(--color-surface)] rounded-full p-1 shadow-lg" />
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
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-3 relative overflow-hidden flex flex-col justify-end transition-all">
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
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] p-4 flex items-center justify-center relative overflow-hidden">
         <AnimatePresence mode="wait">
           <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
             className="w-full h-full flex flex-col justify-between border border-[var(--color-border)] rounded bg-[var(--color-surface)] p-3">
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

      <div className="h-[420px] w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg flex flex-col bg-[var(--color-surface)]">
        {/* Header Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <button onClick={() => setMode('manual')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'manual' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            Manual Inspection
          </button>
          <button onClick={() => setMode('ai')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'ai' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
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
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 items-center justify-center bg-[var(--color-background)]">
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

      <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-surface)] shadow-lg max-w-[800px] mx-auto relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-col p-6 gap-3">
          <AnimatePresence>
            {items.map((row, i) => (
              <motion.div key={row.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1 - (i * 0.25), y: 0, scale: 1 - (i * 0.05) }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                className="flex items-center justify-between p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl"
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
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
      <div className="mb-20 text-center relative z-20">
        <h2 className="text-3xl font-medium tracking-tight mb-3">System Architecture</h2>
        <p className="text-[var(--color-text-secondary)]">Modern stack. Deterministic engine. Highly scalable.</p>
      </div>

      <div className="relative w-full max-w-[800px] mx-auto h-[400px] flex items-center justify-center">
         {/* Background orbital rings */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-[300px] h-[300px] rounded-full border border-[var(--color-border)] opacity-50" />
           <div className="w-[500px] h-[500px] rounded-full border border-[var(--color-border)] opacity-30 absolute" />
         </div>

         {/* Center Core Node */}
         <div className="relative z-20 w-24 h-24 bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-full shadow-[0_0_30px_rgba(11,31,58,0.2)] flex flex-col items-center justify-center group cursor-pointer hover:scale-110 transition-transform duration-300">
           <div className="absolute inset-0 bg-[var(--color-accent)] opacity-10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
           <Shield size={28} className="text-[var(--color-accent)] mb-1" />
           <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-primary)]">CORE</span>
         </div>

         {/* Orbiting Tech Nodes */}
         <div className="absolute inset-0 flex items-center justify-center z-10">
            {/* Frontend */}
            <div className="absolute -top-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors"><SiNextdotjs size={24} className="text-[var(--color-text-primary)]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">Next.js 15</span>
            </div>
            
            {/* UI/Design */}
            <div className="absolute top-16 right-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors"><SiTailwindcss size={24} className="text-[#06B6D4]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">Tailwind</span>
            </div>

            {/* OCR/AI */}
            <div className="absolute bottom-12 right-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors">< as Dummy size={24} className="text-[#10a37f]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">Vision AI</span>
            </div>

            {/* Backend */}
            <div className="absolute -bottom-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors"><SiPostgresql size={24} className="text-[#336791]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">PostgreSQL</span>
            </div>

            {/* Hosting */}
            <div className="absolute bottom-12 left-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors"><SiRender size={24} className="text-[var(--color-text-primary)]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">Render & Vercel</span>
            </div>

            {/* CV/Backend Logic */}
            <div className="absolute top-16 left-12 flex flex-col items-center gap-2 group cursor-help">
              <div className="w-14 h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg group-hover:border-[var(--color-primary)] transition-colors"><Cpu size={24} className="text-[var(--color-text-primary)]" /></div>
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">Node.js Engine</span>
            </div>
         </div>
      </div>
    </section>
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
          <Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Enter App</Link>
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
              <Link href="/login" className="mello-btn-primary !px-7 !py-3 !text-[15px] shadow-lg">Enter App</Link>
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
      <section className="py-32 px-6 text-center flex flex-col items-center relative z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
          Your label. The law. One scan.
        </h2>
        <p className="text-[16px] mb-12 max-w-[380px] text-[var(--color-text-secondary)]">
          No manual cross-referencing. No ambiguity. A deterministic answer with the rule cited.
        </p>
        <Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-lg">
          Enter App
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
