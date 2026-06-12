import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Strata (FastAPI backend, ../Strata) serves all routes under /api on :8000.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
