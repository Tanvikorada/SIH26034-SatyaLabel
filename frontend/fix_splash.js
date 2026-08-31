const fs = require('fs');
let code = fs.readFileSync('components/SplashScreen.jsx', 'utf8');

const target = `<div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6">
          <Image unoptimized={true} src="/emblem-transparent.png" alt="State Emblem of India" fill priority className="object-contain" sizes="(max-width: 768px) 112px, 128px" />
        </div>`;
const newText = `<div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-8">
          <Image unoptimized={true} src="/emblem-transparent.png" alt="State Emblem of India" fill priority className="object-contain drop-shadow-xl" sizes="(max-width: 768px) 112px, 128px" />
        </div>
        
        <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            SatyaLabel
          </h1>
          <p className="text-[13px] tracking-widest text-white/70 uppercase font-medium mb-6">
            Legal Metrology
          </p>
          
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>`;

if (code.includes(target)) {
  code = code.replace(target, newText);
  fs.writeFileSync('components/SplashScreen.jsx', code);
  console.log("RESTORED SPLASH SCREEN TEXT AND DOTS");
} else {
  console.log("TARGET NOT FOUND");
}
