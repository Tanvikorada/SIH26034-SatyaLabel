import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Uniform background color for all sections.
# Remove bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]
content = content.replace('bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]', 'bg-transparent')
content = content.replace('bg-[var(--color-surface)]', 'bg-transparent')
content = content.replace('bg-[var(--color-background)]', 'bg-transparent')

# 2. Re-style the cards (PixelsToPenalty / PipelineSection / TechStack cards)
# Old: className="mello-card p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-border/50 shadow-xl hover:shadow-2xl transition-all bg-surface/50 backdrop-blur-xl rounded-3xl hover:-translate-y-1"
# New: Mello-style flat card
new_card_style = 'p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)] rounded-2xl'
content = content.replace('p-8 flex flex-col gap-5 h-full relative overflow-hidden group border border-border/50 shadow-xl hover:shadow-2xl transition-all bg-surface/50 backdrop-blur-xl rounded-3xl hover:-translate-y-1', new_card_style)
content = content.replace('p-12 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)]', 'p-12 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-[var(--color-surface)] rounded-2xl')

# 3. Redesign HeroSeal
new_hero_seal = '''function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center md:ml-12 group">
      {/* Glow effect behind */}
      <div className="absolute inset-8 rounded-full blur-[60px] opacity-30" style={{ background: 'var(--color-accent)' }} />
      
      {/* The main logo container */}
      <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full overflow-visible">
        {/* Outer dashed ring */}
        <motion.circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="4 8"
          animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        
        {/* Inner solid ring */}
        <circle cx="100" cy="100" r="64" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
        
        {/* Center Shield */}
        <motion.path 
          d="M100 45 L130 58 L130 92 C130 116 118 132 100 142 C82 132 70 116 70 92 L70 58 Z"
          fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2"
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        
        {/* Checkmark inside shield */}
        <path d="M88 95 L96 103 L114 84" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Scanning laser line moving down the shield */}
        <motion.line 
          x1="60" y1="40" x2="140" y2="40" 
          stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.6"
          animate={{ y: [0, 100, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
'''

content = re.sub(r'function HeroSeal\(\) \{.*?(?=function PixelsToPenalty\(\))', new_hero_seal, content, flags=re.DOTALL)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
