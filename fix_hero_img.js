const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const newHeroGraphic = `function HeroSeal() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center mx-auto mt-8 md:mt-0 perspective-1000">
      
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />

      {/* 3D Rendered Emblem Container */}
      <div className="relative z-10 w-full aspect-square flex items-center justify-center transform-gpu transition-all duration-700 hover:scale-105 hover:rotate-y-6 hover:rotate-x-6"
           style={{ transformStyle: 'preserve-3d' }}>
        
        {/* The generated 3D image with a radial mask to blend the square edges into the background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             }}>
           <img 
             src="/emblem-3d.jpg" 
             alt="3D State Emblem of India" 
             className="w-full h-full object-cover scale-110"
             style={{
               maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)'
             }}
           />
        </div>

        {/* Floating Verification Tag */}
        <div className="absolute bottom-8 right-8 bg-background/80 backdrop-blur-md border border-[var(--color-border)] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl transform translate-z-10">
           <Shield size={14} className="text-emerald-500" />
           <span className="text-[10px] font-mono tracking-widest uppercase text-text-primary">Official AI</span>
        </div>
      </div>
    </div>
  );
}
`;

const heroRegex = /function HeroSeal\(\) \{[\s\S]*?\}\n\n/g;
if (code.match(heroRegex)) {
  code = code.replace(heroRegex, newHeroGraphic + '\n');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("HERO IMAGE INJECTED");
} else {
  console.log("Regex failed");
}
