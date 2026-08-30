const fs = require('fs');
let code = fs.readFileSync('frontend/app/globals.css', 'utf8');

if (!code.includes('.pb-safe')) {
  code += `
/* Mobile Overhaul Classes */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.active-press { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.active-press:active { transform: scale(0.92); }

@media (max-width: 768px) {
  body { padding-bottom: 80px; }
  
  /* Stack tables automatically into cards on mobile */
  .mello-table-mobile-card { display: flex; flex-direction: column; gap: 12px; }
  .mello-table-mobile-card thead { display: none; }
  .mello-table-mobile-card tr { display: flex; flex-direction: column; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
  .mello-table-mobile-card td { padding: 4px 0 !important; border: none !important; display: flex; flex-direction: column; gap: 2px; }
  .mello-table-mobile-card td::before { content: attr(data-label); font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); }
}
`;
  fs.writeFileSync('frontend/app/globals.css', code);
  console.log("CSS UPGRADED");
}
