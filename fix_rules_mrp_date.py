with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

idx = engine.find('const inContext = INCL_TAX.test(rawText);')
if idx != -1:
    engine = engine[:idx] + "const inContext = INCL_TAX.test(rawText) || fields.mrp_includes_tax_statement === true || fields.mrp_includes_tax_statement === 'true';" + engine[idx+len('const inContext = INCL_TAX.test(rawText);'):]

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated MRP pattern")
