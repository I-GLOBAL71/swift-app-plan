import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:8080 ws://localhost:8080 https://pxipmsunesxtkepjwxvn.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lovable.dev https://pxipmsunesxtkepjwxvn.supabase.co https://s.alicdn.com https://sc04.alicdn.com; media-src 'self' data:;"
    }
  }
})
