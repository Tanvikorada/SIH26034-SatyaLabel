import re

with open('frontend/app/history/page.jsx', 'r', encoding='utf-8') as f:
    history = f.read()

history = history.replace("{s.product?.product_name || s.id}", "{s.product?.product_name || 'Unknown Product'}")

with open('frontend/app/history/page.jsx', 'w', encoding='utf-8') as f:
    f.write(history)
print("Fixed history page")
