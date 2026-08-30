import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    scans = f.read()

old_summary = """function formatScanSummary(scan) {
  return {
    id: scan.id,
    status: scan.status,
    source_type: scan.sourceType,
    overall_compliance: scan.overallCompliance,
    compliance_score: scan.complianceScore,
    total_violations: scan.totalViolations,
    high_violations: scan.highViolations,
    product_name: scan.product?.productName || null,
    brand_name: scan.product?.brandName || null,"""

new_summary = """function formatScanSummary(scan) {
  return {
    id: scan.id,
    status: scan.status,
    source_type: scan.sourceType,
    overall_compliance: scan.overallCompliance,
    compliance_score: scan.complianceScore,
    total_violations: scan.totalViolations,
    high_violations: scan.highViolations,
    product_name: scan.product?.productName || (scan.extractedData ? scan.extractedData.product_name : null) || null,
    brand_name: scan.product?.brandName || null,"""

scans = scans.replace(old_summary, new_summary)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(scans)
print("Updated formatScanSummary")
