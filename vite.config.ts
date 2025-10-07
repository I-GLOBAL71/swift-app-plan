import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      },
      includeAssets: ['favicon.ico', 'logo.png', 'logo2.png'],
      manifest: {
        name: 'oneprice.shop',
        short_name: 'oneprice',
        description: 'oneprice.shop e-commerce simplifiée avec prix unique de 3000 FCFA. Shopping accessible à tous avec produits de qualité et collection premium.',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logo2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
