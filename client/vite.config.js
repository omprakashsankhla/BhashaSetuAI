import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'pwa-192x192.png', 'pwa-512x512.png', 'screenshot-desktop.png', 'screenshot-mobile.png', 'data/*.json'],
      manifest: {
        name: 'BhashaSetu AI',
        short_name: 'BhashaSetu',
        description: 'AI-Powered Multilingual Language Learning Platform',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1920x1032',
            type: 'image/png',
            form_factor: 'wide',
            label: 'BhashaSetu Desktop Dashboard'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '767x971',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'BhashaSetu Mobile Learning'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor-libs';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    css: false,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/tests/accessibility/**'
    ]
  }
})
