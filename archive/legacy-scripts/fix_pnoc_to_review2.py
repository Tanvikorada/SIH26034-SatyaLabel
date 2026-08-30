import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

# Replace all pnoc for absent fields with review
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'Name of the manufacturer",
    r"return review(R, T, f, 'high',\n        'Name of the manufacturer",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'Complete address of the manufacturer",
    r"return review(R, T, f, 'high',\n        'Complete address of the manufacturer",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'Country of origin was not detected",
    r"return review(R, T, f, 'high',\n        'Country of origin was not detected",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'The common or generic name was not detected",
    r"return review(R, T, f, 'high',\n        'The common or generic name was not detected",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'No net quantity declaration detected in the scanned images",
    r"return review(R, T, f, 'high',\n        'No net quantity declaration detected in the scanned images",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'Month and year of manufacture was not detected",
    r"return review(R, T, f, 'high',\n        'Month and year of manufacture was not detected",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'high',\s*'MRP was not detected",
    r"return review(R, T, f, 'high',\n        'MRP was not detected",
    engine
)
engine = re.sub(
    r"return pnoc\(R, T, f, 'medium',\s*'Consumer care contact details were not detected",
    r"return review(R, T, f, 'medium',\n        'Consumer care contact details were not detected",
    engine
)

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated pnoc to review with regex")
