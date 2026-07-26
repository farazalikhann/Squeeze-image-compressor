import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from the squeeze.services custom domain root, not a
  // github.io/<repo> subpath — base must be "/" for asset URLs to resolve.
  base: '/',
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
})
