import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

premium_logo = """function HeroSeal() {
  return (
    <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center group cursor-default mx-auto">
      {/* Dynamic Ambient Backlight */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          rotate: [0, 90, 0] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full blur-[60px] bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] mix-blend-screen dark:mix-blend-lighten"
      />
      
      {/* The Glass Container */}
      <div className="relative z-10 w-[260px] h-[260px] rounded-[2rem] bg-surface/40 border border-white/20 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center overflow-hidden backdrop-blur-2xl transition-transform duration-700 hover:scale-105">
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        
        {/* Shine highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay" />

        {/* Minimalist Monogram / Logo */}
        <svg viewBox="0 0 120 120" className="w-[100px] h-[100px] relative z-20 mb-4 overflow-visible">
          <defs>
            <linearGradient id="monogramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* S & L Interlocking Geometry */}
          <motion.path
            d="M 80,40 L 40,40 L 40,60 L 70,60 L 70,80 L 30,80"
            fill="none"
            stroke="url(#monogramGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 60,30 L 60,90 L 90,90"
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Floating Data Nodes (AI Concept) */}
          <motion.circle cx="40" cy="40" r="4" fill="#ffffff" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
          <motion.circle cx="70" cy="80" r="4" fill="#ffffff" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
          <motion.circle cx="90" cy="90" r="4" fill="#ffffff" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
        </svg>

        {/* Elegant Typography */}
        <div className="flex flex-col items-center">
          <div className="font-sans font-bold tracking-[0.2em] text-[20px] bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
            SATYALABEL
          </div>
          <div className="font-mono text-[10px] tracking-widest text-text-muted mt-2 uppercase">
            Compliance Intelligence
          </div>
        </div>

      </div>
    </div>
  );
}"""

pattern = r'function HeroSeal\(\) \{.*?return \(\s*<div className="relative w-full max-w-\[340px\] aspect-square.*?</svg>\s*</div>\s*</div>\s*\);\s*\}'
page = re.sub(pattern, premium_logo, page, flags=re.DOTALL)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated to Monogram Glass Logo")
