import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

//ui styles
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import {VitePWA} from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      registerType: "autoUpdate",
      scope: "/",
      manifest: {
        "name": "Quickey",
        "short_name": "Quickey",
        "start_url": "/app",
        "display": "standalone",
        "icons": [
          { "src": "/favicon.ico", "sizes": "32x32", "type": "image/x-icon", "purpose": "any" },
          { "src": "/icons/logo_big.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
          { "src": "/icons/logo_small.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // urlPattern: ({url}) => {
            //   return url.pathname.startsWith("/api")
            // },
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200] // cache only successfull
              },
              expiration: {maxEntries: 100, maxAgeSeconds: 60 * 60 * 3}
            }
          }
        ],
      }
    }),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf']
})
