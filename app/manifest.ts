import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Braincicle Fitness',
    short_name: 'Braincicle',
    description: 'Sistema completo de Treino e Gestão de Fichas',
    start_url: '/treino',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
