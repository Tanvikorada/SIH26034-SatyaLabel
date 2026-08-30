import re

with open('backend/services/extraction_service.js', 'r', encoding='utf-8') as f:
    ext = f.read()

ext = ext.replace("veg_nonveg: 'veg_nonveg',", "veg_nonveg: 'veg_nonveg',\n    nutrition: 'nutrition',\n    allergens_or_warnings: 'allergens_or_warnings',")

with open('backend/services/extraction_service.js', 'w', encoding='utf-8') as f:
    f.write(ext)
print("Updated GEMINI_KEY_MAP")
