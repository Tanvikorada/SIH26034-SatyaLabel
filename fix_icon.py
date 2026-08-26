import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('SiOpenai', 'SiOpenai as Dummy') # This won't work if it's missing, just remove it
text = re.sub(r'SiOpenai\b', '', text)
text = text.replace('SiOpenai,', '')
text = text.replace(', SiOpenai', '')
text = text.replace('<SiOpenai', '<Cpu') # Fallback to Cpu icon from lucide-react which is already imported!

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
