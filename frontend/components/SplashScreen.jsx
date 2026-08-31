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

    // Start fade out after 500ms
    const timer1 = setTimeout(() => {
      setFade(true);
    }, 500);

    // Remove from DOM after fade finishes
    const timer2 = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('splash_shown', 'true');
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#1E3A8A] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center justify-center">
        <img 
          src="/icon-with-text.png" 
          alt="SatyaLabel Logo" 
          className="w-48 h-auto object-contain z-10"
        />
      </div>
    </div>
  );
}
