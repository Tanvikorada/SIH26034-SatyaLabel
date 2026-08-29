const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const regex = /const downloadPDF = \(\) => \{\s*toast\.info\('Opening Print Dialog\. Save as PDF\.'\);\s*setTimeout\(\(\) => window\.print\(\), 500\);\s*\};/g;

const pdfReplace = `const downloadPDF = async () => {
    toast.info('Generating Official Government Report...');
    try {
      const res = await fetch(\`\${API}/scans/\${resolvedParams.id}/report\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const json = await res.json();
      
      const fileUrl = json.data.file_url;
      const dlRes = await fetch(\`\${API.replace('/api/v1', '')}\${fileUrl}?t=\${Date.now()}\`, {
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

if(fe.match(regex)) {
  fe = fe.replace(regex, pdfReplace);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("PDF FRONTEND FIXED");
} else {
  console.log("REGEX FAILED");
}
