import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace HeroSeal
hero_seal_new = '''function HeroSeal() {
  return (
    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center md:ml-12" style={{ perspective: '800px' }}>
      <div className="absolute inset-4 rounded-full blur-3xl opacity-20" style={{ background: 'var(--color-primary)' }} />
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(0px)' }}>
          <motion.circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="6 6"
            animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          />
          <circle cx="100" cy="100" r="78" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.4" />
          <path d="M100 28 L138 46 L138 92 C138 116 122 132 100 142 C78 132 62 116 62 92 L62 46 Z"
            fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path d="M93 85 L98 91 L109 78" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          <text fontSize="7" fill="var(--color-text-secondary)" opacity="0.8" fontFamily="monospace">
            <textPath href="#circlePath">LEGAL METROLOGY • PACKAGED COMMODITIES • 2011 • INDIA • </textPath>
          </text>
          <defs>
            <path id="circlePath" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0" />
          </defs>
        </svg>

        <motion.div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-[var(--color-primary)] opacity-30" style={{ transform: 'translateZ(40px)' }} animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute w-[120px] h-[120px] rounded-full border border-[var(--color-text-muted)] opacity-20" style={{ transform: 'translateZ(-40px)' }} />
      </motion.div>
    </div>
  );
}
'''

# We find the HeroSeal component boundaries using regex
content = re.sub(r'function HeroSeal\(\) \{.*?(?=function PixelsToPenalty\(\))', hero_seal_new, content, flags=re.DOTALL)

# Let's also upgrade PixelsToPenalty and PipelineSection
content = content.replace('className="py-24 px-6 md:px-12 relative z-10 bg-[var(--color-surface)] border-y border-[var(--color-border)] overflow-hidden"', 'className="py-32 px-6 md:px-12 relative z-10 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] border-y border-[var(--color-border)] overflow-hidden"')
content = content.replace('className="text-3xl font-medium tracking-tight mb-16 text-center"', 'className="text-4xl md:text-5xl font-semibold tracking-tight mb-20 text-center bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary"')
content = content.replace('className="mello-card p-6 flex flex-col gap-4 h-full relative overflow-hidden group border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)]"', 'className="mello-card p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-border/50 shadow-xl hover:shadow-2xl transition-all bg-surface/50 backdrop-blur-xl rounded-3xl hover:-translate-y-1"')

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
