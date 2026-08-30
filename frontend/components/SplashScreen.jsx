"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show splash screen once per session
    if (sessionStorage.getItem('splash_shown')) {
      setShow(false);
      return;
    }

    // Determine if we are on a mobile device (PWA likely) or just general load
    const isMobile = window.innerWidth < 768;
    
    // If not mobile and not root, maybe skip? Let's just show it on root or dashboard
    if (pathname !== '/' && pathname !== '/dashboard' && !isMobile) {
      setShow(false);
      return;
    }

    // Start fade out after 2 seconds
    const timer1 = setTimeout(() => {
      setFade(true);
    }, 2000);

    // Remove from DOM after fade finishes
    const timer2 = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('splash_shown', 'true');
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing aura slowly fading in behind the static emblem */}
        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-[2.0] animate-pulse"></div>
        
        {/* Emblem MUST remain completely static to perfectly match the OS Native Splash Screen handoff */}
        <img 
          src="/emblem-transparent.png" 
          alt="Ashoka Lions" 
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain z-10 drop-shadow-2xl mb-8"
        />

        {/* Text and Dots (fades in AFTER the OS handoff so it doesn't glitch) */}
        <div className="flex flex-col items-center animate-fade-in-up z-20" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            SatyaLabel
          </h1>
          <p className="text-[13px] tracking-widest text-white/70 uppercase font-medium mb-6">
            Legal Metrology
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
