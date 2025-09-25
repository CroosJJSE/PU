import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'public',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 3000,
    open: true
  }
})
