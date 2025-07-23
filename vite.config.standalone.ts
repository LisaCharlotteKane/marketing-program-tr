// Simplified Vite config for standalone development (without GitHub Spark dependencies)
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

// Fallback configuration for development without GitHub Spark
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // Provide fallback values for GitHub Spark constants
    GITHUB_RUNTIME_PERMANENT_NAME: JSON.stringify("standalone-dev"),
    BASE_KV_SERVICE_URL: JSON.stringify("/api/kv"),
  },
  server: {
    port: 5000,
    hmr: {
      overlay: false,
    },
    cors: {
      origin: /^https?:\/\//
    },
    watch: {
      ignored: ["**/prd.md", "**.log"],
      awaitWriteFinish: {
        pollInterval: 50,
        stabilityThreshold: 100,
      },
    },
  },
});