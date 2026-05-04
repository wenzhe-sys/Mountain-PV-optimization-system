import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 8081,
    host: '0.0.0.0',
    proxy: {
      '/algorithm': {
        target: 'http://localhost:8003',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8004',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8003',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
