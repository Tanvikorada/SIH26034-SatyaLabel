export default function manifest() {
  return {
    name: 'SatyaLabel Metrology',
    short_name: 'SatyaLabel',
    description: 'Legal Metrology AI Compliance Engine',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
