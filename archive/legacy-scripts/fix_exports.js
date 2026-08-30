const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// Replace the PDF function
const pdfTarget = `  const downloadPDF = () => {
    toast.info('Opening Print Dialog. Save as PDF.');
    setTimeout(() => window.print(), 500);
  };`;

const pdfReplace = `  const downloadPDF = async () => {
    toast.info('Generating Official Government Report...');
    try {
      const res = await fetch(\`\${API}/scans/\${resolvedParams.id}/report\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const json = await res.json();
      
      const fileUrl = json.data.file_url;
      const dlRes = await fetch(\`\${API.replace('/api/v1', '')}\${fileUrl}\`, {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      const blob = await dlRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Legal_Metrology_Notice_\${resolvedParams.id}.pdf\`;
      a.click();
      toast.success('PDF Downloaded Successfully');
    } catch (e) {
      console.error(e);
      toast.error('Could not generate PDF');
    }
  };`;
fe = fe.replace(pdfTarget, pdfReplace);

// Replace the CSV button code
// I need to use regex to find the button because it is inline
const csvTargetRegex = /<button onClick=\{\(\) => \{[\s\S]*?\} className="mello-btn-secondary flex-1">Export Data \(CSV\)<\/button>/g;
const csvReplace = `<button onClick={() => {
            const fields = report.extractedFields || report.extracted_fields || {};
            const violations = report.violations || [];
            const csvRows = [];
            csvRows.push("LEGAL METROLOGY COMPLIANCE REPORT");
            csvRows.push(\`Scan ID,\${report.id}\`);
            csvRows.push(\`Date,\${new Date(report.created_at).toLocaleString()}\`);
            csvRows.push(\`Overall Status,\${report.overall_compliance || report.overallCompliance}\`);
            csvRows.push(\`Compliance Score,\${report.compliance_score || report.complianceScore}%\`);
            csvRows.push("");
            
            csvRows.push("--- EXTRACTED DATA ---");
            csvRows.push("Field Name,Extracted Value");
            const niceNames = {
              product_name: "Product Name", brand_name: "Brand", manufacturer_name: "Manufacturer",
              net_quantity: "Net Quantity", mrp: "MRP (Max Retail Price)", mfg_date: "Mfg Date",
              ingredients: "Ingredients", fssai_license: "FSSAI License"
            };
            for (const [k, v] of Object.entries(fields)) {
              if (!k.startsWith('_') && v) {
                const label = niceNames[k] || k.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                csvRows.push(\`"\${label}","\${String(v).replace(/"/g, '""')}"\`);
              }
            }
            
            csvRows.push("");
            csvRows.push("--- RULE VIOLATIONS ---");
            csvRows.push("Rule ID,Status,Severity,Details");
            for (const v of violations) {
              if(v.status !== 'PASS' && v.status !== 'NOT APPLICABLE') {
                csvRows.push(\`"\${v.rule_id}","\${v.status}","\${v.severity || 'high'}","\${String(v.detail_text || v.detail || '').replace(/"/g, '""')}"\`);
              }
            }
            
            const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`compliance_report_\${report.id}.csv\`;
            a.click();
          }} className="mello-btn-secondary flex-1">Export Data (CSV)</button>`;

fe = fe.replace(csvTargetRegex, csvReplace);

fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
console.log("PDF AND CSV FIXED");
