import re
with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r", attributes: \['id','scanId','ruleId','ruleTitle','status','affectedField','severity','detail','confidence','createdAt'\]", "", content)
with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(content)
