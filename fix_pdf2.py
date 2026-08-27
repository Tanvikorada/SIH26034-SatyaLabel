import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace("pdf.save(`Notice_.pdf`);", "pdf.save(`Notice_${report.id}.pdf`);")

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
