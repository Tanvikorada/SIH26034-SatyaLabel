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
  Sun, Moon, Zap, Clock, FileSearch, Scale, Layers, Image as ImageIcon
} from 'lucide-react';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, 
  SiPostgresql, SiFramer, SiVercel, SiRender, 
  SiGoogle, SiGithub 
} from 'react-icons/si';

// ─── Reduce-motion helper ─────────────────────────────────────────────────
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

// ─── Theme Toggle ─────────────────────────────────────────────────────────
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

// ─── Grain Canvas ─────────────────────────────────────────────────────────
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

// ─── Cursor Spotlight ─────────────────────────────────────────────────────
function Spotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY, reduced]);

  if (reduced) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 60%)`
          )
        }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(300px circle at ${x}px ${y}px, color-mix(in srgb, var(--color-accent) 4%, transparent), transparent 70%)`
          )
        }}
      />
    </>
  );
}

// ─── Kinetic Text ─────────────────────────────────────────────────────────
function KineticText({ text, className }) {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  if (reduced) return <h1 className={className}>{text}</h1>;
  return (
    <motion.h1
      className={className}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.055 } } }}
      initial="hidden" animate="visible"
    >
      {words.map((word, i) => (
        <motion.span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }}
          variants={{
            hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
            visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { type: 'spring', stiffness: 250, damping: 24 } }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// ─── PHASE 1: Original Geometric Seal ─────────────────────────────────────
function HeroSeal() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sX = useSpring(x, { stiffness: 100, damping: 30 });
  const sY = useSpring(y, { stiffness: 100, damping: 30 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const move = (e) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Parallax: move OPPOSITE to cursor
      x.set((cx - e.clientX) * 0.04);
      y.set((cy - e.clientY) * 0.04);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y, reduced]);

  const SIZE = 400;
  const CX = SIZE/2;
  const CY = SIZE/2;

  // Pre-calculate 36 ticks
  const ticks = Array.from({length: 36}).map((_, i) => {
    const angle = (i * 10) * (Math.PI / 180);
    const r1 = 140;
    const r2 = i % 3 === 0 ? 152 : 146;
    return {
      x1: CX + r1 * Math.cos(angle), y1: CY + r1 * Math.sin(angle),
      x2: CX + r2 * Math.cos(angle), y2: CY + r2 * Math.sin(angle),
      weight: i % 3 === 0 ? 2 : 1
    };
  });

  return (
    <motion.div ref={ref} style={{ x: sX, y: sY }} className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-4 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }} />
      
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative z-10 overflow-visible">
        {/* Outermost ring */}
        <circle cx={CX} cy={CY} r={180} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        
        {/* Rotating Text Ring */}
        <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: 'linear' }} style={{ transformOrigin: 'center' }}>
          <defs>
            <path id="textPath" d={`M ${CX},${CY} m -164,0 a 164,164 0 1,1 328,0 a 164,164 0 1,1 -328,0`} />
          </defs>
          <text fill="var(--color-primary)" fontSize="13" fontFamily="var(--font-mono)" letterSpacing="5" style={{ textTransform: 'uppercase', opacity: 0.8 }}>
            <textPath href="#textPath" startOffset="0%">SatyaLabel · Verified Compliance · 2026 · SatyaLabel · Verified Compliance · 2026 · </textPath>
          </text>
        </motion.g>

        {/* Static inner tick ring */}
        <circle cx={CX} cy={CY} r={140} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--color-accent)" strokeWidth={t.weight} strokeLinecap="round" opacity={0.8} />
        ))}

        {/* Center breathing icon */}
        <motion.g animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} style={{ transformOrigin: 'center' }}>
          <circle cx={CX} cy={CY} r={90} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <foreignObject x={CX-32} y={CY-32} width="64" height="64">
            <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]">
              <Scale size={48} strokeWidth={1.5} />
            </div>
          </foreignObject>
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ─── PHASE 2: Pixels to Penalty (Filmstrip) ───────────────────────────────
function PixelsToPenalty() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <section className="py-24 px-6 md:px-12 relative z-10 bg-[var(--color-surface)] border-y border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-medium tracking-tight mb-12 text-center">From Pixels to Penalty</h2>
        
        <div ref={ref} className="relative w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 overflow-hidden shadow-sm">
          {/* Filmstrip sprocket holes (top/bottom borders) */}
          <div className="absolute top-0 left-0 right-0 h-4 flex gap-4 px-4 overflow-hidden opacity-20">
            {Array.from({length: 40}).map((_,i) => <div key={i} className="w-4 h-2 bg-[var(--color-border)] rounded-sm mt-1 shrink-0" />)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 flex gap-4 px-4 overflow-hidden opacity-20">
            {Array.from({length: 40}).map((_,i) => <div key={i} className="w-4 h-2 bg-[var(--color-border)] rounded-sm mb-1 mt-auto shrink-0" />)}
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center justify-between py-6">
            
            {/* Frame 1: Pixels */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 }} className="flex-1 flex flex-col gap-4 items-center">
              <div className="w-full aspect-[4/3] rounded-lg border border-[var(--color-border)] bg-white relative overflow-hidden flex items-center justify-center p-4">
                <div className="text-center font-mono text-sm leading-relaxed opacity-40">
                  <span className="font-bold">MRP: 50.00</span><br/>
                  Net Wt: 100g<br/>
                  Packed: 01/24
                </div>
                {/* Bounding box animation */}
                <motion.div className="absolute border-2 border-dashed border-[var(--color-accent)] rounded" 
                  initial={{ top: '35%', left: '30%', right: '30%', bottom: '50%', opacity: 0 }}
                  animate={isInView ? { opacity: [0, 1, 1], scale: [1.1, 1, 1] } : {}}
                  transition={{ delay: 0.6, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                />
                {/* Scanline */}
                <motion.div className="absolute left-0 right-0 h-0.5 bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] z-10"
                  initial={{ top: 0 }} animate={isInView ? { top: '100%' } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">1. Pixels</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }} className="hidden md:block text-[var(--color-border)]">→</motion.div>

            {/* Frame 2: Parsed */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 }} className="flex-1 flex flex-col gap-4 items-center w-full">
              <div className="w-full aspect-[4/3] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center p-4">
                <div className="w-full flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between p-2 bg-[var(--color-background)] rounded border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">field:</span>
                    <span className="text-[var(--color-primary)] font-medium">"MRP"</span>
                  </div>
                  <motion.div className="flex justify-between p-2 bg-[var(--color-accent-soft)] rounded border border-[var(--color-accent)]"
                    initial={{ scale: 0.95 }} animate={isInView ? { scale: [0.95, 1.05, 1] } : {}} transition={{ delay: 1.2, duration: 0.4 }}
                  >
                    <span className="text-[var(--color-text-muted)]">value:</span>
                    <span className="text-[var(--color-accent)] font-bold">"50.00"</span>
                  </motion.div>
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">2. Parsed</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }} className="hidden md:block text-[var(--color-border)]">→</motion.div>

            {/* Frame 3: Checked */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.9 }} className="flex-1 flex flex-col gap-4 items-center w-full">
              <div className="w-full aspect-[4/3] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center p-4 relative">
                <div className="flex items-center gap-2 lg:gap-3 flex-wrap justify-center">
                  <div className="font-mono text-xs p-2 rounded bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    "50.00"
                  </div>
                  <div className="text-[var(--color-text-muted)] italic text-[10px]">vs</div>
                  <div className="font-mono text-xs p-2 rounded bg-[var(--color-primary)] text-[var(--color-surface)] border border-[var(--color-primary)]">
                    Rule 6(1)(f)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">3. Checked</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }} className="hidden md:block text-[var(--color-border)]">→</motion.div>

            {/* Frame 4: Penalty */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.3 }} className="flex-1 flex flex-col gap-4 items-center w-full">
              <div className="w-full aspect-[4/3] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                <motion.div 
                  initial={{ scale: 3, opacity: 0 }} 
                  animate={isInView ? { scale: 1, opacity: 1 } : {}} 
                  transition={{ delay: 1.8, type: 'spring', damping: 12, stiffness: 200 }}
                  className="z-10"
                >
                  <div className="mello-badge-fail font-bold text-[9px] sm:text-[10px] md:text-xs rotate-[-6deg] shadow-sm text-center">
                    POTENTIAL<br/>NON-COMPLIANCE
                  </div>
                </motion.div>
                <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'var(--color-noncompliant)' }}
                  initial={{ opacity: 0 }} animate={isInView ? { opacity: [0, 0.15, 0] } : {}} transition={{ delay: 1.8, duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">4. Penalty</span>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PHASE 3: Pipeline Diagram (Interactive Cards) ────────────────────────
function InteractivePipelineCard({ title, icon: Icon, children }) {
  return (
    <div className="mello-card p-6 flex flex-col gap-4 h-full relative">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
          <Icon size={16} />
        </div>
        <h3 className="font-medium text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function UploadMicroApp() {
  const [state, setState] = useState('empty'); // empty -> uploaded
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-background)] flex items-center justify-center p-4 overflow-hidden relative transition-all duration-300">
        {state === 'empty' ? (
          <div className="flex flex-col items-center gap-2 opacity-50">
            <ImageIcon size={24} />
            <span className="text-xs">No image selected</span>
          </div>
        ) : (
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
            src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" 
            className="absolute inset-0 w-full h-full object-cover" alt="Uploaded" 
          />
        )}
      </div>
      <button 
        onClick={() => setState(s => s === 'empty' ? 'uploaded' : 'empty')}
        className="mello-btn-secondary w-full active:scale-[0.98]"
      >
        {state === 'empty' ? 'Choose Photo' : 'Reset'}
      </button>
    </div>
  );
}

