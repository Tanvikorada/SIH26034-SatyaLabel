import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

pattern = r'const complianceScore = totalRulesChecked > 0 \? Math\.round\(\(passes\.length \/ \(totalRulesChecked - naResults\.length \|\| 1\)\) \* 100\) : 0;'
new_score = """const notVerifiedCount = mappedResults.filter(r => r.status === S.NV).length;
    const applicableRules = totalRulesChecked - naResults.length - reviewCount - notVerifiedCount;
    const complianceScore = applicableRules > 0 ? Math.round((passes.length / applicableRules) * 100) : 100;"""

engine = re.sub(pattern, new_score, engine)

# Replace the FAIL text
engine = engine.replace("'Name of the manufacturer, packer, or importer is not declared on the label. ' +",
"'Name of the manufacturer, packer, or importer was not detected in the scanned images. It may be on another side of the product. Please verify manually. ' +")
engine = engine.replace("'Complete address of the manufacturer, packer, or importer is absent. ' +",
"'Complete address of the manufacturer was not detected in the scanned images. It may be on another side. Please verify manually. ' +")

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(engine)
print("Updated successfully")
