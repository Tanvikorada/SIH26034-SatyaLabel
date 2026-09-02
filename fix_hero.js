const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const oldBlock = `{/* The generated 3D image with a radial mask to blend the square edges into the background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             }}>
           <Image unoptimized={true} src="/emblem-official-v2.jpg" alt="3D State Emblem of India" fill priority className="object-cover scale-110 shadow-2xl" sizes="(max-width: 768px) 100vw, 420px" />
        </div>`;

const newBlock = `{/* Transparent Float via mix-blend-mode */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <Image unoptimized={true} src="/emblem-cutout.jpg" alt="3D State Emblem of India" fill priority className="object-contain scale-[1.15] mix-blend-multiply dark:invert dark:mix-blend-screen" sizes="(max-width: 768px) 100vw, 420px" />
        </div>`;

if (code.includes('border-white/10')) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("HERO FIXED");
} else {
  console.log("HERO NOT FOUND");
}
