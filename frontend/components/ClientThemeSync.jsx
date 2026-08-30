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

    // In Light Mode, we want Navy Blue for the top bar (but Android might use it for the bottom nav too).
    // Actually, setting it to the surface color (#ffffff) makes the bottom nav blend perfectly, but makes the top status bar white.
    // If the top NavBar is Navy Blue, we want the top status bar to be Navy Blue (#1E3A8A).
    // Unfortunately, Android Chrome uses a single theme-color for both top and bottom!
    // But wait! If we set it to #1E3A8A, the bottom nav will have a blue bar below it! That's better than black, but still not white.
    // Wait... what if we just make the BottomNav Navy Blue as well? No, that's ugly.
    
    // Modern Android Chrome actually respects the background-color of the body for the bottom nav bar, and theme-color for the top bar.
    // Let's set the body background explicitly on the document object just in case.
    document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#000000' : '#ffffff';

    metaThemeColor.content = resolvedTheme === 'dark' ? '#000000' : '#1E3A8A';
    
    // Update Apple Status Bar
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleMeta);
    }
    appleMeta.content = resolvedTheme === 'dark' ? 'black-translucent' : 'default';

  }, [resolvedTheme]);

  return null;
}