function OCRMicroApp() {
  const [state, setState] = useState('idle'); // idle -> scanning -> done
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-3 relative overflow-hidden font-mono text-[10px] text-[var(--color-text-secondary)] leading-relaxed flex flex-col justify-end transition-all">
        {state === 'idle' && <div className="opacity-50 m-auto text-center text-xs">Ready to extract</div>}
        {state === 'scanning' && (
          <>
            <motion.div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-accent)] z-10 shadow-[0_0_8px_var(--color-accent)]"
              animate={{ top: ['0%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="opacity-30 blur-[1px]">Processing pixel data...<br/>Extracting text regions...</div>
          </>
        )}
        {state === 'done' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
            <div><span className="text-[var(--color-text-muted)]">mrp:</span> "Rs. 50"</div>
            <div><span className="text-[var(--color-text-muted)]">net_wt:</span> "100g"</div>
            <div><span className="text-[var(--color-text-muted)]">date:</span> "01/24"</div>
          </motion.div>
        )}
      </div>
      <button 
        onClick={() => {
          if (state === 'idle') {
            setState('scanning');
            setTimeout(() => setState('done'), 1500);
          } else {
            setState('idle');
          }
        }}
        disabled={state === 'scanning'}
        className="mello-btn-primary w-full active:scale-[0.98] disabled:opacity-50"
      >
        {state === 'idle' ? 'Run Extraction' : state === 'scanning' ? 'Extracting...' : 'Reset'}
      </button>
    </div>
  );
}

