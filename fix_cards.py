with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the card styles
old_card_1 = 'p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)] rounded-2xl'
new_card_1 = 'p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors bg-[var(--color-surface)] rounded-xl'

old_card_2 = 'p-12 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)] rounded-2xl'
new_card_2 = 'p-12 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors bg-[var(--color-surface)] rounded-xl'

content = content.replace(old_card_1, new_card_1)
content = content.replace(old_card_2, new_card_2)

# Fix the TechStack icons so they are surface, not transparent, otherwise they look bad
content = content.replace('bg-transparent border border-[var(--color-border)] rounded-2xl flex items-center justify-center shadow-lg', 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center')
content = content.replace('bg-transparent px-2 py-0.5 rounded border border-[var(--color-border)]', 'bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)]')

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
