import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

premium_logo = """function HeroSeal() {
  return (
    <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center group cursor-default">
      {/* Background ambient glow */}
      <div className="absolute inset-4 rounded-full blur-[80px] opacity-20 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] mix-blend-screen" />
      
      {/* Main Container */}
      <div className="relative z-10 w-[240px] h-[240px] rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-xl">
        
        {/* Subtle grid pattern inside card */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text-primary) 1px, transparent 0)', backgroundSize: '16px 16px' }} />

        {/* The Graphic */}
        <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] relative z-20">
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-text-primary)" />
              <stop offset="100%" stopColor="var(--color-text-secondary)" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>

          {/* Abstract Package / Label */}
          <rect x="20" y="25" width="60" height="50" rx="8" fill="none" stroke="url(#brandGrad)" strokeWidth="4" />
          
          {/* Barcode lines */}
          <line x1="32" y1="40" x2="32" y2="60" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="42" y1="40" x2="42" y2="60" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="40" x2="50" y2="60" stroke="url(#brandGrad)" strokeWidth="2" strokeLinecap="round" />
          
          {/* Scanner Line Overlay */}
          <motion.line 
            x1="10" y1="20" x2="90" y2="20" 
            stroke="url(#accentGrad)" 
            strokeWidth="3" 
            strokeLinecap="round"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, 60, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 8px var(--color-primary))' }}
          />

          {/* Compliance Checkmark (pops in) */}
          <motion.path 
            d="M 58 55 L 68 65 L 88 40" 
            fill="none" 
            stroke="var(--color-pass)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1] }}
            style={{ filter: 'drop-shadow(0 0 6px var(--color-pass))' }}
          />
        </svg>

        {/* Brand Text below graphic */}
        <div className="absolute bottom-6 font-display font-medium tracking-wide text-[16px] text-[var(--color-text-primary)]">
          SATYALABEL
        </div>
      </div>
    </div>
  );
}"""

pattern = r'function HeroSeal\(\) \{.*?return \(\s*<div className="relative.*?</svg>\s*</div>\s*\);\s*\}'
page = re.sub(pattern, premium_logo, page, flags=re.DOTALL)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated HeroSeal")
