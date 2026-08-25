"use client";
import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion';
import DemoCard from '../components/DemoCard';
import PipelineDiagram from '../components/PipelineDiagram';

// ─── Grain Canvas ──────────────────────────────────────────────────────────
function GrainCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let frame = 0;
    const draw = () => {
      frame++;
      if (frame % 2 !== 0) { rafId = requestAnimationFrame(draw); return; } // 30fps
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v; data[i+1] = v; data[i+2] = v; data[i+3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" style={{ mixBlendMode: 'overlay' }} />;
}

// ─── Cursor Spotlight ──────────────────────────────────────────────────────
function Spotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY, prefersReduced]);

  if (prefersReduced) return null;
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[2]"
      style={{
        background: useTransform(
          [mouseX, mouseY],
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(180,128,42,0.06), transparent 70%)`
        )
      }}
    />
  );
}

// ─── Kinetic Text Reveal ───────────────────────────────────────────────────
function KineticText({ text, className }) {
  const words = text.split(' ');
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };
  const wordVariant = {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { type: 'spring', stiffness: 250, damping: 24 } }
  };
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return <h1 className={className}>{text}</h1>;
  return (
    <motion.h1 className={className} variants={container} initial="hidden" animate="visible">
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariant} style={{ display: 'inline-block', marginRight: '0.28em' }}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// ─── 3D Seal ──────────────────────────────────────────────────────────────
function SealOrb() {
  const containerRef = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springRotX = useSpring(rotX, { stiffness: 150, damping: 20 });
  const springRotY = useSpring(rotY, { stiffness: 150, damping: 20 });
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;
    const el = containerRef.current;
    if (!el) return;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rotX.set(((e.clientY - cy) / rect.height) * -8);
      rotY.set(((e.clientX - cx) / rect.width) * 8);
    };
    const reset = () => { rotX.set(0); rotY.set(0); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', reset);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseleave', reset); };
  }, [rotX, rotY, prefersReduced]);

  return (
    <div ref={containerRef} className="relative w-[260px] h-[260px] flex items-center justify-center" style={{ perspective: '600px' }}>
      <motion.div
        style={{ rotateX: springRotX, rotateY: springRotY, transformStyle: 'preserve-3d' }}
        className="w-full h-full flex items-center justify-center"
      >
        {/* Outer ring */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(0px)' }}>
          <motion.circle cx="100" cy="100" r="88" fill="none" stroke="#B4802A" strokeWidth="1.5" strokeDasharray="6 6"
            animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#B4802A" strokeWidth="0.5" opacity="0.4" />
          {/* Shield */}
          <path d="M100 28 L138 46 L138 92 C138 116 122 132 100 142 C78 132 62 116 62 92 L62 46 Z"
            fill="rgba(11,31,58,0.06)" stroke="#0B1F3A" strokeWidth="1.5" />
          <path d="M93 85 L98 91 L109 78" fill="none" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Text around ring */}
          <text fontSize="8" fill="#B4802A" opacity="0.7" fontFamily="monospace">
            <textPath href="#circlePath">LEGAL METROLOGY · PACKAGED COMMODITIES · 2011 · INDIA ·</textPath>
          </text>
          <defs>
            <path id="circlePath" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0" />
          </defs>
          {/* Tick marks around ring */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            const r1 = 82, r2 = 86;
            return (
              <line key={i}
                x1={100 + r1 * Math.cos(angle)} y1={100 + r1 * Math.sin(angle)}
                x2={100 + r2 * Math.cos(angle)} y2={100 + r2 * Math.sin(angle)}
                stroke="#B4802A" strokeWidth="1" opacity="0.5"
              />
            );
          })}
        </svg>
        {/* Depth layer — slightly behind */}
        <div className="absolute w-[90px] h-[90px] rounded-full border-2 border-primary/10 bg-gradient-to-br from-accent/10 to-transparent" style={{ transform: 'translateZ(-20px)' }} />
        {/* Front face */}
        <div className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-accent/20 via-transparent to-primary/10 border border-accent/30 flex items-center justify-center shadow-inner" style={{ transform: 'translateZ(20px)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
      {/* Ambient glow */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/8 blur-3xl pointer-events-none" />
    </div>
  );
}

// ─── Tilt Card Wrapper ─────────────────────────────────────────────────────
function TiltCard({ children, active }) {
  const cardRef = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const springRotX = useSpring(rotX, { stiffness: 200, damping: 22 });
  const springRotY = useSpring(rotY, { stiffness: 200, damping: 22 });
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback((e) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotX.set((py - 0.5) * -8);
    rotY.set((px - 0.5) * 8);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }, [rotX, rotY, glareX, glareY, prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    rotX.set(0); rotY.set(0); glareX.set(50); glareY.set(50);
  }, [rotX, rotY, glareX, glareY]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springRotX, rotateY: springRotY, transformStyle: 'preserve-3d', perspective: '800px' }}
      className={`relative rounded-2xl ${active ? 'ring-1 ring-accent/60' : ''}`}
    >
      {/* Animated border when active */}
      {active && (
        <div className="absolute -inset-[1px] rounded-2xl z-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite]"
            style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #B4802A 60deg, transparent 120deg)' }}
          />
          <div className="absolute inset-[1px] rounded-2xl bg-background" />
        </div>
      )}
      {/* Glare layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.08), transparent 60%)`
          )
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─── Count-Up Stat ─────────────────────────────────────────────────────────
function CountUp({ target, suffix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setCount(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, prefersReduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ─── Magnetic Button ───────────────────────────────────────────────────────
function MagneticButton({ children, href }) {
  const btnRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMove = useCallback((e) => {
    if (prefersReduced) return;
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }, [x, y, prefersReduced]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={btnRef} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ x: springX, y: springY }} className="inline-block">
      <Link href={href} className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 group">
        {children}
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>→</motion.span>
      </Link>
    </motion.div>
  );
}

// ─── Scroll-Scrubbed Wiper ────────────────────────────────────────────────
function ScrollWiper() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 bg-surface rounded-2xl border border-border overflow-hidden shadow-md relative">
      {/* Manual side — always visible */}
      <div className="p-10 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h3 className="text-[20px] font-medium text-text-primary mb-2">Manual Inspection</h3>
        <p className="text-[15px] text-text-muted">15-30 minutes per product. Error-prone. Hard to enforce at scale.</p>
      </div>

      {/* SatyaLabel side — scroll-scrubbed reveal */}
      <div className="relative overflow-hidden">
        <div className="p-10 flex flex-col justify-center items-center text-center bg-background relative overflow-hidden opacity-30 pointer-events-none select-none">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B4802A" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[20px] font-medium text-text-primary mb-2">SatyaLabel</h3>
          <p className="text-[15px] text-text-secondary">2-4 seconds. Perfectly consistent. Scales to millions of SKUs.</p>
        </div>
        <motion.div
          className="absolute inset-0 bg-background p-10 flex flex-col justify-center items-center text-center overflow-hidden"
          style={{ clipPath }}
        >
          <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-6 relative z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B4802A" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[20px] font-medium text-text-primary mb-2 relative z-10">SatyaLabel</h3>
          <p className="text-[15px] text-text-secondary relative z-10">2-4 seconds per product. Perfectly consistent. Scales to millions of SKUs.</p>
          {/* Sliding accent line */}
          <div className="absolute left-0 top-0 w-1 h-full bg-accent/40" />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Bento Grid Stamps ────────────────────────────────────────────────────
const STATUS_ITEMS = [
  { badge: 'PASS', cls: 'mello-badge-pass', desc: 'Fully compliant. All mandatory declarations present and valid per LM(PC) Rules 2011.', span: 'col-span-2 row-span-2', large: true },
  { badge: 'POTENTIAL NON-COMPLIANCE', cls: 'mello-badge-fail', desc: 'Clear violation detected with high confidence. Cite-ready for formal notice.', span: 'col-span-1 row-span-1', large: false },
  { badge: 'MANUAL REVIEW', cls: 'mello-badge-review', desc: 'Ambiguous phrasing or partially legible text. Flag for human officer decision.', span: 'col-span-2 row-span-1', large: false },
  { badge: 'NOT APPLICABLE', cls: 'mello-badge-na', desc: 'Rule does not apply to this commodity class or exemption applies.', span: 'col-span-1 row-span-1', large: false },
  { badge: 'NOT VERIFIED', cls: 'bg-not-verified-bg border border-not-verified/20 text-not-verified text-[12px] font-medium px-[10px] py-[4px] rounded-full inline-block', desc: 'Field absent or unreadable. OCR could not extract required text.', span: 'col-span-2 row-span-1', large: false },
];

function BentoStamp({ item, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`mello-card-flat p-5 flex flex-col justify-between overflow-hidden relative ${item.span}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ scale: hovered ? 1.01 : [1, 1.008, 1] }}
      transition={hovered ? { duration: 0.15 } : { repeat: Infinity, duration: 4 + index * 0.5, ease: 'easeInOut' }}
    >
      <div className="mb-3">
        <div className={`${item.cls} inline-block mb-2`}>{item.badge}</div>
      </div>
      <AnimatePresence>
        <motion.p
          className="text-[13px] text-text-muted leading-relaxed"
          animate={{ opacity: hovered ? 1 : item.large ? 0.8 : 0.6 }}
        >
          {item.desc}
        </motion.p>
      </AnimatePresence>
      {hovered && (
        <motion.div
          className="absolute inset-0 bg-accent/3 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

// ─── Filmstrip ────────────────────────────────────────────────────────────
function RuleFilmstrip() {
  return (
    <div className="relative h-[120px] w-full overflow-hidden bg-surface rounded-xl border border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface z-10 pointer-events-none" />
      <motion.div className="flex flex-col items-center justify-start absolute top-0 left-0 w-full"
        initial={{ y: 0 }} animate={{ y: -480 }}
        transition={{ duration: 2.2, ease: [0.1, 0.9, 0.2, 1] }}
      >
        {["Rule 6(1)(a)", "Rule 7(2)", "Rule 18(1)", "Rule 6(1)(c)", "Rule 9(3)", "Rule 26", "Rule 6(1)(e)", "Rule 4(1)", "Rule 6(1)(f)"].map((r, i) => (
          <div key={i} className="h-[60px] flex items-center justify-center text-text-secondary font-mono text-[14px]">{r}</div>
        ))}
      </motion.div>
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60px] border-y border-accent/50 bg-accent/5 z-0"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.2 }}
      />
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent rounded-full z-0 blur-xl"
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 2] }}
        transition={{ delay: 2.2, duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function LandingPage() {

  const scanSteps = [
    { label: 'Idle', durationMs: 1500, content: (
      <div className="flex flex-col items-center opacity-50">
        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <span className="text-[13px] font-medium">Drop label image</span>
      </div>
    )},
    { label: 'Image Uploaded', durationMs: 1500, content: (
      <div className="w-full h-[180px] bg-surface rounded-xl overflow-hidden relative border border-border">
        <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-80" alt="Product label" />
      </div>
    )},
    { label: 'Processing', durationMs: 2500, content: (
      <div className="w-full h-[180px] bg-surface rounded-xl overflow-hidden relative border border-border">
        <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover opacity-40 grayscale" alt="Scanning" />
        <div className="absolute inset-0 scan-line-container">
          <div className="w-full h-1 bg-accent absolute top-0 animate-scan"></div>
        </div>
      </div>
    )}
  ];

  const validateSteps = [
    { label: 'OCR Extraction', durationMs: 1500, content: (
      <div className="flex flex-col gap-2 w-full text-left font-mono text-[11px] text-text-primary">
        <div className="bg-surface p-3 rounded-lg border border-border">{'{\n  "mrp": "Rs. 150.00",\n  "net_weight": "500g",\n  "date": "10/2023"\n}'}</div>
      </div>
    )},
    { label: 'Rule Matching', durationMs: 3500, content: <RuleFilmstrip /> },
    { label: 'Result', durationMs: 2000, content: <div className="mello-badge-review scale-125">Rule 6(1)(f)</div> }
  ];

  const reportSteps = [
    { label: 'PDF Generated', durationMs: 2000, content: (
      <div className="flex flex-col items-center">
        <div className="w-16 h-20 bg-surface border border-border rounded shadow-lg flex flex-col p-2 gap-2 relative">
          <div className="w-full h-1 bg-border rounded-full"></div>
          <div className="w-3/4 h-1 bg-border rounded-full"></div>
          <div className="w-full h-1 bg-border rounded-full mt-2"></div>
          <div className="w-1/2 h-1 bg-border rounded-full"></div>
          <div className="absolute -bottom-2 -right-2 mello-badge-fail scale-50">FAIL</div>
        </div>
      </div>
    )}
  ];

  const [activeCard, setActiveCard] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 3), 7000);
    return () => clearInterval(t);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 26, staggerChildren: 0.09 } }
  };
  const childVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 26 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary font-sans selection:bg-accent/30 relative overflow-hidden">

      {/* Grain overlay */}
      <GrainCanvas />
      {/* Cursor spotlight */}
      <Spotlight />

      {/* NAV */}
      <nav className="w-full flex items-center justify-between px-6 py-4 md:px-12 relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="font-medium text-[17px] tracking-tight text-text-primary">SatyaLabel</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-text-muted">
          <a href="#how-it-works" className="hover:text-text-primary transition-colors duration-200">How it works</a>
          <a href="#rules-engine" className="hover:text-text-primary transition-colors duration-200">Rules Engine</a>
          <a href="#tech" className="hover:text-text-primary transition-colors duration-200">Tech</a>
        </div>
        <Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Enter App</Link>
      </nav>

      {/* HERO */}
      <section className="pt-16 pb-8 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Left: Text */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface mb-8 text-[12px] font-mono text-text-muted"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pass animate-pulse" />
              Smart India Hackathon 2026 · Problem ID SIH26034
            </motion.div>

            <KineticText
              text="Every declaration, checked against the law — in seconds."
              className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6 text-text-primary"
            />

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-[17px] text-text-secondary mb-10 max-w-[520px] leading-relaxed"
            >
              SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 — instantly, with the exact rule cited.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <MagneticButton href="/login">Enter App</MagneticButton>
              <a href="#how-it-works" className="mello-btn-secondary !px-7 !py-3 !text-[15px]">See how it works</a>
            </motion.div>
          </div>

          {/* Right: 3D Seal */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 20 }}
          >
            <SealOrb />
          </motion.div>
        </div>
      </section>

      {/* STATS ROW */}
      <motion.section
        className="py-12 px-6 md:px-12 border-y border-border relative z-10 bg-surface"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={sectionVariants}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 32, suffix: '+', label: 'Rules Checked' },
            { value: 14, suffix: '', label: 'Extracted Fields' },
            { value: 5, suffix: '', label: 'Compliance Statuses' },
            { value: 4, suffix: 's', label: 'Avg Scan Time' },
          ].map((stat, i) => (
            <motion.div key={i} variants={childVariants} className="text-center">
              <div className="text-[42px] font-medium tracking-tight text-primary mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[13px] text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* PIPELINE DIAGRAM */}
      <motion.section
        className="px-6 md:px-12 w-full max-w-[1200px] mx-auto relative z-10 py-20"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
      >
        <motion.div variants={childVariants} className="mb-10 text-center">
          <h2 className="text-[28px] font-medium tracking-tight text-text-primary mb-2">From pixels to penalty notice</h2>
          <p className="text-[15px] text-text-secondary">A fully automated compliance pipeline.</p>
        </motion.div>
        <PipelineDiagram />
      </motion.section>

      {/* HOW IT WORKS — Demo Cards */}
      <motion.section
        id="how-it-works"
        className="py-24 px-6 md:px-12 bg-background border-y border-border relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
      >
        <div className="max-w-[1200px] mx-auto">
          <motion.div variants={childVariants} className="mb-16">
            <h2 className="text-[32px] font-medium tracking-tight mb-3">The Pipeline</h2>
            <p className="text-[16px] text-text-secondary max-w-[500px]">
              From raw pixels to a formal compliance report — completely automated via edge OCR and deterministic rule checks.
            </p>
          </motion.div>

          <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { steps: scanSteps, autoPlay: true, loop: true, showCursor: true },
              { steps: validateSteps, autoPlay: true, loop: true },
              { steps: reportSteps, autoPlay: false, loop: false },
            ].map((card, i) => (
              <TiltCard key={i} active={activeCard === i}>
                <DemoCard {...card} />
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* BEFORE / AFTER — scroll-scrubbed */}
      <motion.section
        className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
      >
        <motion.div variants={childVariants} className="mb-12 text-center">
          <h2 className="text-[32px] font-medium tracking-tight mb-4">The Transformation</h2>
          <p className="text-[15px] text-text-secondary">Scroll to reveal what changes.</p>
        </motion.div>
        <ScrollWiper />
      </motion.section>

      {/* RULES ENGINE — Bento Grid */}
      <motion.section
        id="rules-engine"
        className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
      >
        <motion.div variants={childVariants} className="mb-12 md:w-2/3">
          <h2 className="text-[32px] font-medium tracking-tight mb-4">Rooted in law, not "AI says so".</h2>
          <p className="text-[16px] text-text-secondary leading-relaxed">
            Violations are matched deterministically to the actual Legal Metrology (Packaged Commodities) Rules, 2011. There are no hallucinations in the ruling.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div variants={childVariants} className="grid grid-cols-3 md:grid-cols-4 gap-4 auto-rows-[140px] mb-16">
          {STATUS_ITEMS.map((item, i) => <BentoStamp key={i} item={item} index={i} />)}
          {/* Rule citation card */}
          <div className="mello-card-flat p-5 col-span-3 md:col-span-2 row-span-2 flex flex-col justify-between bg-background">
            <div className="text-[11px] font-mono text-text-muted mb-3 uppercase tracking-widest">Rule Citation Example</div>
            <div className="font-mono text-[12px] text-text-primary bg-surface p-3 rounded-lg border border-border mb-3">
              <div className="text-text-muted mb-1">// Extracted</div>
              <div className="text-text-secondary">"MRP Rs. 150.00"</div>
            </div>
            <div className="mello-card-flat bg-surface p-4 border-l-2 border-l-accent mt-auto">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[13px]">Rule 6(1)(f)</span>
                <div className="mello-badge-fail text-[10px]">NON-COMPLIANCE</div>
              </div>
              <p className="text-[12px] text-text-secondary">MRP must be declared inclusive of all taxes.</p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* TECH */}
      <motion.section
        id="tech"
        className="py-24 px-6 md:px-12 bg-background border-t border-border relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={childVariants} className="mello-card-flat p-8 flex flex-col h-full">
            <h3 className="text-[14px] font-medium text-text-primary mb-6 uppercase tracking-widest">Stack Overview</h3>
            <ul className="flex flex-col gap-4 text-[14px]">
              {[
                ['Frontend', 'Next.js 16 App Router + Tailwind v4'],
                ['Backend', 'Express.js REST API'],
                ['Database', 'PostgreSQL via Supabase'],
                ['Extraction', 'Tesseract OCR + Gemini Vision'],
                ['Deployment', 'Vercel (Edge) + Render'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-text-muted">{k}</span>
                  <span className="text-text-secondary font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={childVariants} className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[12px] font-medium font-mono text-text-secondary">SIH26034</span>
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">Ministry of Consumer Affairs</h3>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
              Built for the Smart India Hackathon 2026. Manual label inspection cannot scale to millions of SKUs. Edge-cached AI extraction with deterministic rule engines can.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* FINAL CTA */}
      <motion.section
        className="py-32 px-6 text-center flex flex-col items-center relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
      >
        <motion.h2 variants={childVariants} className="text-[40px] md:text-[52px] font-medium tracking-[-0.02em] mb-4 text-text-primary">
          Your label. The law. One scan.
        </motion.h2>
        <motion.p variants={childVariants} className="text-[16px] text-text-secondary mb-12 max-w-[400px]">
          No manual cross-referencing. No ambiguity. Just a deterministic answer with the rule cited.
        </motion.p>
        <motion.div variants={childVariants}>
          <MagneticButton href="/login">Enter App</MagneticButton>
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className="w-full py-8 px-6 md:px-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-text-muted relative z-10 bg-background">
        <div className="flex items-center gap-6">
          <span className="text-text-primary font-medium">SatyaLabel</span>
          <a href="#how-it-works" className="hover:text-text-secondary transition-colors">How it works</a>
          <a href="#rules-engine" className="hover:text-text-secondary transition-colors">Rules</a>
          <a href="#tech" className="hover:text-text-secondary transition-colors">Tech</a>
        </div>
        <div>Smart India Hackathon 2026 Prototype · Ministry of Consumer Affairs</div>
      </footer>
    </div>
  );
}
