import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Add sanitize function before truncate
sanitize_func = '''/**
 * Sanitize text for WinAnsi encoding (StandardFonts.Helvetica)
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/≈/g, '~')
    .replace(/₹/g, 'Rs.')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); // Keep standard printable ASCII & Latin-1
}

/**
 * Truncate text to max length with ellipsis
 */
function truncate(str, max = 80) {
  const s = sanitize(String(str || ''));
  return s.length > max ? s.slice(0, max - 3) + '...' : s;
}'''

# Replace truncate function with the new blocks
text = re.sub(r'/\*\*[\s\S]*?function truncate\(str, max = 80\) \{[\s\S]*?\}', sanitize_func, text)

# Now find all instances of page.drawText(  or page1.drawText(  and apply sanitize to the first argument if it's a dynamic variable
# Actually, since pdf-lib fails on *any* non-WinAnsi character, let's just intercept the pdfDoc creation or manually replace all drawText calls?
# Instead of intercepting drawText, let's just replace all `page.drawText(` with `page.drawText(sanitize(` and fix the parens? No, drawText takes (text, options).
# We can just override drawText on the page object inside generateReport!

override_code = '''  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Override drawText to automatically sanitize all strings for WinAnsi
  const overrideDrawText = (page) => {
    const originalDrawText = page.drawText.bind(page);
    page.drawText = (text, options) => {
      originalDrawText(sanitize(String(text)), options);
    };
    return page;
  };'''

text = text.replace('  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);', override_code)

# Then override page1
text = text.replace('  const page1 = pdfDoc.addPage([pageW, pageH]);', '  const page1 = overrideDrawText(pdfDoc.addPage([pageW, pageH]));')

# And override any page added in addViolationsPage
text = text.replace('    const page = pdfDoc.addPage([pageW, pageH]);', '    const page = overrideDrawText(pdfDoc.addPage([pageW, pageH]));')

with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
