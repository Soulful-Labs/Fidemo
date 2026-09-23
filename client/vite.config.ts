import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** The client app runs on its own port so both apps can be open side by side. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
})
