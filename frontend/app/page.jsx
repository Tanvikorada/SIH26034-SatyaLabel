"use client";
import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  motion, useMotionValue, useTransform, useScroll,
  useSpring, useInView, AnimatePresence
} from 'framer-motion';
import {
  Shield, FileText, ScanLine, BarChart3, Upload,
  CheckCircle2, AlertTriangle, HelpCircle, MinusCircle, EyeOff,
  Sun, Moon, Zap, Clock, FileSearch, Scale, Layers
} from 'lucide-react';
import DemoCard from '../components/DemoCard';

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
    <motion.div
      className="pointer-events-none fixed inset-0 z-[2]"
      style={{
        background: useTransform(
          [mouseX, mouseY],
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, color-mix(in srgb, var(--color-accent) 7%, transparent), transparent 70%)`
        )
      }}
    />
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

// ─── 2D Parallax Seal (Option B — clean, verified no overlaps) ────────────
function SealMedallion() {
  const containerRef = useRef(null);
  const outerX = useMotionValue(0);
  const outerY = useMotionValue(0);
  const midX = useMotionValue(0);
  const midY = useMotionValue(0);
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);
  const reduced = useReducedMotion();

  const sOX = useSpring(outerX, { stiffness: 80, damping: 20 });
  const sOY = useSpring(outerY, { stiffness: 80, damping: 20 });
  const sMX = useSpring(midX, { stiffness: 100, damping: 20 });
  const sMY = useSpring(midY, { stiffness: 100, damping: 20 });
  const sIX = useSpring(innerX, { stiffness: 130, damping: 20 });
  const sIY = useSpring(innerY, { stiffness: 130, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const move = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      outerX.set(dx * -8); outerY.set(dy * -8);
      midX.set(dx * -4);   midY.set(dy * -4);
      innerX.set(dx * 4);  innerY.set(dy * 4);
    };
    const reset = () => {
      outerX.set(0); outerY.set(0);
      midX.set(0);   midY.set(0);
      innerX.set(0); innerY.set(0);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', reset);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseleave', reset); };
  }, [outerX, outerY, midX, midY, innerX, innerY, reduced]);

  // Sizes — all in px on a 280×280 canvas
  const SIZE = 280;
  const CX = 140, CY = 140;

  return (
    <div ref={containerRef} style={{ width: SIZE, height: SIZE, position: 'relative' }}>
      {/* Ambient glow — fixed, behind everything */}
      <div style={{
        position: 'absolute', inset: -20,
        background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(20px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Layer 0 — outer dashed ring (moves most) */}
      <motion.div
        style={{ position: 'absolute', inset: 0, x: sOX, y: sOY, zIndex: 1 }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} overflow="visible">
          {/* Dashed outer ring */}
          <circle cx={CX} cy={CY} r={126} fill="none"
            stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="5 5" opacity="0.6"
            className="animate-spin-slow"
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          {/* Solid ring slightly inside */}
          <circle cx={CX} cy={CY} r={118} fill="none"
            stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3"
          />
          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * 2 * Math.PI - Math.PI / 2;
            const r1 = 120, r2 = i % 3 === 0 ? 112 : 116;
            return (
              <line key={i}
                x1={CX + r1 * Math.cos(a)} y1={CY + r1 * Math.sin(a)}
                x2={CX + r2 * Math.cos(a)} y2={CY + r2 * Math.sin(a)}
                stroke="var(--color-accent)" strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
                opacity={i % 3 === 0 ? 0.7 : 0.4}
              />
            );
          })}
          {/* Text on path */}
          <defs>
            <path id="textRing" d={`M ${CX},${CY} m -108,0 a 108,108 0 1,1 216,0 a 108,108 0 1,1 -216,0`} />
          </defs>
          <text fontSize="7.5" fill="var(--color-accent)" fontFamily="monospace" letterSpacing="2" opacity="0.65">
            <textPath href="#textRing" startOffset="0%">LEGAL METROLOGY · PACKAGED COMMODITIES · INDIA 2011 · </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Layer 1 — middle ring (moves half as much) */}
      <motion.div
        style={{ position: 'absolute', inset: 0, x: sMX, y: sMY, zIndex: 2 }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={CX} cy={CY} r={96} fill="none"
            stroke="var(--color-border)" strokeWidth="1" opacity="0.8"
          />
          {/* Counter-rotating inner dashes */}
          <circle cx={CX} cy={CY} r={88} fill="none"
            stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="3 9"
            className="animate-spin-counter"
            style={{ transformOrigin: `${CX}px ${CY}px`, opacity: 0.5 }}
          />
          {/* 6 small dots evenly spaced */}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * 2 * Math.PI;
            return <circle key={i} cx={CX + 96 * Math.cos(a)} cy={CY + 96 * Math.sin(a)}
              r="2.5" fill="var(--color-accent)" opacity="0.5" />;
          })}
        </svg>
      </motion.div>

      {/* Layer 2 — inner shield + check (moves slightly opposite for depth) */}
      <motion.div
        style={{ position: 'absolute', inset: 0, x: sIX, y: sIY, zIndex: 3 }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Shield body */}
          <path
            d={`M${CX} ${CY - 56} L${CX + 38} ${CY - 38} L${CX + 38} ${CY + 8} C${CX + 38} ${CY + 36} ${CX + 20} ${CY + 50} ${CX} ${CY + 58} C${CX - 20} ${CY + 50} ${CX - 38} ${CY + 36} ${CX - 38} ${CY + 8} L${CX - 38} ${CY - 38} Z`}
            fill="color-mix(in srgb, var(--color-accent) 8%, transparent)"
            stroke="var(--color-text-primary)"
            strokeWidth="1.5"
            opacity="0.9"
          />
          {/* Checkmark */}
          <path
            d={`M${CX - 12} ${CY + 4} L${CX - 2} ${CY + 16} L${CX + 16} ${CY - 10}`}
            fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

// ─── Progress Ring Stat Card ──────────────────────────────────────────────
function StatCard({ value, suffix = '', label, icon: Icon, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  const RADIUS = 30, CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = count / value;

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(value); return; }
    let start = null;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [inView, value, reduced]);

  return (
    <motion.div
      ref={ref}
      className="mello-card flex flex-col items-center justify-center p-6 gap-3 cursor-default relative"
      whileHover={{ y: -3, boxShadow: `0 8px 24px color-mix(in srgb, ${color} 18%, transparent)` }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Progress ring */}
      <svg width="80" height="80" className="shrink-0">
        {/* Track */}
        <circle cx="40" cy="40" r={RADIUS} fill="none"
          stroke="var(--color-border)" strokeWidth="3" />
        {/* Fill */}
        <circle cx="40" cy="40" r={RADIUS} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.05s linear' }}
        />
        {/* Icon in center */}
        <foreignObject x="16" y="16" width="48" height="48">
          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={color} strokeWidth={1.75} />
          </div>
        </foreignObject>
      </svg>
      <div className="text-center">
        <div className="text-[32px] font-medium tracking-tight tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
          {count}{suffix}
        </div>
        <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Typewriter Rule Ticker ───────────────────────────────────────────────
const RULES_CYCLE = [
  'Rule 6(1)(a) — Product Name (Common/Generic)',
  'Rule 6(1)(f) — MRP inclusive of all taxes',
  'Rule 7(2) — Declaration size ≥ 2mm',
  'Rule 4(1) — Principal display panel',
  'Rule 6(1)(c) — Net Quantity declaration',
  'Rule 26 — Manufacturer details',
];

function RuleTicker() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [charIdx, setCharIdx] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setDisplayed(RULES_CYCLE[0]); return; }
    const target = RULES_CYCLE[idx];
    if (charIdx < target.length) {
      const t = setTimeout(() => {
        setDisplayed(target.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setIdx(i => (i + 1) % RULES_CYCLE.length);
        setCharIdx(0);
        setDisplayed('');
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [idx, charIdx, reduced]);

  return (
    <div className="flex items-center gap-2 text-[13px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
      <span style={{ color: 'var(--color-accent)', opacity: 0.7 }}>▸</span>
      <span>{displayed}</span>
      <span className="inline-block w-[2px] h-[14px] align-middle" style={{ background: 'var(--color-accent)', animation: 'typewriter-blink 0.9s step-end infinite' }} />
    </div>
  );
}

// ─── Accordion Status Stamp ───────────────────────────────────────────────
const STATUS_DATA = [
  {
    badge: 'PASS', badgeCls: 'mello-badge-pass',
    Icon: CheckCircle2, color: 'var(--color-pass)',
    span: 'col-span-2 row-span-2',
    desc: 'Fully compliant. All mandatory declarations present and valid per LM(PC) Rules 2011.',
    field: 'net_quantity: "500g"',
    rule: 'Rule 6(1)(c)',
    explanation: 'Net quantity declared correctly in standard unit with numerals meeting minimum height requirements.',
  },
  {
    badge: 'POTENTIAL NON-COMPLIANCE', badgeCls: 'mello-badge-fail',
    Icon: AlertTriangle, color: 'var(--color-noncompliant)',
    span: 'col-span-1 row-span-1',
    desc: 'Clear violation detected. Cite-ready for formal inspection notice.',
    field: 'mrp: "Rs.150"',
    rule: 'Rule 6(1)(f)',
    explanation: 'MRP must be declared "inclusive of all taxes". The phrase is absent.',
  },
  {
    badge: 'MANUAL REVIEW', badgeCls: 'mello-badge-review',
    Icon: HelpCircle, color: 'var(--color-review)',
    span: 'col-span-2 row-span-1',
    desc: 'Ambiguous phrasing or partially legible text. Flag for human officer decision.',
    field: 'mfg_date: "10/23"',
    rule: 'Rule 6(1)(d)',
    explanation: 'Date format "10/23" is ambiguous — could be MM/YY or DD/MM. Requires officer judgement.',
  },
  {
    badge: 'NOT APPLICABLE', badgeCls: 'mello-badge-na',
    Icon: MinusCircle, color: 'var(--color-not-applicable)',
    span: 'col-span-1 row-span-1',
    desc: 'Rule does not apply to this commodity class. Exemption confirmed.',
    field: 'category: "exempt"',
    rule: 'Rule 31 Exemption',
    explanation: 'Products below threshold weight/value are exempt from some declarations under Schedule II.',
  },
  {
    badge: 'NOT VERIFIED', badgeCls: 'mello-badge-not-verified',
    Icon: EyeOff, color: 'var(--color-not-verified)',
    span: 'col-span-2 row-span-1',
    desc: 'Field absent or unreadable. OCR could not extract required text.',
    field: 'fssai_license: null',
    rule: 'Rule 14A',
    explanation: 'FSSAI number not found in extracted text. Label may be damaged or field is missing.',
  },
];

function StampCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`mello-card-flat flex flex-col overflow-hidden cursor-pointer select-none ${item.span}`}
      onClick={() => setOpen(o => !o)}
      animate={{ scale: open ? 1 : [1, 1.007, 1] }}
      transition={open || reduced ? {} : { repeat: Infinity, duration: 4 + index * 0.6, ease: 'easeInOut' }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 p-4">
        <item.Icon size={16} color={item.color} strokeWidth={1.75} />
        <span className={`${item.badgeCls} text-[11px]`}>{item.badge}</span>
        <motion.span
          className="ml-auto text-[11px]"
          style={{ color: 'var(--color-text-muted)' }}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >▸</motion.span>
      </div>
      <p className="px-4 text-[12px] pb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>

      {/* Accordion detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="font-mono text-[11px] rounded px-2 py-1.5" style={{ background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}>
                {item.field}
              </div>
              <div className="flex items-center gap-2">
                <Scale size={11} color={item.color} />
                <span className="font-mono text-[11px]" style={{ color: item.color }}>{item.rule}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────
function MagneticButton({ children, href }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20 });
  const springY = useSpring(y, { stiffness: 280, damping: 20 });
  const reduced = useReducedMotion();

  const handleMove = useCallback((e) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y, reduced]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }} className="inline-block"
    >
      <Link href={href} className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2">
        {children}
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>→</motion.span>
      </Link>
    </motion.div>
  );
}

// ─── Tilt Card Wrapper ────────────────────────────────────────────────────
function TiltCard({ children, active }) {
  const ref = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const sRX = useSpring(rotX, { stiffness: 200, damping: 22 });
  const sRY = useSpring(rotY, { stiffness: 200, damping: 22 });
  const reduced = useReducedMotion();

  const handleMove = useCallback((e) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotX.set((py - 0.5) * -7);
    rotY.set((px - 0.5) * 7);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }, [rotX, rotY, glareX, glareY, reduced]);

  const handleLeave = useCallback(() => {
    rotX.set(0); rotY.set(0);
    glareX.set(50); glareY.set(50);
  }, [rotX, rotY, glareX, glareY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: sRX, rotateY: sRY, transformStyle: 'preserve-3d', perspective: '800px' }}
      className="relative rounded-2xl"
    >
      {/* Conic animated border when active */}
      {active && !reduced && (
        <div className="absolute -inset-[1px] rounded-2xl z-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%]"
            style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--color-accent) 60deg, transparent 120deg)', animation: 'conic-border 3s linear infinite' }}
          />
          <div className="absolute inset-[1px] rounded-2xl" style={{ background: 'var(--color-background)' }} />
        </div>
      )}
      {/* Glare */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.07), transparent 60%)`
          )
        }}
      />
      <div className="relative z-[5]">{children}</div>
    </motion.div>
  );
}

