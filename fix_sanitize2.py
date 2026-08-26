import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_sanitize = """function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\u2248/g, '~')       // approx
    .replace(/\\u20B9/g, 'Rs.')     // rupee
    .replace(/[\\u201C\\u201D]/g, '"') // smart quotes
    .replace(/[\\u2018\\u2019]/g, "'") // smart quotes
    .replace(/\\u2014/g, '-')       // em dash
    .replace(/[^\\x20-\\x7E\\xA0-\\xFF]/g, ''); // Keep standard printable ASCII & Latin-1
}"""

match = re.search(r"function sanitize\(str\) \{[\s\S]*?\}", text)
if match:
    text = text[:match.start()] + new_sanitize + text[match.end():]
    with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success")
