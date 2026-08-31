'use client';
import { useEffect } from 'react';

export default function ThemeColorMeta() {
  useEffect(() => {
    const color = '#1E3A8A';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, []);
  
  return null;
}
