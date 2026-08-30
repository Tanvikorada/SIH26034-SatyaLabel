export default function manifest() {
  return {
    name: 'SatyaLabel Metrology',
    short_name: 'SatyaLabel',
    description: 'Legal Metrology AI Compliance Engine',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
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
