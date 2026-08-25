import { Inter, Source_Serif_4, Manrope, Public_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`\${inter.variable} \${sourceSerif.variable} \${manrope.variable} \${publicSans.variable} \${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="satya-theme"
        >
          {children}
        </ThemeProvider>
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
