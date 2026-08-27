import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

old_score = """    const complianceScore = totalRulesChecked > 0 ? Math.round((passes.length / (totalRulesChecked - naResults.length || 1)) * 100) : 0;"""

new_score = """    const notVerifiedCount = mappedResults.filter(r => r.status === S.NV).length;
    const applicableRules = totalRulesChecked - naResults.length - reviewCount - notVerifiedCount;
    const complianceScore = applicableRules > 0 ? Math.round((passes.length / applicableRules) * 100) : 100;"""

engine = engine.replace(old_score, new_score)

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated compliance score calculation to exclude Manual Review / Not Verified from the denominator")
