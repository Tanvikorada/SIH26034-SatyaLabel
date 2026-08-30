const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// Update section headers to strict typography
code = code.replace(/text-\[12px\] font-bold tracking-widest uppercase/g, 'text-[10px] font-mono tracking-[0.2em] uppercase');
code = code.replace(/text-\[14px\] font-bold tracking-widest uppercase/g, 'text-[10px] font-mono tracking-[0.2em] uppercase');

// Add empty states to results tabs
const oldEmptyRules = `<div className="text-[14px] text-text-secondary mt-4">No violations found in this category.</div>`;
const newEmptyRules = `<div className="mt-4 border border-border/50 border-dashed rounded-[12px] p-6 flex flex-col items-center justify-center text-center opacity-60">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-muted mb-2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
    <div className="text-[12px] font-mono text-text-muted">No occurrences detected.</div>
</div>`;
code = code.replace(oldEmptyRules, newEmptyRules);
code = code.replace(oldEmptyRules, newEmptyRules); // For both Failed and Passed rules

fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
console.log("RESULTS UPDATED");
