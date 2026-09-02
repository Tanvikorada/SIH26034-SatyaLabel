'use client';
import { useState, useEffect } from 'react';

const icons = [
  // Pair 1: Shield & Document
  [
    <svg key="shield" width="64" height="64" viewBox="0 0 24 24" fill="url(#grad1)" className="drop-shadow-lg">
      <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E3A8A"/><stop offset="100%" stopColor="#3B82F6"/></linearGradient></defs>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>,
    <svg key="doc" width="56" height="56" viewBox="0 0 24 24" fill="url(#grad2)" className="drop-shadow-lg">
      <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FCD34D"/></linearGradient></defs>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" fill="#FCD34D" /><line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="10" y1="9" x2="8" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ],
  // Pair 2: Magnifying Glass & Scale (Metrology)
  [
    <svg key="mag" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#grad3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
      <defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#D946EF"/></linearGradient></defs>
      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>,
    <svg key="scale" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
      <defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#34D399"/></linearGradient></defs>
      <path d="M12 3v18"></path><rect x="4" y="20" width="16" height="2"></rect><path d="M12 5l7 4-7 4-7-4 7-4z" fill="#34D399" opacity="0.4"></path><path d="M5 9v5a7 7 0 0 0 14 0V9"></path>
    </svg>
  ],
  // Pair 3: AI Brain & Checklist
  [
    <svg key="ai" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#grad5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
      <defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EC4899"/><stop offset="100%" stopColor="#F43F5E"/></linearGradient></defs>
      <path d="M12 2a10 10 0 1 0 10 10H12V2z" fill="#EC4899" opacity="0.3"></path><path d="M12 2a10 10 0 0 1 10 10H12V2z"></path><path d="M12 12v10"></path><path d="M2.5 9.5L12 12"></path><path d="M21.5 14.5L12 12"></path>
    </svg>,
    <svg key="check" width="56" height="56" viewBox="0 0 24 24" fill="url(#grad6)" className="drop-shadow-lg">
      <defs><linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14B8A6"/><stop offset="100%" stopColor="#2DD4BF"/></linearGradient></defs>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
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

  // Cycle the icons
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setPairIdx((prev) => (prev + 1) % icons.length);
        setIsTransitioning(false);
      }, 300); // Wait for fade out
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Cycle the logs faster than the icons
  useEffect(() => {
    const interval = setInterval(() => {
      setLogIdx((prev) => {
        if (prev < logTexts.length - 1) return prev + 1;
        return prev; // stop at finalizing
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const currentPair = icons[pairIdx];
  const currentLog = logTexts[logIdx];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] animate-in fade-in duration-500">
      
      {/* Animated Objects Container */}
      <div className="flex items-end justify-center gap-10 h-[120px] mb-8 relative z-10">
        
        {/* Object 1 */}
        <div className="flex flex-col items-center gap-6">
          <div className={`animate-[bounceFloat_1.5s_ease-in-out_infinite_alternate] transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            {currentPair[0]}
          </div>
          <div className="w-12 h-2 bg-black/10 dark:bg-white/10 rounded-[100%] blur-[2px] animate-[shadowScale_1.5s_ease-in-out_infinite_alternate]"></div>
        </div>

        {/* Object 2 */}
        <div className="flex flex-col items-center gap-6">
          <div className={`animate-[bounceFloat_1.5s_ease-in-out_infinite_alternate-reverse] transition-all duration-300 delay-75 ${isTransitioning ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            {currentPair[1]}
          </div>
          <div className="w-12 h-2 bg-black/10 dark:bg-white/10 rounded-[100%] blur-[2px] animate-[shadowScale_1.5s_ease-in-out_infinite_alternate-reverse]"></div>
        </div>
        
      </div>

      {/* Dynamic Tiny Text Log */}
      <div className="flex flex-col items-center h-10 overflow-hidden relative z-10">
        <div key={logIdx} className="inline-flex items-center gap-2 px-4 py-2 bg-background dark:bg-white/5 rounded-full border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-[12px] md:text-[13px] font-medium text-text-secondary tracking-wide">
            {currentLog}
          </span>
        </div>
      </div>
      
    </div>
  );
}
