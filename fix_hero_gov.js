const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

// 1. Fix Top Nav in Landing Page
const oldNavTitle = `<span className="text-[9px] font-mono tracking-[0.15em] text-white/70 uppercase leading-none mb-1">Dept. of Consumer Affairs</span>`;
const newNavTitle = `<span className="text-[10px] font-sans tracking-[0.05em] text-white/80 uppercase leading-none mb-1 font-medium">उपभोक्ता मामले विभाग • Dept. of Consumer Affairs</span>`;
code = code.replace(oldNavTitle, newNavTitle);

// 2. Inject Government Badge in Hero Section
const oldHeroBadge = `<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-mono mb-8 border border-[var(--color-border)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
              style={{ background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', color: 'var(--color-text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)', animation: 'typewriter-blink 2s ease-in-out infinite' }} />
              SIH 2026 Problem ID SIH26034
            </motion.div>`;

const newHeroBadge = `<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
              <div className="flex flex-col border-l-2 border-[var(--color-accent)] pl-4">
                <div className="text-[15px] md:text-[17px] font-bold tracking-wide text-[var(--color-text-primary)] mb-1">
                  भारत सरकार <span className="opacity-30 px-1.5">|</span> GOVERNMENT OF INDIA
                </div>
                <div className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-text-secondary)]">
                  Ministry of Consumer Affairs, Food & Public Distribution
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-8 border border-[var(--color-border)] shadow-sm"
              style={{ background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', color: 'var(--color-text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)', animation: 'typewriter-blink 2s ease-in-out infinite' }} />
              SIH26034 • Legal Metrology Enforcement
            </motion.div>`;

code = code.replace(oldHeroBadge, newHeroBadge);

fs.writeFileSync('frontend/app/page.jsx', code);
console.log("LANDING PAGE BILINGUAL FIXED");
