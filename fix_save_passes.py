import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    routes = f.read()

find_str = "const { violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);"
replace_str = "const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);"
routes = routes.replace(find_str, replace_str)

find_str2 = "const violationsToSave = violations.filter(v => v.status !== 'PASS' && v.status !== 'pass');"
replace_str2 = "const violationsToSave = results || violations;"
routes = routes.replace(find_str2, replace_str2)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(routes)
