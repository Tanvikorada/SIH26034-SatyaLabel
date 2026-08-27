import re

with open('backend/routes/dashboard.js', 'r', encoding='utf-8') as f:
    dashboard = f.read()

old_recent = """      recent_scans:         recentScans.map(s => ({
        id:                 s.id,
        product_name:       s.product?.productName || 'Unknown',
        brand_name:         s.product?.brandName || null,"""

new_recent = """      recent_scans:         recentScans.map(s => ({
        id:                 s.id,
        product_name:       s.product?.productName || (s.extractedData ? s.extractedData.product_name : null) || 'Unknown',
        brand_name:         s.product?.brandName || null,"""

dashboard = dashboard.replace(old_recent, new_recent)

with open('backend/routes/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(dashboard)
print("Updated dashboard summary")
