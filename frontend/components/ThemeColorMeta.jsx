'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeColorMeta() {
  const pathname = usePathname();

  useEffect(() => {
    // If on login/landing page, make the status bar match the dark background.
    // Otherwise, match the blue NavBar.
    const isAuthPage = pathname === '/login' || pathname === '/';
    const color = isAuthPage ? '#090a0f' : '#1E3A8A';
    
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [pathname]);
  
  return null;
}
