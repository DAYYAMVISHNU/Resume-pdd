import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/analyze': 'http://127.0.0.1:5000',
      '/ats_check': 'http://127.0.0.1:5000',
      '/analytics': 'http://127.0.0.1:5000',
      '/ping': 'http://127.0.0.1:5000',
      '/active_users': 'http://127.0.0.1:5000',
      '/chat': 'http://127.0.0.1:5000',
      '/share': 'http://127.0.0.1:5000',
      '/api': 'http://127.0.0.1:5000'
    }
  }
})
