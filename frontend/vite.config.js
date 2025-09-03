import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // so phone/tablet on same Wi-Fi can reach it
    port: 5173
  }
})