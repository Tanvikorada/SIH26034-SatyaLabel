with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const RULE_VERSION = 'v2.1-llm';", "")
text = text.replace("const RULE_VERSION = 'v2.0-blueprint';", "const RULE_VERSION = 'v3.0-gemini-ai';")

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
