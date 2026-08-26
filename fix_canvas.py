import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'(const w = canvas.width = canvas.offsetWidth;\s*const h = canvas.height = canvas.offsetHeight;\s*)(const imageData = ctx.createImageData\(w, h\);)'

replacement = r"""\1if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }
        \2"""

new_text = re.sub(pattern, replacement, text)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(new_text)
