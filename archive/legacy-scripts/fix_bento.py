import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to replace the dangling `function PipelineSection()function PixelsToPenalty()`
# or whatever it turned into.
# Let's find where RuleMicroApp ends.

pattern = r'(function RuleMicroApp\(\) \{.*?\n\})(\s*function PipelineSection\(\))?(\s*function PixelsToPenalty\(\))'

replacement = r"""\1

function PipelineSection() {
  return (
    <section className="py-24 px-6 md:px-12 relative z-20">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Built for precision.<br/>Powered by rules.</h2>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-[600px] mx-auto">
          SatyaLabel doesn't just read text. It understands the Legal Metrology framework, checking extracted values against strict regulatory logic.
        </p>
      </div>

      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="border border-[var(--color-border)] rounded-2xl p-6 md:p-8 bg-[var(--color-surface)] shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center mb-6">
            <Upload size={20} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="font-medium text-[16px] mb-2">1. Upload Label</h3>
          <p className="text-center text-[13px] text-[var(--color-text-secondary)] mb-8">High-res images of physical packaging or e-commerce graphics.</p>
          <div className="w-full mt-auto flex justify-center">
             <UploadMicroApp />
          </div>
        </div>

        {/* Step 2 */}
        <div className="border border-[var(--color-border)] rounded-2xl p-6 md:p-8 bg-[var(--color-surface)] shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center mb-6">
            <ScanLine size={20} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="font-medium text-[16px] mb-2">2. Extract Entities</h3>
          <p className="text-center text-[13px] text-[var(--color-text-secondary)] mb-8">Tesseract OCR & Gemini Vision extract specific required fields.</p>
          <div className="w-full mt-auto flex justify-center">
             <OCRMicroApp />
          </div>
        </div>

        {/* Step 3 */}
        <div className="border border-[var(--color-border)] rounded-2xl p-6 md:p-8 bg-[var(--color-surface)] shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center mb-6">
            <Scale size={20} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="font-medium text-[16px] mb-2">3. Enforce Rules</h3>
          <p className="text-center text-[13px] text-[var(--color-text-secondary)] mb-8">Values are checked against a strict Legal Metrology rules engine.</p>
          <div className="w-full mt-auto flex justify-center">
             <RuleMicroApp />
          </div>
        </div>
      </div>
    </section>
  );
}

\3"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)
with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