function RuleMicroApp() {
  const rules = [
    { id: 'Rule 6(1)(f)', stat: 'POTENTIAL NON-COMPLIANCE', cls: 'mello-badge-fail' },
    { id: 'Rule 6(1)(a)', stat: 'PASS', cls: 'mello-badge-pass' },
    { id: 'Rule 31', stat: 'NOT APPLICABLE', cls: 'mello-badge-na' }
  ];
  const [idx, setIdx] = useState(0);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] p-4 flex flex-col items-center justify-center gap-3 overflow-hidden">
        <div className="font-mono text-xs px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
          {rules[idx].id}
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className={`text-[9px] font-bold text-center ${rules[idx].cls}`}
          >
            {rules[idx].stat}
          </motion.div>
        </AnimatePresence>
      </div>
      <button 
        onClick={() => setIdx(i => (i + 1) % rules.length)}
        className="mello-btn-secondary w-full active:scale-[0.98]"
      >
        Next Rule →
      </button>
    </div>
  );
}

function PipelineSection() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto relative z-10">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Interactive Pipeline</h2>
        <p className="text-[var(--color-text-secondary)]">Experience each automated stage. Click the buttons below.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        <InteractivePipelineCard title="1. Upload" icon={Upload}><UploadMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="2. OCR Engine" icon={ScanLine}><OCRMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="3. Rule Engine" icon={Scale}><RuleMicroApp /></InteractivePipelineCard>
      </div>
    </section>
  );
}

