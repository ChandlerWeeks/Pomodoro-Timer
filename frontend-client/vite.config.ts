import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  // The frontend calls relative /api paths; in dev, Vite forwards them to the backend.
  // In Docker, API_URL points at the backend service instead of localhost.
  server: {
    proxy: { '/api': process.env.API_URL ?? 'http://localhost:3000' },
  },
})
