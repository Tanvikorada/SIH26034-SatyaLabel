const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const summaryHtml = `
            {/* AI EXECUTIVE SUMMARY */}
            {fields.ai_summary && (
              <div className="glass rounded-[20px] p-6 border-l-4 border-l-accent mb-8">
                <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-3">AI Executive Summary</h4>
                <p className="text-[14px] text-text-secondary leading-relaxed">{fields.ai_summary}</p>
              </div>
            )}
`;

code = code.replace(
  '<h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>',
  summaryHtml + '\n            <h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>'
);

fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
console.log("UI SUMMARY FIXED");
