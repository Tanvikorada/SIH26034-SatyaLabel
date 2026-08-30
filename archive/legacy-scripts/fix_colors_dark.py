import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Find the .dark section and replace colors
dark_section = re.search(r'\.dark\s*\{[^}]+\}', css).group(0)
new_dark_section = re.sub(r'--color-background:\s*#[0-9a-fA-F]+[^\n]*', '--color-background: #000000; /* pure black */', dark_section)
new_dark_section = re.sub(r'--color-surface:\s*#[0-9a-fA-F]+[^\n]*', '--color-surface: #0a0a0a; /* dark grey surface */', new_dark_section)
css = css.replace(dark_section, new_dark_section)

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated dark mode to pure black")
