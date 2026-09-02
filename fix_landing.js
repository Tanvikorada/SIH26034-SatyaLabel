const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

// 1. Fix Top Nav (Add ThemeToggle, change Officer Login to How it Works)
const oldNav = `<div className="flex items-center gap-4">
        <Link href="/login" className="text-[13px] font-medium text-white/80 hover:text-white transition-colors">Officer Login</Link>
        <Link href="/login" className="bg-white text-[#1E3A8A] hover:bg-white/90 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all hidden sm:block">Access Console</Link>
      </div>`;
const newNav = `<div className="flex items-center gap-4">
        <ThemeToggle />
        <a href="#pipeline" className="text-[13px] font-medium text-white/80 hover:text-white transition-colors hidden sm:block">How it Works</a>
        <Link href="/login" className="bg-white text-[#1E3A8A] hover:bg-white/90 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all">Access Console</Link>
      </div>`;
code = code.replace(oldNav, newNav);

// 2. Fix Hero alignment (add text-balance)
code = code.replace(
  'className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6"',
  'className="text-[44px] md:text-[58px] font-medium tracking-[-0.03em] leading-[1.06] mb-6 text-balance"'
);

// 3. Fix Hero Buttons (View Demo Flow -> Explore Pipeline)
const oldHeroBtns = `<Link href="/dashboard" className="mello-btn-secondary !px-7 !py-3 !text-[15px] !rounded-lg">View Demo Flow</Link>`;
const newHeroBtns = `<a href="#pipeline" className="mello-btn-secondary !px-7 !py-3 !text-[15px] !rounded-lg flex items-center justify-center">Explore Pipeline</a>`;
code = code.replace(oldHeroBtns, newHeroBtns);

// 4. Add id="pipeline" to PixelsToPenalty
const oldSection = `<section className="py-32 px-6 md:px-12 relative z-10 bg-transparent border-y border-[var(--color-border)] overflow-hidden">`;
const newSection = `<section id="pipeline" className="py-32 px-6 md:px-12 relative z-10 bg-transparent border-y border-[var(--color-border)] overflow-hidden scroll-mt-16">`;
code = code.replace(oldSection, newSection);

fs.writeFileSync('frontend/app/page.jsx', code);
console.log("LANDING PAGE FIXED");
