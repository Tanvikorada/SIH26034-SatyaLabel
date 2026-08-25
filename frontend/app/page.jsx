import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 px-4">
      {/* Hero */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm">
          <span>🇮🇳</span>
          <span>Smart India Hackathon — PS SIH26034</span>
        </div>

        <h1 className="text-5xl font-black text-white leading-tight">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            SatyaLabel
          </span>
        </h1>

        <p className="text-xl text-slate-300">
          AI-powered Legal Metrology Compliance Checker for Packaged Commodities
        </p>

        <p className="text-slate-400 max-w-lg mx-auto">
          Upload a product label photo. Our system OCRs it, validates all mandatory
          declarations against the <strong className="text-slate-300">Legal Metrology (Packaged Commodities)
          Rules, 2011</strong>, and generates an enforcement report with exact rule citations.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Link
          href="/upload"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40"
        >
          🔍 Scan a Product Label
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl text-lg transition-colors"
        >
          📊 View Dashboard
        </Link>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-400">
        {[
          '✅ 16 Rule Checks',
          '📖 Exact Rule Citations',
          '🔤 Tesseract OCR + Gemini Vision',
          '📄 PDF Reports',
          '🔒 Zero Cost Stack',
          '🌐 Hindi + English Labels',
        ].map(f => (
          <span key={f} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
