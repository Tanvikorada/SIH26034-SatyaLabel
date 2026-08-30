import re

with open('frontend/app/history/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace("onClick={() => router.push(/results/)}", "onClick={() => router.push(`/results/${s.id}`)}")

with open('frontend/app/history/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
