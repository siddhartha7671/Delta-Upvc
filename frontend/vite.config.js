import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Delta Enterprise Portal',
        short_name: 'DeltaPortal',
        description: 'Delta UPVC Enterprise Management & Tracking',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/company_logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/company_logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ]
})
