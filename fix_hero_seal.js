const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const newHeroSeal = `function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center group cursor-default mx-auto mt-12 md:mt-0">
      
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-600/20 transition-all duration-700" />
      
      {/* Official Government Aesthetic Container */}
      <div className="relative z-10 w-[260px] h-[260px] rounded-full bg-surface border-4 border-double border-[#000080] dark:border-[#1E3A8A] shadow-[0_10px_40px_-10px_rgba(0,0,128,0.2)] flex flex-col items-center justify-center overflow-hidden transition-transform duration-700 hover:scale-[1.03]">
        
        {/* Inner concentric ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#000080]/30 dark:border-[#1E3A8A]/50" />
        <div className="absolute inset-4 rounded-full border border-solid border-[#000080]/10 dark:border-[#1E3A8A]/20" />
        
        {/* Subtle radial backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#000080]/5 dark:to-[#1E3A8A]/10" />

        {/* Central State Emblem of India */}
        <div className="relative z-20 flex flex-col items-center justify-center mt-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/240px-Emblem_of_India.svg.png" 
            alt="State Emblem of India"
            className="w-[85px] h-[auto] object-contain drop-shadow-md mb-2 brightness-75 dark:brightness-110 dark:invert transition-all duration-500"
          />
          <span className="font-bold text-[11px] tracking-[0.1em] text-[#000080] dark:text-[#60A5FA]">सत्यमेव जयते</span>
        </div>

        {/* Circular Text (SVG path for perfect text wrapping) */}
        <div className="absolute inset-0 z-30 pointer-events-none animate-[spin_30s_linear_infinite]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path id="textPath" d="M 100, 100 m -85, 0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0" fill="none" />
            <text className="text-[12.5px] font-bold tracking-[0.2em] uppercase fill-[#000080] dark:fill-[#60A5FA]">
              <textPath href="#textPath" startOffset="0%">
                ★ DEPT. OF CONSUMER AFFAIRS ★ LEGAL METROLOGY DIVISION 
              </textPath>
            </text>
          </svg>
        </div>

      </div>
    </div>
  );
}

`;

const startIdx = code.indexOf('function HeroSeal()');
const endIdx = code.indexOf('function PixelsToPenalty()');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newHeroSeal + code.substring(endIdx);
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("HERO SEAL UPGRADED");
} else {
  console.log("Could not find boundaries");
}
