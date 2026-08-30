import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Light Mode
css = re.sub(r'--color-background:\s*#[a-fA-F0-9]+;', '--color-background: #ffffff;', css, count=1)
css = re.sub(r'--color-surface:\s*#[a-fA-F0-9]+;', '--color-surface: #fcfcfc;', css, count=1)
css = re.sub(r'--color-border:\s*(rgba?\([^)]+\)|#[a-fA-F0-9]+);', '--color-border: #eaeaea;', css, count=1)

# Dark Mode
dark_bg = r'--color-background:\s*#[a-fA-F0-9]+;'
css = re.sub(dark_bg, '--color-background: #000000;', css)
dark_surf = r'--color-surface:\s*rgba\([^)]+\);'
css = re.sub(dark_surf, '--color-surface: #0a0a0a;', css)
dark_border = r'--color-border:\s*rgba\([^)]+\);'
css = re.sub(dark_border, '--color-border: #1a1a1a;', css)

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated to pure black/white")
