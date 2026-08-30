import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = '''  const extractedObj = scan.extractedFields || {};
  const fields = Array.isArray(extractedObj) 
    ? extractedObj 
    : Object.keys(extractedObj).filter(k => !k.startsWith('_')).map(k => ({
        fieldName: k,
        fieldValue: extractedObj[k],
        isPresent: !!extractedObj[k]
      }));

  let rowBg = false;

  for (const field of fields) {
    if (!fieldLabels[field.fieldName]) continue;
    if (y < 80) break; // Overflow protection

    if (rowBg) drawRect(page1, margin, y - 3, contentW, 14, COLORS.lightGray);
    rowBg = !rowBg;

    const statusText = field.isPresent ? ' Found' : ' Missing';
    const statusColor = field.isPresent ? COLORS.green : COLORS.red;

    page1.drawText(fieldLabels[field.fieldName], {
      x: margin + 5, y,
      size: 7.5, font: helveticaBold, color: COLORS.textDark,
    });
    
    // Ensure string
    const valText = typeof field.fieldValue === 'object' ? JSON.stringify(field.fieldValue) : String(field.fieldValue || '');
    page1.drawText(truncate(valText, 45), {
      x: margin + 150, y,
      size: 7.5, font: helvetica, color: COLORS.textDark,
    });
    page1.drawText(statusText, {
      x: margin + 420, y,
      size: 7.5, font: helveticaBold, color: statusColor,
    });
    if (field.isEstimated) {
      page1.drawText('[Estimated]', {
        x: margin + 470, y,
        size: 6, font: helvetica, color: COLORS.orange
      });
    }

    y -= 15;
  }'''

# find the whole block starting with `const fields = scan.extractedFields || [];`
# down to the closing brace of `for (const field of fields) { ... }`
# by looking for `y -= 15;\n  }`

pattern = r"  const fields = scan\.extractedFields \|\| \[\];[\s\S]*?y -= 15;\n  \}"
if re.search(pattern, text):
    new_text = re.sub(pattern, replacement, text)
    with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Success")
else:
    print("Not found")
