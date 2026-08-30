with open("frontend/components/ThemeColorMeta.jsx", "w", encoding="utf-8") as f:
    f.write("""'use client';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === 'dark' ? '#090a0f' : '#ffffff';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [resolvedTheme]);
  
  return null;
}
""")

with open("frontend/app/layout.jsx", "r", encoding="utf-8") as f:
    layout = f.read()

# Remove the static viewport export
layout = layout.replace("export const viewport = {\n  themeColor: [\n    { media: '(prefers-color-scheme: light)', color: '#ffffff' },\n    { media: '(prefers-color-scheme: dark)', color: '#090a0f' }\n  ],\n  width: 'device-width',\n  initialScale: 1,\n  maximumScale: 1\n}", "export const viewport = {\n  width: 'device-width',\n  initialScale: 1,\n  maximumScale: 1\n}")

# Import and inject ThemeColorMeta
if "ThemeColorMeta" not in layout:
    layout = layout.replace("import { ThemeProvider } from 'next-themes'", "import { ThemeProvider } from 'next-themes'\nimport ThemeColorMeta from '../components/ThemeColorMeta'")
    layout = layout.replace("<ThemeProvider", "<ThemeColorMeta />\n        <ThemeProvider")

with open("frontend/app/layout.jsx", "w", encoding="utf-8") as f:
    f.write(layout)
print("ThemeColorMeta injected")
