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
      // The Node.js server (server.js) will be configured to serve the built React app
      // and expose the scheduler API, all on port 9000. So, proxy to the same origin.
      '/api/scheduler': {
        target: 'http://localhost:9000', // Scheduler backend also serves on 9000
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