const fs = require('fs');
let js = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// 1. Add id to container
js = js.replace(
  `<div className="max-w-[1200px] mx-auto px-6 py-12">`,
  `<div id="pdf-content" className="max-w-[1200px] mx-auto px-6 py-12">`
);

// 2. Replace downloadPDF
const oldFn = `  const downloadPDF = () => {
    toast.info('Opening Print Dialog. Save as PDF.');
    setTimeout(() => window.print(), 500);
  };`;

const newFn = `  const downloadPDF = async () => {
    toast.loading('Generating Official Notice PDF...', { id: 'pdf' });
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-content');
      
      const opt = {
        margin:       10,
        filename:     \`Legal_Notice_\${report.id.substring(0,8)}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#09090b' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF Downloaded', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };`;

js = js.replace(oldFn, newFn);
fs.writeFileSync('frontend/app/results/[id]/page.jsx', js);
console.log("PDF generation added");
