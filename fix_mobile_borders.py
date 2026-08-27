with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix borders for PixelsToPenalty frames
content = content.replace('className="border-r border-[var(--color-border)]', 'className="border-b md:border-b-0 md:border-r border-[var(--color-border)]')
# There is a last frame which doesn't have border-r, but might need border-b if I'm not careful. Actually let's just use grid gap instead, or leave it. The replace above will fix the first 3 frames.

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
