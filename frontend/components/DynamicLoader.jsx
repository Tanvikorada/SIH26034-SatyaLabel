'use client';
import { useState, useEffect } from 'react';

// Highly 3D-styled SVGs using multi-layered paths, bevels, and gloss highlights
const icons = [
  // Pair 1: 3D Shield & 3D Document Stack
  [
    <svg key="shield" width="70" height="70" viewBox="0 0 100 100" fill="none" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="shieldBase" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E3A8A"/><stop offset="100%" stopColor="#172554"/></linearGradient>
        <linearGradient id="shieldFront" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1D4ED8"/></linearGradient>
        <linearGradient id="shieldGloss" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.6)"/><stop offset="50%" stopColor="rgba(255,255,255,0)"/></linearGradient>
      </defs>
      {/* 3D Depth / Extrusion */}
      <path d="M50 95s35-15 35-45V20L50 5L15 20v30c0 30 35 45 35 45z" fill="url(#shieldBase)" transform="translate(4, 6)"/>
      {/* Front Face */}
      <path d="M50 95s35-15 35-45V20L50 5L15 20v30c0 30 35 45 35 45z" fill="url(#shieldFront)"/>
      {/* Gloss Highlight */}
      <path d="M50 95c0 0-35-15-35-45V20L50 5v90z" fill="url(#shieldGloss)" opacity="0.6"/>
    </svg>,
    <svg key="doc" width="62" height="62" viewBox="0 0 100 100" fill="none" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="docBase" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B45309"/><stop offset="100%" stopColor="#78350F"/></linearGradient>
        <linearGradient id="docFront" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#D97706"/></linearGradient>
      </defs>
      {/* 3D Pages (Extrusion) */}
      <path d="M30 15h40a8 8 0 0 1 8 8v60a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V23a8 8 0 0 1 8-8z" fill="url(#docBase)" transform="translate(6, 6)"/>
      <path d="M26 11h40a8 8 0 0 1 8 8v60a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V19a8 8 0 0 1 8-8z" fill="#FDE68A" transform="translate(3, 3)"/>
      {/* Front Page */}
      <path d="M22 7h40a8 8 0 0 1 8 8v60a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V15a8 8 0 0 1 8-8z" fill="url(#docFront)"/>
      {/* Lines */}
      <rect x="35" y="30" width="30" height="6" rx="3" fill="#FFF" opacity="0.9"/>
      <rect x="35" y="45" width="30" height="6" rx="3" fill="#FFF" opacity="0.9"/>
      <rect x="35" y="60" width="20" height="6" rx="3" fill="#FFF" opacity="0.9"/>
    </svg>
  ],
  // Pair 2: 3D Magnifying Glass & 3D Box
  [
    <svg key="mag" width="66" height="66" viewBox="0 0 100 100" fill="none" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="lens" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#67E8F9"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient>
        <linearGradient id="rim" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F8FAFC"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient>
        <linearGradient id="handle" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#4C1D95"/></linearGradient>
      </defs>
      {/* Handle Extrusion & Base */}
      <rect x="58" y="58" width="16" height="36" rx="8" transform="rotate(-45 58 58)" fill="#312E81" />
      <rect x="54" y="54" width="16" height="36" rx="8" transform="rotate(-45 54 54)" fill="url(#handle)" />
      {/* Lens Rim Extrusion */}
      <circle cx="46" cy="46" r="30" fill="#475569" />
      {/* Lens Rim Front */}
      <circle cx="42" cy="42" r="30" fill="url(#rim)" />
      {/* Lens Glass */}
      <circle cx="42" cy="42" r="22" fill="url(#lens)" opacity="0.8" />
      {/* Lens Highlight */}
      <path d="M42 20a22 22 0 0 0-22 22 22 22 0 0 1 22-22z" fill="#FFF" opacity="0.8"/>
    </svg>,
    <svg key="box" width="66" height="66" viewBox="0 0 100 100" fill="none" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#059669"/></linearGradient>
        <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
        <linearGradient id="boxRight" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#064E3B"/></linearGradient>
      </defs>
      {/* Isometric Box Faces */}
      <path d="M50 15 L85 30 L50 45 L15 30 Z" fill="url(#boxTop)" />
      <path d="M15 30 L50 45 L50 85 L15 70 Z" fill="url(#boxLeft)" />
      <path d="M85 30 L50 45 L50 85 L85 70 Z" fill="url(#boxRight)" />
      {/* Highlight lines to enforce 3D edges */}
      <path d="M15 30 L50 45 L85 30" stroke="#6EE7B7" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M50 45 L50 85" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ]
];

