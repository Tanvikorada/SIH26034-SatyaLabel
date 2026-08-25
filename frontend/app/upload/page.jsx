'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { scans } from '@/lib/api';

const STEPS = [
  { icon: '↑', label: 'Uploading image',           detail: 'Secure transfer to analysis server' },
  { icon: '◎', label: 'Running OCR engine',         detail: 'Tesseract + Gemini Vision extracting text…' },
  { icon: '⊞', label: 'Parsing declarations',       detail: 'Mapping Rule 6 mandatory fields…' },
  { icon: '⊛', label: 'Validating LM(PC) Rules',    detail: 'Checking Rules 3, 6, 7, 8, 9, 12, 13, 26, 31…' },
  { icon: '↗', label: 'Generating report',           detail: 'PDF archiving to enforcement repository…' },
];

function DropZone({ onFile, preview, dragging, onDragOver, onDragLeave, onDrop, disabled }) {
  const inputRef = useRef(null);
  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        border: dragging
          ? '2px dashed var(--accent)'
          : preview
            ? '1px solid var(--border-bright)'
            : '2px dashed var(--border)',
        background: dragging
          ? 'var(--accent-subtle)'
          : preview
            ? 'transparent'
            : 'var(--bg-surface)',
        boxShadow: dragging ? '0 0 0 4px var(--accent-subtle), inset 0 0 40px var(--accent-subtle)' : 'none',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Label preview" className="w-full max-h-72 object-contain" />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Click to replace</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>or drag a new image</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-14 px-8 text-center space-y-4">
          <div
            className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl transition-transform duration-200"
            style={{
              background: dragging ? 'var(--accent-subtle)' : 'var(--bg-raised)',
              border: `1px solid ${dragging ? 'var(--accent-border)' : 'var(--border)'}`,
              transform: dragging ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            📷
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {dragging ? 'Drop it here' : 'Drop product label image'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              or <span style={{ color: 'var(--accent)' }}>click to browse files</span>
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            {['JPG or PNG', 'Max 10 MB', 'Min 600px'].map(t => (
              <span
                key={t}
                className="text-[11px] flex items-center gap-1"
                style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessingView({ step }) {
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <div className="card p-7 space-y-6 animate-scale-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid var(--border)' }}
          />
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ borderTop: '2px solid var(--accent)', borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-base">
            {STEPS[step]?.icon}
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Compliance Check Running
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-1.5">
        {STEPS.map((s, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300"
              style={{
                background: active ? 'var(--accent-subtle)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                opacity: done ? 0.55 : active ? 1 : 0.3,
              }}
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-[11px] shrink-0"
                style={{
                  background: done ? 'var(--pass-bg)' : active ? 'var(--accent-subtle)' : 'var(--bg-raised)',
                  color: done ? 'var(--pass)' : active ? 'var(--accent)' : 'var(--text-faint)',
                  border: `1px solid ${done ? 'var(--pass-border)' : active ? 'var(--accent-border)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {done ? '✓' : s.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: done ? 'var(--pass)' : active ? 'var(--text-primary)' : 'var(--text-faint)' }}
                >
                  {s.label}
                </p>
                {active && (
                  <p className="text-xs mt-0.5 animate-pulse" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                    {s.detail}
                  </p>
                )}
              </div>
              {active && (
                <span className="badge badge-accent text-[10px] shrink-0">Running</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-raised)' }}
        >
          <div
            className="h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent), hsl(20,95%,55%))',
            }}
          />
        </div>
        <p className="text-[11px] text-right" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          {step <= 1 ? 'First scan takes 15–30s (Tesseract cold start)' : step === 4 ? 'Almost done…' : 'Processing…'}
        </p>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep]           = useState(-1);
  const [error, setError]         = useState(null);
  const [sourceType, setSourceType]   = useState('physical_label');
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName]     = useState('');

  const handleFile = useCallback(f => {
    if (f.size > 10 * 1024 * 1024) { setError('File too large — maximum 10 MB.'); return; }
    if (!['image/jpeg','image/jpg','image/png'].includes(f.type)) { setError('Only JPG and PNG are accepted.'); return; }
    setFile(f); setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDragOver  = useCallback(e => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);
  const handleDrop      = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true); setError(null);
    try {
      setStep(0);
      const { scan_id } = await scans.upload(file, { sourceType, productName: productName || undefined, brandName: brandName || undefined });
      setStep(1);
      const result = await scans.pollUntilComplete(scan_id, {
        intervalMs: 2000, maxWaitMs: 180000,
        onProgress: () => setStep(1),
      });
      if (result.status === 'failed') throw Object.assign(new Error(result.error_message || 'Processing failed.'), { code: 'PIPELINE_FAILED' });
      setStep(2); await new Promise(r => setTimeout(r, 200));
      setStep(3); await new Promise(r => setTimeout(r, 200));
      setStep(4); await new Promise(r => setTimeout(r, 300));
      router.push(`/results/${scan_id}`);
    } catch (err) {
      const code = err.code || err.response?.data?.code;
      const msg  = err.response?.data?.error?.message || err.message;
      const friendly = {
        IMAGE_TOO_LOW_RES: `Image resolution too low — ${msg}`,
        NO_TEXT_DETECTED:  'No readable text found. Try better lighting, avoid glare, hold phone steady.',
        INVALID_FILE_TYPE: 'Only JPG and PNG images are accepted.',
        FILE_TOO_LARGE:    'Image is too large (max 10 MB).',
        POLL_TIMEOUT:      'Taking too long — server may be busy. Try again.',
        PIPELINE_FAILED:   `Processing failed: ${msg}`,
      };
      setError(friendly[code] || msg || 'An unexpected error occurred.');
      setAnalyzing(false); setStep(-1);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in-up">

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
          New Label Scan
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload a clear photograph of a packaged commodity label for compliance analysis under LM(PC) Rules, 2011.
        </p>
      </div>

      {analyzing ? (
        <ProcessingView step={step} />
      ) : (
        <div className="space-y-4">

          {/* Source type */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Label Source
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'physical_label',   icon: '🏷️', label: 'Physical Label',     desc: 'Photo of a product label' },
                { value: 'ecommerce_listing', icon: '🛒', label: 'E-Commerce Listing', desc: 'Screenshot of listing page' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSourceType(opt.value)}
                  className="text-left p-3 rounded-lg transition-all duration-150"
                  style={{
                    background: sourceType === opt.value ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    border: `1px solid ${sourceType === opt.value ? 'var(--accent-border)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{opt.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: sourceType === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <DropZone
            onFile={handleFile} preview={preview} dragging={dragging}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onDrop={handleDrop} disabled={analyzing}
          />

          {/* Metadata hints */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Product Name', placeholder: 'e.g. Maggi Noodles', value: productName, set: setProductName },
              { label: 'Brand Name',   placeholder: 'e.g. Nestlé',         value: brandName,  set: setBrandName },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {f.label} <span style={{ color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="input"
                />
              </div>
            ))}
          </div>

          {/* File info */}
          {file && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-xl shrink-0">🖼️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {(file.size / 1024).toFixed(0)} KB · {file.type.split('/')[1].toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="text-sm w-5 h-5 flex items-center justify-center rounded transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >
                ✕
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex gap-3 px-4 py-3.5 rounded-lg text-sm"
              style={{ background: 'var(--fail-bg)', border: '1px solid var(--fail-border)', color: 'var(--fail)' }}
            >
              <span className="shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="w-full py-4 rounded-xl text-base font-bold transition-all duration-150"
            style={file ? {
              background: 'linear-gradient(135deg, var(--accent), hsl(20,95%,52%))',
              color: 'hsl(226,28%,6%)',
              boxShadow: '0 4px 20px var(--accent-glow)',
            } : {
              background: 'var(--bg-raised)',
              color: 'var(--text-faint)',
              cursor: 'not-allowed',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => { if (file) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px var(--accent-glow)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = file ? '0 4px 20px var(--accent-glow)' : 'none'; }}
          >
            {file ? '⚖️  Analyse for Compliance' : 'Select a label image to continue'}
          </button>

          {/* Tips */}
          <div
            className="rounded-lg px-4 py-4 space-y-2"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Tips for best OCR accuracy
            </p>
            <ul className="space-y-1">
              {[
                'Hold camera directly above — no tilt or angle',
                'Minimum 600px on shortest side (any smartphone is fine)',
                'All text in focus, well-lit — avoid glare on plastic packaging',
                'Capture the full label including corners',
                'For low-quality images, Gemini Vision fallback activates automatically',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
