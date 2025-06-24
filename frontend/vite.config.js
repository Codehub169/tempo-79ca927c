import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000, // Ensure Vite dev server runs on port 9000
    proxy: {
      // Proxy requests for the main Codehub API
      '/api/codehub': {
        target: 'http://34.28.45.117:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/codehub/, ''), // Remove /api/codehub prefix
        secure: false // Set to true for HTTPS targets
      },
      // Proxy requests for the local scheduler backend API
      // This assumes the scheduler backend will run on an internal port (e.g., 3001) in development
      // and then serve the frontend and its own API on 9000 in production.
      // For local dev, Vite will serve frontend on 9000 and proxy API calls.
      '/api/scheduler': {
        target: 'http://localhost:3001', // Placeholder for scheduler backend's internal dev port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scheduler/, ''), // Remove /api/scheduler prefix
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist', // Output directory for the production build
    emptyOutDir: true // Clear the output directory before building
  }
})
