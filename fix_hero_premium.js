const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const newHeroGraphic = `function HeroSeal() {
  return (
    <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center mx-auto mt-12 md:mt-0 perspective-1000">
      
      {/* Premium Ambient Orbs */}
      <div className="absolute top-1/4 -right-4 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 -left-4 w-56 h-56 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Main Glass Floating Container */}
      <div className="relative z-10 w-[280px] h-[340px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center justify-start p-6 transform-gpu transition-all duration-700 hover:rotate-y-6 hover:rotate-x-6 hover:scale-105"
           style={{ transformStyle: 'preserve-3d', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
        
        {/* Top Header - Official Title */}
        <div className="w-full flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[var(--color-text-secondary)]">Legal Metrology</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
          </div>
        </div>

        {/* Abstract Product Label */}
        <div className="relative w-full h-[180px] rounded-xl border border-[var(--color-border)] bg-background/50 overflow-hidden mb-4 shadow-inner">
           {/* Skeleton Lines representing Label Text */}
           <div className="absolute top-4 left-4 right-4 flex flex-col gap-3">
             <div className="w-3/4 h-3 bg-[var(--color-border)] rounded-full"></div>
             <div className="w-1/2 h-2 bg-[var(--color-border)]/60 rounded-full"></div>
             <div className="w-full h-2 bg-[var(--color-border)]/40 rounded-full mt-4"></div>
             <div className="w-5/6 h-2 bg-[var(--color-border)]/40 rounded-full"></div>
           </div>
           
           {/* Packaged Goods Symbol */}
           <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-[var(--color-border)] rounded-md flex items-center justify-center opacity-50">
             <Layers size={20} className="text-[var(--color-text-muted)]" />
           </div>

           {/* Animated Scanning Laser */}
           <div className="absolute left-0 right-0 h-1 bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-[scan_3s_ease-in-out_infinite]" 
                style={{ top: '0%' }} />
        </div>

        {/* Official Verification Badge */}
        <div className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
           <CheckCircle2 size={14} />
           <span className="text-[11px] font-bold tracking-widest uppercase">Dept. Verified</span>
        </div>
        
      </div>
    </div>
  );
}
`;

const heroRegex = /function HeroSeal\(\) \{[\s\S]*?\}\n\n/g;

if (code.match(heroRegex)) {
  code = code.replace(heroRegex, newHeroGraphic + '\n');
  
  // Inject keyframes if not exists
  if (!code.includes('keyframes scan')) {
    code = code.replace('</style>', `
@keyframes scan {
  0% { top: -5%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 105%; opacity: 0; }
}
</style>`);
  }
  
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("PREMIUM HERO GRAPHIC INJECTED");
} else {
  console.log("Could not match HeroSeal");
}
