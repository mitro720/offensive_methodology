import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/offensive_methodology/',   // GitHub Pages repo name
  server: {
    port: 8080,
    strictPort: true,
  },
})
