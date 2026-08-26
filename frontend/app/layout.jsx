import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })

export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
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
        <Script
          id="unregister-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('SW unregistered successfully');
                }
              });
            }
          `}}
        />
      </body>
    </html>
  )
}
