import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  build: {
    outDir: process.env.OUTPUT_DIR || 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs']
        }
      }
    }
  },
  server: {
    port: 5000,
    hmr: {
      overlay: false,
      clientPort: 5000,
      port: 5000,
    },
    middlewareMode: false,
    fs: {
      strict: false,
      allow: ['.'],
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/packages/**',
        '**/*.bak',
        '**/*.backup',
        '**/*.tmp',
        '**/*.temp',
        '**/test*.html',
        '**/test*.js',
        '**/check*.html',
        '**/check*.js',
        '**/debug*.html',
        '**/debug*.js',
        '**/fix*.html',
        '**/fix*.js',
        '**/*.old',
        '**/*-old.*',
        '**/*-backup.*',
        '**/*.md',
        '**/*.log',
        '**/*.sh',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
});