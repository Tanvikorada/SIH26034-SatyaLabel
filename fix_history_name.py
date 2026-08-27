import re

with open('frontend/app/history/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace("{s.product?.product_name || 'Unknown Product'}", "{s.product_name || s.product?.product_name || 'Unknown Product'}")

with open('frontend/app/history/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated history page mapping")
