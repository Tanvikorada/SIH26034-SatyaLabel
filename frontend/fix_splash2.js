const fs = require('fs');
let code = fs.readFileSync('components/SplashScreen.jsx', 'utf8');

const rx = /<div className="relative flex items-center justify-center">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/;

if (rx.test(code)) {
  const newText = `<div className="relative flex flex-col items-center justify-center">
        {/* Glowing aura slowly fading in behind the static emblem */}
        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-[2.0] animate-pulse"></div>
        
        {/* Emblem MUST remain completely static to perfectly match the OS Native Splash Screen handoff */}
        <img 
          src="/emblem-transparent.png" 
          alt="Ashoka Lions" 
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain z-10 drop-shadow-2xl mb-8"
        />

        {/* Text and Dots (fades in AFTER the OS handoff so it doesn't glitch) */}
        <div className="flex flex-col items-center animate-fade-in-up z-20" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            SatyaLabel
          </h1>
          <p className="text-[13px] tracking-widest text-white/70 uppercase font-medium mb-6">
            Legal Metrology
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
  code = code.replace(rx, newText);
  fs.writeFileSync('components/SplashScreen.jsx', code);
  console.log("INJECTED");
} else {
  console.log("NOT FOUND");
}
