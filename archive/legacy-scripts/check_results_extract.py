with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

idx = page.find('Extracted Data</h3>')
if idx != -1:
    print(page[idx-100:idx+2500])
else:
    print("Not found")