// ─── Scroll-Scrubbed Wiper (with synced stat count-up) ────────────────────
function ScrollWiper() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const clipPct = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const reduced = useReducedMotion();

  // Count-up synced to scroll progress
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (reduced) { setTime(10); return; }
    const unsub = clipPct.on('change', (v) => {
      // clipPct goes 100→0 as we reveal; map 0→100 progress to 0→10
      const progress = 1 - v / 100;
      setTime(Math.round(progress * 10));
    });
    return unsub;
  }, [clipPct, reduced]);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 rounded-2xl border overflow-hidden shadow-md"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      {/* Manual side */}
      <div className="p-10 border-b md:border-b-0 md:border-r flex flex-col justify-center items-center text-center gap-5 relative overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Background motif — subtle stacked-papers */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          {[0, 10, 20, 30, 40, 50].map(o => (
            <rect key={o} x={30+o} y={40+o} width="200" height="240" rx="4"
              fill="none" stroke="currentColor" strokeWidth="2" opacity={1 - o/60} />
          ))}
        </svg>
        <div className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
          style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
          <Clock size={22} color="var(--color-text-muted)" />
        </div>
        <h3 className="text-[20px] font-medium relative z-10" style={{ color: 'var(--color-text-primary)' }}>Manual Inspection</h3>
        <p className="text-[14px] leading-relaxed relative z-10" style={{ color: 'var(--color-text-muted)' }}>
          5–30 minutes per product. Error-prone. Hard to enforce uniformly at scale.
        </p>
        <div className="text-[28px] font-medium relative z-10" style={{ color: 'var(--color-text-muted)' }}>~20 min</div>
      </div>

      {/* SatyaLabel side — scroll-wiped */}
      <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
        {/* Ghost behind (desaturated) */}
        <div className="absolute inset-0 p-10 flex flex-col justify-center items-center text-center gap-5 pointer-events-none opacity-20">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <Zap size={22} color="var(--color-text-muted)" />
          </div>
          <h3 className="text-[20px] font-medium" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</h3>
          <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>Under 10 seconds per scan.</p>
          <div className="text-[28px] font-medium" style={{ color: 'var(--color-text-muted)' }}>0s</div>
        </div>

        {/* Revealed layer */}
        <motion.div
          className="absolute inset-0 p-10 flex flex-col justify-center items-center text-center gap-5"
          style={{
            clipPath: reduced
              ? 'inset(0 0% 0 0)'
              : useTransform(clipPct, v => `inset(0 ${v}% 0 0)`),
            background: 'var(--color-background)'
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'color-mix(in srgb, var(--color-accent) 4%, transparent)' }} />
          {/* Circuit motif */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
            {[50, 80, 110, 140, 170, 200, 230].map(y => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeWidth="1" />
            ))}
            {[50, 100, 150, 200, 250].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--color-accent)', opacity: 0.4 }} />
          <div className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}>
            <Zap size={22} color="var(--color-accent)" />
          </div>
          <h3 className="text-[20px] font-medium relative z-10" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</h3>
          <p className="text-[14px] leading-relaxed relative z-10" style={{ color: 'var(--color-text-secondary)' }}>
            Under 10 seconds per scan. Perfectly consistent. Scales to millions of SKUs.
          </p>
          <div className="text-[28px] font-medium relative z-10 tabular-nums" style={{ color: 'var(--color-accent)' }}>
            {time}s
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Filmstrip ────────────────────────────────────────────────────────────
function RuleFilmstrip() {
  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-surface), transparent 30%, transparent 70%, var(--color-surface))' }} />
      <motion.div className="flex flex-col items-center justify-start absolute top-0 left-0 w-full"
        initial={{ y: 0 }} animate={{ y: -480 }}
        transition={{ duration: 2.2, ease: [0.1, 0.9, 0.2, 1] }}
      >
        {["Rule 6(1)(a)", "Rule 7(2)", "Rule 18(1)", "Rule 6(1)(c)", "Rule 9(3)", "Rule 26", "Rule 6(1)(e)", "Rule 4(1)", "Rule 6(1)(f)"].map((r, i) => (
          <div key={i} className="h-[60px] flex items-center justify-center font-mono text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>{r}</div>
        ))}
      </motion.div>
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60px] z-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.2 }}
        style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 50%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 50%, transparent)', background: 'color-mix(in srgb, var(--color-accent) 5%, transparent)' }}
      />
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full z-0 blur-xl"
        style={{ background: 'var(--color-accent)' }}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 0.35, 0], scale: [0.5, 1.5, 2] }}
        transition={{ delay: 2.2, duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const reduced = useReducedMotion();
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 3), 7500);
    return () => clearInterval(t);
  }, []);

  const scanSteps = [
    {
      label: 'Idle', durationMs: 1500, content: (
        <div className="flex flex-col items-center" style={{ opacity: 0.45 }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--color-border)' }}>
            <Upload size={20} color="var(--color-text-muted)" />
          </div>
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Drop label image</span>
        </div>
      )
    },
    {
      label: 'Image Uploaded', durationMs: 1500, content: (
        <div className="w-full h-[180px] rounded-xl overflow-hidden relative" style={{ border: '1px solid var(--color-border)' }}>
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover" style={{ opacity: 0.8 }} alt="Product label" />
        </div>
      )
    },
    {
      label: 'Scanning', durationMs: 2500, content: (
        <div className="w-full h-[180px] rounded-xl overflow-hidden relative" style={{ border: '1px solid var(--color-border)' }}>
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover grayscale" style={{ opacity: 0.35 }} alt="Scanning" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-1 absolute top-0 animate-scan" style={{ background: 'var(--color-accent)' }} />
          </div>
        </div>
      )
    }
  ];

  const validateSteps = [
    {
      label: 'OCR Extraction', durationMs: 1600, content: (
        <div className="flex flex-col gap-2 w-full text-left font-mono text-[11px]" style={{ color: 'var(--color-text-primary)' }}>
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {'{\n  "mrp": "Rs. 150.00",\n  "net_weight": "500g",\n  "date": "10/2023"\n}'}
          </div>
        </div>
      )
    },
    { label: 'Rule Matching', durationMs: 3500, content: <RuleFilmstrip /> },
    {
      label: 'Result', durationMs: 2000, content: (
        <div className="mello-badge-review" style={{ transform: 'scale(1.2)' }}>Rule 6(1)(f)</div>
      )
    }
  ];

  const reportSteps = [
    {
      label: 'PDF Generated', durationMs: 2000, content: (
        <div className="flex flex-col items-center">
          <div className="w-16 h-20 rounded flex flex-col p-2 gap-2 relative shadow-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-full h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
            <div className="w-3/4 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
            <div className="w-full h-1 rounded-full mt-2" style={{ background: 'var(--color-border)' }} />
            <div className="w-1/2 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
            <div className="absolute -bottom-2 -right-2 mello-badge-fail" style={{ fontSize: 9, transform: 'scale(0.85)' }}>FAIL</div>
          </div>
        </div>
      )
    }
  ];

  const sv = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 26, staggerChildren: 0.09 } }
  };
  const cv = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 26 } }
  };
  const vp = { once: true, margin: '-80px' };

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
            <Shield size={14} color="var(--color-background)" />
          </div>
          <span className="font-medium text-[17px] tracking-tight" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
          <a href="#how-it-works" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>How it works</a>
          <a href="#rules-engine" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>Rules Engine</a>
          <a href="#tech" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>Tech</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Enter App</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 pb-8 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-h-[58vh]">
          <div className="flex flex-col items-start">
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-mono mb-8"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)', animation: 'typewriter-blink 2s ease-in-out infinite' }} />
              SIH 2026 · Problem ID SIH26034
            </motion.div>

            <KineticText
              text="Every declaration, checked against the law — in seconds."
              className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6"
            />

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-[17px] mb-10 max-w-[520px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}>
              SatyaLabel scans packaged commodity labels and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 — with the exact rule cited.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex items-center gap-4 flex-wrap">
              <MagneticButton href="/login">Enter App</MagneticButton>
              <a href="#how-it-works" className="mello-btn-secondary !px-7 !py-3 !text-[15px]">How it works</a>
            </motion.div>
          </div>

          <motion.div className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 130, damping: 22 }}>
            <SealMedallion />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <motion.section className="py-16 px-6 md:px-12 relative z-10"
        style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <div className="max-w-[1000px] mx-auto">
          {/* Connecting line */}
          <div className="relative mb-8 hidden md:flex items-center justify-center">
            <div className="absolute left-[12.5%] right-[12.5%] h-[1px]" style={{ background: 'linear-gradient(to right, transparent, var(--color-border), var(--color-border), transparent)' }} />
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{ left: `${12.5 + i * 25}%`, transform: 'translateX(-50%)', background: 'var(--color-accent)', opacity: 0.5 }} />
            ))}
          </div>
          <motion.div variants={cv} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={32} suffix="+" label="Rules Checked" icon={Scale} color="var(--color-accent)" />
            <StatCard value={14} label="Extracted Fields" icon={FileSearch} color="var(--color-review)" />
            <StatCard value={5} label="Compliance Statuses" icon={Layers} color="var(--color-pass)" />
            <StatCard value={4} suffix="s" label="Avg Scan Time" icon={Zap} color="var(--color-noncompliant)" />
          </motion.div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS — Demo Cards ── */}
      <motion.section id="how-it-works" className="py-24 px-6 md:px-12 relative z-10"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div variants={cv} className="mb-16">
            <h2 className="text-[32px] font-medium tracking-tight mb-3">The Pipeline</h2>
            <p className="text-[16px] max-w-[500px]" style={{ color: 'var(--color-text-secondary)' }}>
              From raw pixels to a formal compliance report — completely automated.
            </p>
          </motion.div>
          <motion.div variants={cv} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* ── BEFORE / AFTER ── */}
      <motion.section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <motion.div variants={cv} className="mb-12 text-center">
          <h2 className="text-[32px] font-medium tracking-tight mb-3">The Transformation</h2>
          <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Scroll to reveal what changes.</p>
        </motion.div>
        <motion.div variants={cv}><ScrollWiper /></motion.div>
      </motion.section>

      {/* ── RULES ENGINE ── */}
      <motion.section id="rules-engine" className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10"
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <motion.div variants={cv} className="mb-6 md:w-2/3">
          <h2 className="text-[32px] font-medium tracking-tight mb-3">Rooted in law, not "AI says so".</h2>
          <p className="text-[16px] leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Violations are matched deterministically to the Legal Metrology (Packaged Commodities) Rules, 2011. No hallucinations in the ruling.
          </p>
          <RuleTicker />
        </motion.div>

        <motion.div variants={cv} className="grid grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[minmax(160px,auto)] mb-16 mt-10">
          {STATUS_DATA.map((item, i) => <StampCard key={i} item={item} index={i} />)}
          {/* Citation card */}
          <div className="mello-card-flat p-5 col-span-3 md:col-span-2 row-span-2 flex flex-col gap-4">
            <div className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Live Example</div>
            <div className="font-mono text-[12px] rounded-lg px-3 py-2.5" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>// extracted</span><br/>
              mrp: "Rs. 150.00"
            </div>
            <div className="mello-card-flat p-4 mt-auto" style={{ borderLeft: '2px solid var(--color-accent)' }}>
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="font-mono text-[13px]" style={{ color: 'var(--color-text-primary)' }}>Rule 6(1)(f)</span>
                <div className="mello-badge-fail" style={{ fontSize: 10 }}>NON-COMPLIANCE</div>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                MRP must be declared "inclusive of all taxes". The phrase is absent from this label.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── TECH ── */}
      <motion.section id="tech" className="py-24 px-6 md:px-12 relative z-10"
        style={{ borderTop: '1px solid var(--color-border)' }}
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={cv} className="mello-card-flat p-8 flex flex-col h-full">
            <h3 className="text-[13px] font-medium uppercase tracking-widest mb-6" style={{ color: 'var(--color-text-muted)' }}>Stack Overview</h3>
            <ul className="flex flex-col gap-4 text-[14px]">
              {[
                ['Frontend', 'Next.js 16 App Router + Tailwind v4'],
                ['Backend', 'Express.js REST API'],
                ['Database', 'PostgreSQL via Supabase'],
                ['Extraction', 'Tesseract OCR + Gemini Vision'],
                ['Deployment', 'Vercel (Edge) + Render'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between pb-3 last:pb-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={cv} className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit mb-6 text-[12px] font-mono"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
              SIH26034
            </div>
            <h3 className="text-[24px] font-medium tracking-tight mb-4">Ministry of Consumer Affairs</h3>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Built for Smart India Hackathon 2026. Manual label inspection cannot scale to millions of SKUs. Edge-cached AI extraction with deterministic rule engines can.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ── FINAL CTA ── */}
      <motion.section className="py-32 px-6 text-center flex flex-col items-center relative z-10"
        initial="hidden" whileInView="visible" viewport={vp} variants={sv}>
        <motion.h2 variants={cv} className="text-[40px] md:text-[52px] font-medium tracking-[-0.02em] mb-4">
          Your label. The law. One scan.
        </motion.h2>
        <motion.p variants={cv} className="text-[16px] mb-12 max-w-[380px]" style={{ color: 'var(--color-text-secondary)' }}>
          No manual cross-referencing. No ambiguity. A deterministic answer with the rule cited.
        </motion.p>
        <motion.div variants={cv}>
          <MagneticButton href="/login">Enter App</MagneticButton>
        </motion.div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="w-full py-7 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] relative z-10"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-6">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel</span>
          <a href="#how-it-works" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6 }}>How it works</a>
          <a href="#rules-engine" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6 }}>Rules</a>
          <a href="#tech" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.6 }}>Tech</a>
        </div>
        <div>Smart India Hackathon 2026 · Ministry of Consumer Affairs</div>
      </footer>
    </div>
  );
}
