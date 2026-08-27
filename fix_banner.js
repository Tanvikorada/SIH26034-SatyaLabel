const fs = require('fs');
let js = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const target = `<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">`;
const replacement = `
        {report.extracted_fields?._quality_warning && (
          <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-4 animate-fade-in">
             <div className="text-amber-500 text-2xl">⚠️</div>
             <div>
               <h3 className="text-amber-400 font-semibold mb-1">Image Quality / Obstruction Warning</h3>
               <p className="text-amber-200/80 text-sm">{report.extracted_fields._quality_warning}</p>
               <p className="text-amber-200/60 text-xs mt-2">The AI strictly refused to extract fields in the affected areas to prevent hallucinating incorrect legal values.</p>
             </div>
          </div>
        )}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">`;

if(js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', js);
  console.log("Banner injected");
} else {
  console.log("Not found");
}
