import re

# 1. Remove from globals.css
with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()
css = css.replace("padding-top: env(safe-area-inset-top);", "")
with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Add to NavBar.jsx
with open('frontend/components/NavBar.jsx', 'r', encoding='utf-8') as f:
    nav = f.read()

# I will inject the style object into the <nav> element
nav = nav.replace('<nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? \'bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm\' : \'bg-background/80 backdrop-blur-md\'}`}>', 
                  '<nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? \'bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm\' : \'bg-background/80 backdrop-blur-md\'}`} style={{ paddingTop: \'env(safe-area-inset-top)\' }}>')

with open('frontend/components/NavBar.jsx', 'w', encoding='utf-8') as f:
    f.write(nav)
print("Updated PWA safe area insets")
