import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

premium_seal = """function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center group cursor-default">
      <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full">
        <defs>
          <path id="textCircle" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
        </defs>

        {/* Rotating Text Ring */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '50% 50%' }}>
            <text fill="var(--color-text-primary)" fontSize="13" letterSpacing="4.5" fontWeight="600" className="uppercase font-mono">
                <textPath href="#textCircle" startOffset="0%">
                  LEGAL METROLOGY • COMPLIANCE • SATYALABEL •
                </textPath>
            </text>
        </motion.g>

        {/* Static Center Core - Premium 2D */}
        <circle cx="100" cy="100" r="50" fill="var(--color-text-primary)" />
        <path d="M 90,80 L 110,80 L 105,120 L 95,120 Z" fill="var(--color-bg)" />
        <circle cx="100" cy="115" r="3" fill="var(--color-text-primary)" />
        <rect x="85" y="70" width="30" height="4" fill="var(--color-bg)" rx="1" />
      </svg>
    </div>
  );
}"""

# Replace the existing HeroSeal
pattern = r'function HeroSeal\(\) \{.*?return \(\s*<div className="relative.*?</svg>\s*</div>\s*\);\s*\}'
page = re.sub(pattern, premium_seal, page, flags=re.DOTALL)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated HeroSeal")
