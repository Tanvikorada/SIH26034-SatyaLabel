import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { ThemeProvider } from 'next-themes'
import ThemeColorMeta from '../components/ThemeColorMeta'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })

export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
  
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SatyaLabel',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090a0f' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
        <ThemeColorMeta />
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
