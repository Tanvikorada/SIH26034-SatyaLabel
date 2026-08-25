import './globals.css';
import NavBar from '@/components/NavBar';
import PageTransition from '@/components/PageTransition';

export const metadata = {
  title: 'SatyaLabel — Official Verification',
  description: 'Legal Metrology Compliance Tool',
  manifest: '/manifest.json',
  themeColor: '#0B1F3A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </body>
    </html>
  );
}
