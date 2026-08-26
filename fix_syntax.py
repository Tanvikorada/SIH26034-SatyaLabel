with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

# I injected:
# const S = {
#   PASS: 'PASS',
#   PNOC: 'POTENTIAL NON-COMPLIANCE',
#   REVIEW: 'MANUAL REVIEW',
#   NA: 'NOT APPLICABLE',
#   NV: 'NOT VERIFIED'
# };

# Since S was already declared at the top, let's remove my declaration.
injected = """const S = {
  PASS: 'PASS',
  PNOC: 'POTENTIAL NON-COMPLIANCE',
  REVIEW: 'MANUAL REVIEW',
  NA: 'NOT APPLICABLE',
  NV: 'NOT VERIFIED'
};"""
text = text.replace(injected, '')

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
