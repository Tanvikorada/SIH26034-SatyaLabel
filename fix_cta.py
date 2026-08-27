with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('        /* FINAL CTA */}', '        {/* FINAL CTA */}')
content = content.replace('      /* FINAL CTA */}', '      {/* FINAL CTA */}')

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