// ─── PHASE 4: The Case File (Transformation) ──────────────────────────────
function TheCaseFile() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const timerRef = useRef(null);

  useEffect(() => {
    // Start ticking immediately, stop only when resolved
    if (!isResolved) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isResolved]);

  const handleProcess = () => {
    if (isResolved) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsResolved(true);
    }, 1500); // SatyaLabel takes 1.5s
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Case File</h2>
        <p className="text-[var(--color-text-secondary)]">The difference in time is the difference in scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm relative">
        
        {/* Left: Manual (Aged paper styling) */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--color-border)] relative overflow-hidden"
             style={{ backgroundColor: '#FAF9F6' }}>
          {/* subtle paper grain SVG overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-serif text-xl text-[#3A332A] mb-8 font-medium">Manual Inspection</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
              <div className={`text-5xl font-mono tabular-nums ${!isResolved ? 'text-[#8C3A3A]' : 'text-[#8C7A6B]'}`}>
                {formatTime(timer)}
              </div>
              
              <div className="relative h-16 w-full flex justify-center items-center">
                <motion.div className={`px-4 py-2 border-[3px] border-[#8C3A3A] text-[#8C3A3A] font-bold tracking-widest uppercase text-xl transform -rotate-12 ${isResolved ? 'opacity-30' : 'opacity-80'}`}
                     style={{ borderRadius: 4, filter: 'url(#stamp-texture)' }}>
                  PENDING
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital (Crisp) */}
        <div className="p-8 md:p-12 bg-[var(--color-surface)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-medium text-xl text-[var(--color-text-primary)] mb-8">SatyaLabel</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
              {!isResolved && !isProcessing ? (
                <button onClick={handleProcess} className="mello-btn-primary active:scale-[0.98] !text-lg !px-8 !py-3">
                  Process Case
                </button>
              ) : isProcessing ? (
                <div className="text-[var(--color-accent)] animate-pulse font-mono text-sm">Processing label...</div>
              ) : (
                <>
                  <div className="text-5xl font-mono tabular-nums text-[var(--color-pass)]">0:01</div>
                  <div className="relative h-16 w-full flex justify-center items-center">
                    <motion.div 
                      initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="px-4 py-2 border-[3px] border-[var(--color-pass)] text-[var(--color-pass)] text-xl font-bold tracking-widest uppercase rounded bg-[var(--color-pass-bg)]"
                    >
                      VERIFIED
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
      
      <p className="text-center mt-6 text-sm text-[var(--color-text-muted)] max-w-[600px] mx-auto">
        You just spent more time reading this section than SatyaLabel spent verifying a label.
      </p>

      {/* SVG filter for manual stamp */}
      <svg width="0" height="0" className="absolute">
        <filter id="stamp-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </section>
  );
}

// ─── PHASE 5: Ruling Ledger (Rules Engine) ────────────────────────────────
const LEDGER_DATA = [
  { id: 'pass', label: 'PASS', icon: CheckCircle2, rule: 'Rule 6(1)(c)', field: 'Net Quantity', val: '500g', exp: 'Declared correctly in standard unit.' },
  { id: 'fail', label: 'POTENTIAL NON-COMPLIANCE', icon: AlertTriangle, rule: 'Rule 6(1)(f)', field: 'MRP', val: 'Rs.150', exp: 'MRP must state "inclusive of all taxes". Phrase absent.' },
  { id: 'review', label: 'MANUAL REVIEW', icon: HelpCircle, rule: 'Rule 6(1)(d)', field: 'Mfg Date', val: '10/23', exp: 'Ambiguous format. Could be MM/YY or DD/MM.' },
  { id: 'na', label: 'NOT APPLICABLE', icon: MinusCircle, rule: 'Rule 31', field: 'Category', val: 'Exempt', exp: 'Fast food packages are exempt from certain rules.' },
  { id: 'nv', label: 'NOT VERIFIED', icon: EyeOff, rule: 'Rule 14A', field: 'FSSAI No.', val: 'null', exp: 'Field unreadable due to glare or damage.' },
];

