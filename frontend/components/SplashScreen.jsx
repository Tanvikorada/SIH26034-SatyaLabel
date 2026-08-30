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
      className={`fixed inset-0 z-[9999] bg-[#1E3A8A] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Glowing aura behind emblem */}
        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
        
        <img 
          src="/emblem-transparent.png" 
          alt="Ashoka Lions" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain z-10 drop-shadow-2xl animate-fade-in-up"
        />
        
        <div className="mt-8 flex flex-col items-center z-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <span className="text-[12px] font-mono tracking-[0.3em] text-white/60 uppercase mb-2">Dept. of Consumer Affairs</span>
          <h1 className="text-3xl font-bold tracking-tight text-white">SatyaLabel</h1>
          <div className="mt-6 flex gap-2">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
