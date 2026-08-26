with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(' as Dummy', '')

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