const logTexts = [
  "Targeting bounding boxes on package geometry...",
  "Isolating Manufacturer Address block...",
  "Extracting textual data layer...",
  "Evaluating Rule 6 compliance parameters...",
  "Verifying MRP formatting and tax inclusiveness...",
  "Initiating biochemical composition check...",
  "Cross-referencing E-number toxicity database...",
  "Aggregating 33 rule outcomes...",
  "Finalizing compliance payload..."
];

export default function DynamicLoader() {
  const [pairIdx, setPairIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [logIdx, setLogIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start exit animation (Swap/Revolve Out)
      setIsTransitioning(true);
      setTimeout(() => {
        // Change icon and instantly start entrance animation
        setPairIdx((prev) => (prev + 1) % icons.length);
        setIsTransitioning(false);
      }, 400); // 400ms physical drop-out duration
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIdx((prev) => {
        if (prev < logTexts.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const currentPair = icons[pairIdx];
  const currentLog = logTexts[logIdx];

  // The 'isTransitioning' state triggers the Swiggy-style drop/swap.
  // When TRUE (exiting): Items drop down heavily, shrink, and fade.
  // When FALSE (entering/active): Items spring up to center, grow, and float.
  
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] animate-in fade-in duration-500 overflow-hidden">
      
      {/* Animated Objects Container */}
      <div className="flex items-end justify-center gap-12 h-[130px] mb-8 relative z-10 perspective-[1000px]">
        
        {/* Object 1 (Left) */}
        <div className="flex flex-col items-center gap-6">
          <div 
            className={`
              transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isTransitioning 
                ? 'translate-y-[80px] scale-50 opacity-0 rotate-[-30deg]' 
                : 'translate-y-0 scale-100 opacity-100 rotate-0'}
            `}
          >
            <div className={!isTransitioning ? "animate-[bounceFloat_1.5s_ease-in-out_infinite_alternate]" : ""}>
              {currentPair[0]}
            </div>
          </div>
          <div className="w-14 h-2 bg-black/10 dark:bg-white/10 rounded-[100%] blur-[2px] animate-[shadowScale_1.5s_ease-in-out_infinite_alternate]"></div>
        </div>

        {/* Object 2 (Right) */}
        <div className="flex flex-col items-center gap-6">
          <div 
            className={`
              transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-[50ms]
              ${isTransitioning 
                ? 'translate-y-[80px] scale-50 opacity-0 rotate-[30deg]' 
                : 'translate-y-0 scale-100 opacity-100 rotate-0'}
            `}
          >
            <div className={!isTransitioning ? "animate-[bounceFloat_1.5s_ease-in-out_infinite_alternate-reverse]" : ""}>
              {currentPair[1]}
            </div>
          </div>
          <div className="w-14 h-2 bg-black/10 dark:bg-white/10 rounded-[100%] blur-[2px] animate-[shadowScale_1.5s_ease-in-out_infinite_alternate-reverse]"></div>
        </div>
        
      </div>

      {/* Dynamic Tiny Text Log */}
      <div className="flex flex-col items-center h-10 relative z-10 w-full overflow-hidden">
        <div key={logIdx} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <span className="text-[12px] md:text-[13px] font-medium text-slate-600 dark:text-slate-300 tracking-wide truncate max-w-[280px] md:max-w-md">
            {currentLog}
          </span>
        </div>
      </div>
      
    </div>
  );
}
