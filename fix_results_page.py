import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace("fetch(${API}/scans//cancel, {", "fetch(`${API}/scans/${resolvedParams.id}/cancel`, {")
page = page.replace("headers: { 'Authorization': Bearer  }", "headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }")

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
