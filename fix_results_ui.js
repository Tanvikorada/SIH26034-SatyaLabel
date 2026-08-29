const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/app/results/*/page.jsx');
const file = files[0];
let js = fs.readFileSync(file, 'utf8');

// 1. Add CSV Export button next to PDF button
const buttonTarget = `<button onClick={downloadPDF} className="mello-btn-primary flex-1 shadow-lg">Download Official Notice PDF</button>`;
const buttonReplace = `<button onClick={downloadPDF} className="mello-btn-primary flex-1 shadow-lg">Download Official Notice PDF</button>
          <button onClick={() => {
            const fields = report.extractedFields || report.extracted_fields || {};
            const csvRows = ['Field,Value'];
            for (const [k, v] of Object.entries(fields)) {
              if (!k.startsWith('_')) {
                csvRows.push(\`"\${k}","\${String(v).replace(/"/g, '""')}"\`);
              }
            }
            const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`scan_export_\${report.id}.csv\`;
            a.click();
          }} className="mello-btn-secondary flex-1">Export Data (CSV)</button>`;

js = js.replace(buttonTarget, buttonReplace);

// 2. Inject original image into the UI (top of the page)
const imageTarget = `<div className="flex items-start justify-between mb-8">`;
const imageReplace = `<div className="mb-8">
            <h3 className="text-xl font-medium tracking-tight mb-4">Photographic Evidence</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {(() => {
                let images = [];
                try {
                  const imgStr = report.original_image || report.image_url;
                  images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                } catch (e) {
                  images = [report.original_image || report.image_url].filter(Boolean);
                }
                if (images.length === 0) return <div className="text-text-muted">No evidence attached.</div>;
                return images.map((img, idx) => (
                  <img key={idx} src={img.startsWith('http') ? img : (process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1').replace('/api/v1', '') + '/' + img} alt="Evidence" className="h-48 rounded-xl object-contain bg-black/20 border border-border" />
                ));
              })()}
            </div>
          </div>
          <div className="flex items-start justify-between mb-8">`;

js = js.replace(imageTarget, imageReplace);

fs.writeFileSync(file, js);
console.log("Added CSV and Images to Results!");
