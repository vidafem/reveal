import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/f_1.jpg', 'images/im1.jpg', 'images/im2.jpg', 'images/im3.jpg', 'images/music.mp3', 'images/sobre.mp3', 'fonts/GreatVibes-Regular.ttf'],
      manifest: {
        name: 'Gender Reveal',
        short_name: 'Reveal',
        theme_color: '#fdfbf7',
        background_color: '#fdfbf7',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,mp3,ttf}']
      }
    })
  ],
})
