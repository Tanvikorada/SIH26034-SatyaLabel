import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# I will rename the sections to match the user's request:
# Section 1: "Violations & Action Required (Rules Not Followed)"
# Section 2: "Full Legal Metrology 2011 Checklist" (which maps all checks)

old_render = """const actionRequired = checks.filter(c => c.status === 'POTENTIAL NON-COMPLIANCE' || c.status === 'fail' || c.status === 'estimated_fail' || c.status === 'MANUAL REVIEW' || c.status === 'needs_review' || c.status === 'NOT VERIFIED');
                    const compliant = checks.filter(c => c.status === 'PASS' || c.status === 'pass' || c.status === 'NOT APPLICABLE');"""

new_render = """const actionRequired = checks.filter(c => c.status === 'POTENTIAL NON-COMPLIANCE' || c.status === 'fail' || c.status === 'estimated_fail' || c.status === 'MANUAL REVIEW' || c.status === 'needs_review' || c.status === 'NOT VERIFIED');
                    const allRules = checks; // User requested to see ALL rules in the second section to check if any were forgotten"""

page = page.replace(old_render, new_render)

old_sec1 = """<span className="w-1 h-1 rounded-full bg-red-500"></span> Action Required ({actionRequired.length})"""
new_sec1 = """<span className="w-1 h-1 rounded-full bg-red-500"></span> Rules Not Followed & Action Required ({actionRequired.length})"""
page = page.replace(old_sec1, new_sec1)

old_sec2_cond = """{compliant.length > 0 && ("""
new_sec2_cond = """{allRules.length > 0 && ("""
page = page.replace(old_sec2_cond, new_sec2_cond)

old_sec2 = """<span className="w-1 h-1 rounded-full bg-green-500"></span> Compliant ({compliant.length})"""
new_sec2 = """<span className="w-1 h-1 rounded-full bg-blue-500"></span> Full Legal Metrology 2011 Checklist ({allRules.length})"""
page = page.replace(old_sec2, new_sec2)

old_sec2_map = """{compliant.map(renderRule)}"""
new_sec2_map = """{allRules.map(renderRule)}"""
page = page.replace(old_sec2_map, new_sec2_map)

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated results rules rendering")
