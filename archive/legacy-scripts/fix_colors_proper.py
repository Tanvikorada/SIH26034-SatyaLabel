import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# I will split the CSS by .dark { and replace inside.
parts = css.split('.dark {')
light_part = parts[0]
dark_part = parts[1]

light_part = re.sub(r'--color-background:\s*#[a-fA-F0-9]+;', '--color-background: #ffffff;', light_part)
light_part = re.sub(r'--color-surface:\s*#[a-fA-F0-9]+;', '--color-surface: #ffffff;', light_part)
light_part = re.sub(r'--color-border:\s*rgba\([^)]+\);', '--color-border: #f0f0f0;', light_part)

dark_part = re.sub(r'--color-background:\s*#[a-fA-F0-9]+;', '--color-background: #000000;', dark_part)
dark_part = re.sub(r'--color-surface:\s*rgba\([^)]+\);', '--color-surface: #0a0a0a;', dark_part)
dark_part = re.sub(r'--color-border:\s*rgba\([^)]+\);', '--color-border: #1a1a1a;', dark_part)

css = light_part + '.dark {' + dark_part

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated colors properly")
