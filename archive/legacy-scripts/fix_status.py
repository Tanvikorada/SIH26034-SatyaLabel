import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

engine = engine.replace('STATUS.PNOC', 'S.PNOC')
engine = engine.replace('STATUS.REVIEW', 'S.REVIEW')
engine = engine.replace('STATUS.PASS', 'S.PASS')
engine = engine.replace('STATUS.NA', 'S.NA')

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
