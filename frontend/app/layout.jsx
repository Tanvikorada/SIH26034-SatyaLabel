import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const inter  = Inter({ subsets: ['latin'], variable: '--font-body',    display: 'swap' });

export const metadata = {
  title: 'SatyaLabel — Legal Metrology Compliance Checker',
  description: 'AI-powered packaged commodity compliance verification under Legal Metrology (Packaged Commodities) Rules, 2011. Smart India Hackathon — PS SIH26034.',
  keywords: 'legal metrology, packaged commodities, compliance, India, consumer affairs, enforcement',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body
        className="antialiased min-h-screen"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
      >
        <NavBar />

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-5 py-8 lg:py-10">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border-muted)', marginTop: '64px' }}>
          <div
            className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(27,95%,58%), hsl(20,92%,50%))' }}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="hsl(226,28%,8%)">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>SatyaLabel v2 · SIH26034</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>LM(PC) Rules, 2011</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
