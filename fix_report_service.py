import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'''  const fields = scan.extractedFields || \[\];
  let rowBg = false;

  for \(const field of fields\) \{
    if \(!fieldLabels\[field.fieldName\]\) continue;
    if \(y < 80\) break; // Overflow protection

    if \(rowBg\) drawRect\(page1, margin, y - 3, contentW, 14, COLORS.lightGray\);
    rowBg = !rowBg;

    page1.drawText\(fieldLabels\[field.fieldName\], \{ x: margin \+ 5, y, size: 10, font: helvetica, color: COLORS.textDark \}\);
    
    // Some fields might be objects if from newer schema, ensure string
    const valText = typeof field.extractedValue === 'object' \? JSON.stringify\(field.extractedValue\) : String\(field.extractedValue || 'Not found'\);
    page1.drawText\(valText, \{ x: margin \+ 200, y, size: 10, font: helveticaBold, color: COLORS.textDark \}\);

    y -= 20;
  \}'''

replacement = '''  const extractedObj = scan.extractedFields || {};
  // Convert object { mrp: '50', ... } to array [{ fieldName: 'mrp', extractedValue: '50' }, ...]
  // Handle both legacy array format and new object format just in case
  const fields = Array.isArray(extractedObj) 
    ? extractedObj 
    : Object.keys(extractedObj).filter(k => !k.startsWith('_')).map(k => ({
        fieldName: k,
        extractedValue: extractedObj[k]
      }));

  let rowBg = false;

  for (const field of fields) {
    if (!fieldLabels[field.fieldName]) continue;
    if (y < 80) break; // Overflow protection

    if (rowBg) drawRect(page1, margin, y - 3, contentW, 14, COLORS.lightGray);
    rowBg = !rowBg;

    page1.drawText(fieldLabels[field.fieldName], { x: margin + 5, y, size: 10, font: helvetica, color: COLORS.textDark });
    
    // Some fields might be objects if from newer schema, ensure string
    const valText = typeof field.extractedValue === 'object' ? JSON.stringify(field.extractedValue) : String(field.extractedValue || 'Not found');
    page1.drawText(valText, { x: margin + 200, y, size: 10, font: helveticaBold, color: COLORS.textDark });

    y -= 20;
  }'''

if pattern in text:
    print("Found! Replacing...")
else:
    print("Exact string not found, falling back to regex")
    match = re.search(r"  const fields = scan\.extractedFields \|\| \[\];[\s\S]*?y -= 20;\n  \}", text)
    if match:
        text = text[:match.start()] + replacement + text[match.end():]

with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
    f.write(text)
