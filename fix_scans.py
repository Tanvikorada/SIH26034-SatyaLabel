import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    scans = f.read()

# Fix the product creation fallback
old_line = "const productName = fieldsMap.product_name || scan.productNameHint || null;"
new_line = "const productName = fieldsMap.product_name || scan.productNameHint || 'Unknown Product';"

scans = scans.replace(old_line, new_line)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(scans)
print("Updated productName fallback")
