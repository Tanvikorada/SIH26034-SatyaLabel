import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

# Replace pnoc with review for the missing fields
engine = engine.replace(
    "return pnoc(R, T, f, 'high',\n        'Name of the manufacturer",
    "return review(R, T, f, 'high',\n        'Name of the manufacturer"
)
engine = engine.replace(
    "return pnoc(R, T, f, 'high',\n        'Complete address of the manufacturer",
    "return review(R, T, f, 'high',\n        'Complete address of the manufacturer"
)

# Fix Country
engine = engine.replace("'Country of origin is not declared on this imported product label. ' +",
"'Country of origin was not detected on this imported product. It may be on another side. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'high',\n        'Country of origin was not detected",
"return review(R, T, f, 'high',\n        'Country of origin was not detected")

# Fix generic name
engine = engine.replace("'The common or generic name of the commodity is not declared on the label. ' +",
"'The common or generic name was not detected in the scanned images. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'high',\n        'The common or generic name was not detected",
"return review(R, T, f, 'high',\n        'The common or generic name was not detected")

# Fix net qty
engine = engine.replace("'No net quantity declaration detected on the label. ' +",
"'No net quantity declaration detected in the scanned images. It may be on another side. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'high',\n        'No net quantity declaration detected in the scanned images",
"return review(R, T, f, 'high',\n        'No net quantity declaration detected in the scanned images")

# Fix mfg date
engine = engine.replace("'Month and year of manufacture/packing/import is not declared. ' +",
"'Month and year of manufacture was not detected in the scanned images. It may be on the bottom or another side. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'high',\n        'Month and year of manufacture was not detected",
"return review(R, T, f, 'high',\n        'Month and year of manufacture was not detected")

# Fix MRP
engine = engine.replace("'MRP (Maximum Retail Price inclusive of all taxes) is not declared on the label. ' +",
"'MRP was not detected in the scanned images. It may be on the bottom or another side. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'high',\n        'MRP was not detected",
"return review(R, T, f, 'high',\n        'MRP was not detected")

# Fix customer care
engine = engine.replace("'Consumer care contact details (helpline phone number or email address) are not declared on the label. ' +",
"'Consumer care contact details were not detected in the scanned images. They may be on another side. Please verify manually. ' +")
engine = engine.replace("return pnoc(R, T, f, 'medium',\n        'Consumer care contact details were not detected",
"return review(R, T, f, 'medium',\n        'Consumer care contact details were not detected")


with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated pnoc to review")
