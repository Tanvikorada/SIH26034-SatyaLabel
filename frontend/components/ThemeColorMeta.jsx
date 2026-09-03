'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeColorMeta() {
  const pathname = usePathname();

  useEffect(() => {
    // Dynamically match the actual app background color so the Android system nav bar blends in seamlessly.
    // Instead of hardcoding black or blue, we read the active background color from the computed styles.
    const updateColor = () => {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim() || '#ffffff';
      
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', bgColor);
    };

    updateColor();
    
    // Also update on theme toggle
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [pathname]);
  
  return null;
}
