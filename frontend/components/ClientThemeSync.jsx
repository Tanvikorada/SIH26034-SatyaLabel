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

    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover';

    document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#ffffff';

  }, [resolvedTheme]);

  return null;
}
