const fs = require('fs');
let code = fs.readFileSync('frontend/components/SplashScreen.jsx', 'utf8');

const oldHtml = `      <div className="relative flex flex-col items-center">
        {/* Glowing aura behind emblem */}
        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
        
        <img 
          src="/emblem-transparent.png" 
          alt="Ashoka Lions" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain z-10 drop-shadow-2xl animate-fade-in-up"
        />
        
        <div className="mt-8 flex flex-col items-center z-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <span className="text-[12px] font-mono tracking-[0.3em] text-white/60 uppercase mb-2">Dept. of Consumer Affairs</span>
          <h1 className="text-3xl font-bold tracking-tight text-white">SatyaLabel</h1>
          <div className="mt-6 flex gap-2">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>`;

const newHtml = `      <div className="relative flex items-center justify-center">
        {/* Glowing aura slowly fading in behind the static emblem */}
        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-[2.0] animate-pulse"></div>
        
        {/* Emblem MUST remain completely static to perfectly match the OS Native Splash Screen handoff */}
        <img 
          src="/emblem-transparent.png" 
          alt="Ashoka Lions" 
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain z-10 drop-shadow-2xl"
        />
      </div>`;

code = code.replace(oldHtml, newHtml);

fs.writeFileSync('frontend/components/SplashScreen.jsx', code);
console.log("SPLASH SCREEN HTML FIXED");
