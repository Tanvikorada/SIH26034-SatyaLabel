const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// The results page has tables for Extracted Fields.
// Let's add mello-table-mobile-card and data-labels.
code = code.replace(/<table className="w-full text-left border-collapse">/g, '<table className="w-full text-left border-collapse mello-table-mobile-card">');
code = code.replace(/<td className="p-3 border-b border-border/g, '<td data-label="Field" className="p-3 border-b border-border');
// The second td needs the key name, but we can't do that statically easily.
// Let's just do it via regex for the second td.
let count = 0;
code = code.replace(/<td className="p-3 border-b border-border text-\[13px\] text-text-primary">/g, (match) => {
  count++;
  if (count % 2 === 0) {
    return '<td data-label="Extracted Value" className="p-3 border-b border-border text-[13px] text-text-primary">';
  }
  return '<td data-label="Field Name" className="p-3 border-b border-border text-[13px] text-text-primary font-medium">';
});

// Create Floating Action Buttons (FAB) for mobile
code = code.replace(/<div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border\/50">/, `<div className="hidden md:flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">`);
code = code.replace(/<\/div>\n\n\s*\{\/\* TAB NAVIGATION \*\/\}/, `</div>
          
          {/* Mobile FABs */}
          <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col gap-3">
            <button onClick={downloadPDF} className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(11,31,58,0.4)] active-press border-2 border-background">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>

        {/* TAB NAVIGATION */}`);

fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
console.log("RESULTS PAGE MOBILE OVERHAUL");
