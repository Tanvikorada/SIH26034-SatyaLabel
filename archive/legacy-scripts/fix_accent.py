with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Change --color-accent in .dark from orange to white/zinc
content = content.replace('--color-accent:           #f97316; /* saffron/orange */', '--color-accent:           #ffffff; /* white */')
content = content.replace('--color-accent-soft:      rgba(249,115,22,0.12);', '--color-accent-soft:      rgba(255,255,255,0.08);')

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(content)