function RulingLedger() {
  const [activeId, setActiveId] = useState('fail');
  const activeData = LEDGER_DATA.find(d => d.id === activeId);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Ruling Ledger</h2>
        <p className="text-[var(--color-text-secondary)]">Rooted in the Legal Metrology Rules, 2011. Not generic AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--color-border)]">
        {LEDGER_DATA.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveId(tab.id)}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors relative ${activeId === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
          >
            <div className="flex items-center gap-2">
              <tab.icon size={14} />
              {tab.label}
            </div>
            {activeId === tab.id && (
              <motion.div layoutId="ledgerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>

      {/* Ruling Slip */}
      <div className="min-h-[250px] relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeId}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-8 shadow-sm"
            style={{ borderRadius: 2 }} // Sharp official corners
          >
            <div className="flex justify-between items-start mb-10">
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)]">
                LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011<br/>
                CITATION EXTRACT
              </div>
              <div className={`mello-badge-${activeId} transform rotate-3 origin-top-right shadow-sm text-[10px] md:text-xs`}>
                {activeData.label}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 border-l-2 border-[var(--color-border)] pl-4">
                <div className="text-xs text-[var(--color-text-muted)] mb-1 uppercase font-mono tracking-wider">{activeData.field}</div>
                <div className="font-mono text-sm bg-[var(--color-background)] p-2 border border-[var(--color-border)] rounded w-fit">
                  {activeData.val}
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[var(--color-primary)] font-mono font-medium">
                  <Scale size={16} /> {activeData.rule}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {activeData.exp}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-4 border-t border-dashed border-[var(--color-border)] flex gap-6 text-[10px] font-mono text-[var(--color-text-muted)] flex-wrap">
              <span>EVIDENCE ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              <span>OCR_CONF: {activeId === 'nv' ? '0.00' : '0.94'}</span>
              <span>BOUNDING_BOX: [x,y,w,h]</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── PHASE 6: Tech Stack Diagram ──────────────────────────────────────────
function TechStack() {
  const nodes = [
    { cat: 'Frontend', name: 'Next.js', icon: SiNextdotjs },
    { cat: 'Frontend', name: 'React', icon: SiReact },
    { cat: 'Frontend', name: 'Tailwind', icon: SiTailwindcss },
    { cat: 'Frontend', name: 'Framer', icon: SiFramer },
    { cat: 'AI Core', name: 'Tesseract', icon: FileSearch }, // fallback lucide
    { cat: 'AI Core', name: 'Gemini', icon: SiGoogle },
    { cat: 'Backend', name: 'Express.js', icon: Layers }, // fallback
    { cat: 'Backend', name: 'PostgreSQL', icon: SiPostgresql },
    { cat: 'Infra', name: 'Vercel', icon: SiVercel },
    { cat: 'Infra', name: 'Render', icon: SiRender },
    { cat: 'Infra', name: 'GitHub', icon: SiGithub },
  ];

  const grouped = nodes.reduce((acc, n) => {
    (acc[n.cat] = acc[n.cat] || []).push(n);
    return acc;
  }, {});

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">System Architecture</h2>
        <p className="text-[var(--color-text-secondary)]">Built entirely on free-tier infrastructure — ₹0 to run.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center md:items-stretch overflow-x-auto pb-8">
        {Object.entries(grouped).map(([cat, items], idx) => (
          <div key={cat} className="flex flex-col items-center gap-4 relative">
            <div className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">{cat}</div>
            <div className="flex flex-row md:flex-col gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 rounded-xl shadow-sm relative z-10">
              {items.map(n => (
                <div key={n.name} className="group relative w-12 h-12 flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-background)] rounded-lg hover:border-[var(--color-accent)] transition-colors cursor-help">
                  <n.icon size={22} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" />
                  <div className="absolute bottom-full mb-2 bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {n.name}
                  </div>
                </div>
              ))}
            </div>
            {/* Visual connector (desktop) */}
            {idx < Object.keys(grouped).length - 1 && (
              <div className="hidden md:block absolute top-1/2 left-full w-16 h-px bg-[var(--color-border)] -translate-y-1/2 z-0">
                <motion.div className="h-full bg-[var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>

      <GrainCanvas />
      <Spotlight />

      {/* ── NAV ── */}
      <nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0"
        style={{ background: 'color-mix(in srgb, var(--color-background) 90%, transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-border)' }}>
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

      {/* ── HERO ── */}
      <section className="pt-16 pb-8 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-h-[58vh]">
          <div className="flex flex-col items-start relative z-10">
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-mono mb-8"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)', animation: 'typewriter-blink 2s ease-in-out infinite' }} />
              SIH 2026 · Problem ID SIH26034
            </motion.div>

            {/* Subtle scrim behind text for legibility if seal overlaps on small screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)] via-[var(--color-background)] to-transparent -z-10 md:hidden blur-md opacity-80" />

            <KineticText
              text="Every declaration, checked against the law — in seconds."
              className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6"
            />

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-[17px] mb-10 max-w-[520px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}>
              SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 — deterministically.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex items-center gap-4 flex-wrap">
              <Link href="/login" className="mello-btn-primary !px-7 !py-3 !text-[15px]">Enter App</Link>
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

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 text-center flex flex-col items-center relative z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
          Your label. The law. One scan.
        </h2>
        <p className="text-[16px] mb-12 max-w-[380px] text-[var(--color-text-secondary)]">
          No manual cross-referencing. No ambiguity. A deterministic answer with the rule cited.
        </p>
        <Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2">
          Enter App <span className="text-[var(--color-accent)]">→</span>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full py-7 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] relative z-10"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-6">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</span>
        </div>
        <div>Smart India Hackathon 2026 · Ministry of Consumer Affairs</div>
      </footer>
    </div>
  );
}
