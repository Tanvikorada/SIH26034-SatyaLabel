content = open('backend/routes/scans.js', 'r', encoding='utf-8').read()
content = content.replace("rule_version: 'LM-PC-2011-v1.0',", "")
open('backend/routes/scans.js', 'w', encoding='utf-8').write(content)

eng = open('backend/services/rules_engine.js', 'r', encoding='utf-8').read()
eng = eng.replace("rule_version: RULE_VERSION.version_id,", "")
open('backend/services/rules_engine.js', 'w', encoding='utf-8').write(eng)
