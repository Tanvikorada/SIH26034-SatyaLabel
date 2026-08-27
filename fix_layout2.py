import re

with open('frontend/app/layout.jsx', 'r', encoding='utf-8') as f:
    layout = f.read()

if 'apple-touch-icon' not in layout:
    layout = layout.replace('<link rel="manifest" href="/manifest.json" />', '<link rel="manifest" href="/manifest.json" />\n        <link rel="apple-touch-icon" href="/icon.svg" />')
    with open('frontend/app/layout.jsx', 'w', encoding='utf-8') as f:
        f.write(layout)
