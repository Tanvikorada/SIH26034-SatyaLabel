"use client";
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function ClientThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = resolvedTheme === 'dark' ? '#000000' : '#1E3A8A';
    
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleMeta);
    }
    appleMeta.content = resolvedTheme === 'dark' ? 'black-translucent' : 'default';

    

    document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#1E3A8A';
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
    
    // Enable iOS Safari :active pseudo-class tactile feedback
    if (typeof window !== 'undefined') {
      document.body.ontouchstart = () => {};
    }

  }, [resolvedTheme]);

  return null;
}
