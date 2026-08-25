import './globals.css';
import NavBar from '@/components/NavBar';
import PageTransition from '@/components/PageTransition';
import { Toaster } from 'sonner';
import Script from 'next/script';

export const metadata = {
  title: 'SatyaLabel — Official Verification',
  description: 'Legal Metrology Compliance Tool',
  manifest: '/manifest.json',
  themeColor: '#0B1F3A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0B1F3A" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <NavBar />
        <main className="min-h-screen pt-24 px-4 md:px-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Toaster position="bottom-right" richColors theme="light" />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registration successful'); },
                  function(err) { console.log('SW registration failed', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
