import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite runs from this app's folder (npm run dev, npm run build), so the
 * shared data layer is one level up. No Node typings are installed, hence the
 * one-line declaration.
 */
declare const process: { cwd(): string }
const shared = `${process.cwd().split('\\').join('/')}/../shared`

/** The client app runs on its own port so both apps can be open side by side. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /** The one data layer all three apps read: ../shared. */
  resolve: { alias: { '@shared': shared } },
  server: { port: 5174, fs: { allow: ['..'] } },
})
