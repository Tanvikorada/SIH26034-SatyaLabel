import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the botched sanitize function
new_sanitize = '''function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\u2248/g, '~')       // ≈
    .replace(/\\u20B9/g, 'Rs.')     // ₹
    .replace(/[\\u201C\\u201D]/g, '"') // “”
    .replace(/[\\u2018\\u2019]/g, "'") // ‘’
    .replace(/\\u2014/g, '-')       // —
    .replace(/[^\\x20-\\x7E\\xA0-\\xFF]/g, ''); // Keep standard printable ASCII & Latin-1
}'''

text = re.sub(r'function sanitize\(str\) \{[\s\S]*?\}', new_sanitize, text, count=1)

with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
