import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    content = f.read()

old_cards = '''  .mello-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .mello-card-flat {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }'''

new_cards = '''  .mello-card {
    background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .mello-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 50px rgba(0,0,0,0.12);
    border-color: var(--color-text-muted);
  }
  .mello-card:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }

  .mello-card-flat {
    background-color: color-mix(in srgb, var(--color-surface) 60%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    transition: all 0.2s ease-out;
  }
  .mello-card-flat:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    border-color: var(--color-text-muted);
  }
  .mello-card-flat:active {
    transform: translateY(0) scale(0.98);
    box-shadow: none;
  }'''

content = content.replace(old_cards, new_cards)

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(content)
