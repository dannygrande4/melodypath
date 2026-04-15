import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const appEnv = loadEnv(mode, __dirname, '')
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '../..'), '')
  const env = { ...rootEnv, ...appEnv }

  const basePath = env.VITE_BASE_PATH || '/'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'MoniqueMusic',
          short_name: 'MoniqueMusic',
          description: 'Learn music your way - from first chord to jazz improvisation',
          theme_color: '#4f6ef7',
          background_color: '#fafafa',
          display: 'standalone',
          start_url: basePath,
          scope: basePath,
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
          runtimeCaching: [
            {
              // Cache Google Fonts
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              // Cache soundfont instrument samples
              urlPattern: /^https:\/\/gleitz\.github\.io\/midi-js-soundfonts\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'soundfont-samples',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    base: basePath.endsWith('/') ? basePath : `${basePath}/`,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['tone'],
    },
    server: {
      port: 5173,
    },
  }
})
