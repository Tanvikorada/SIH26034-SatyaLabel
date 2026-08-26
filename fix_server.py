with open('backend/server.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the block I injected
import re
text = re.sub(r'const \{ GoogleGenerativeAI.*?\n}\n', '', text, flags=re.DOTALL)

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
