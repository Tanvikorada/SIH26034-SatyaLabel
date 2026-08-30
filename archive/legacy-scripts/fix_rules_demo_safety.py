import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

# Replace hard fails for missing mandatory fields with manual reviews (for demo safety/incomplete scans)

# 1. Manufacturer Name
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'Name of the manufacturer, packer, or importer is not declared on the label.""",
"""return review(R, T, f, 'high',
        'Name of the manufacturer, packer, or importer was not detected in the scanned images. It may be on another side of the product. Please verify manually.""")

# 2. Manufacturer Address
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'Complete address of the manufacturer, packer, or importer is absent.""",
"""return review(R, T, f, 'high',
        'Complete address of the manufacturer was not detected in the scanned images. It may be on another side. Please verify manually.""")

# 3. Country of Origin
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'Country of origin is not declared on this imported product label.""",
"""return review(R, T, f, 'high',
        'Country of origin was not detected on this imported product. It may be on another side. Please verify manually.""")

# 4. Product Name
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'The common or generic name of the commodity is not declared on the label.""",
"""return review(R, T, f, 'high',
        'The common or generic name was not detected in the scanned images. Please verify manually.""")

# 5. Net Quantity
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'No net quantity declaration detected on the label.""",
"""return review(R, T, f, 'high',
        'No net quantity declaration detected in the scanned images. It may be on another side. Please verify manually.""")

# 6. Mfg Date (when missing)
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'Month and year of manufacture/packing/import is not declared.""",
"""return review(R, T, f, 'high',
        'Month and year of manufacture was not detected in the scanned images. It may be on the bottom or another side. Please verify manually.""")

# 7. MRP (when missing)
engine = engine.replace("""return pnoc(R, T, f, 'high',
        'MRP (Maximum Retail Price inclusive of all taxes) is not declared on the label.""",
"""return review(R, T, f, 'high',
        'MRP was not detected in the scanned images. It may be on the bottom or another side. Please verify manually.""")

# 8. Consumer Care
engine = engine.replace("""return pnoc(R, T, f, 'medium',
        'Consumer care contact details (helpline phone number or email address) are not declared on the label.""",
"""return review(R, T, f, 'medium',
        'Consumer care contact details were not detected in the scanned images. They may be on another side. Please verify manually.""")

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated Rules Engine to be Demo-Safe")
