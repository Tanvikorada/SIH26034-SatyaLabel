import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })

export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans bg-canvas text-obsidian-ink`}>
        {children}
        <Toaster position="top-right" />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registration successful'); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
