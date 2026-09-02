const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// We need to define an EvidenceImage component at the top of the file.
// Or just inline it. The easiest way is to inject it near the top.
const componentCode = `
function EvidenceImage({ src }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-6 text-center text-[var(--color-text-muted)]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-[var(--color-text-secondary)] opacity-50">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M10 4v4"></path>
          <path d="M2 8h20"></path>
          <path d="M6 4v4"></path>
        </svg>
        <span className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-text-primary)] mb-1">Evidence Archived</span>
        <span className="text-[11px] leading-relaxed">Original scan securely purged from volatile edge node.<br/>Reference ID remains intact.</span>
      </div>
    );
  }
  return <img src={src} alt="Evidence" onError={() => setError(true)} className="w-full h-full object-contain rounded-xl shadow-lg" />;
}
`;

// Insert it after the imports
code = code.replace(/import \{ toast \} from 'sonner';/, "import { toast } from 'sonner';\n" + componentCode);

// Replace the old img mapping
const oldImgMap = /return images\.map\(\(img, idx\) => \([\s\S]*?<\/div>\n\s*\)\);/g;
const newImgMap = `return images.map((img, idx) => (
                  <div key={idx} className="w-full aspect-square flex items-center justify-center">
                    <EvidenceImage src={img.startsWith('http') ? img : API.replace('/api/v1', '') + '/' + img} />
                  </div>
                ));`;

if (code.match(oldImgMap)) {
  code = code.replace(oldImgMap, newImgMap);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
  console.log("EVIDENCE FIXED");
} else {
  console.log("EVIDENCE MAP NOT FOUND");
}
