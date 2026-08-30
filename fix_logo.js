const fs = require('fs');

const newLogo = `
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center shadow-sm relative shrink-0">
          <div className="absolute inset-0 rounded-full border-[0.5px] border-primary/10 m-1"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary z-10">
            <path d="M12 3v18"></path>
            <path d="M3 8h18"></path>
            <path d="M5 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M15 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M8 21h8"></path>
            <circle cx="12" cy="3" r="1"></circle>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-mono tracking-[0.15em] text-text-muted uppercase leading-none mb-1" style={{ color: 'var(--color-text-muted)' }}>Dept. of Consumer Affairs</span>
          <span className="font-semibold tracking-tight text-[17px] text-text-primary leading-none" style={{ color: 'var(--color-text-primary)' }}>SatyaLabel <span className="font-normal text-text-secondary text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Legal Metrology</span></span>
        </div>
      </div>`;

// NavBar
let navCode = fs.readFileSync('frontend/components/NavBar.jsx', 'utf8');
navCode = navCode.replace(/<div className="flex items-center gap-3">[\s\S]*?<span className="font-bold tracking-tight text-\[18px\] text-text-primary">SatyaLabel<\/span>\s*<\/div>/, newLogo.trim());
fs.writeFileSync('frontend/components/NavBar.jsx', navCode);

// Landing Page
let pageCode = fs.readFileSync('frontend/app/page.jsx', 'utf8');
pageCode = pageCode.replace(/<div className="flex items-center gap-3">[\s\S]*?<span className="font-medium text-\[17px\] tracking-tight" style=\{\{ color: 'var\(--color-text-primary\)' \}\}>SatyaLabel<\/span>\s*<\/div>/, newLogo.trim());
fs.writeFileSync('frontend/app/page.jsx', pageCode);

console.log("LOGO UPGRADED");
