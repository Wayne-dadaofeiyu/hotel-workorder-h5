import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hotel-workorder-h5/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
  },
})
