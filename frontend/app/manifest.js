export default function manifest() {
  return {
    name: 'SatyaLabel Metrology',
    short_name: 'SatyaLabel',
    description: 'Legal Metrology AI Compliance Engine',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1E3A8A',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/emblem-transparent.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable any'
      },
    ],
  }
}
