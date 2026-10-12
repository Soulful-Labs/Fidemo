import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite runs from this app's folder; the shared data layer is one level up.
 * No Node typings are installed, hence the one-line declaration.
 */
declare const process: { cwd(): string }
const shared = `${process.cwd().split('\\').join('/')}/../shared`

/** The internal console runs on its own port: respondent 5173, client 5174, internal 5175. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /** The one data layer all three apps read. */
  resolve: { alias: { '@shared': shared } },
  server: { port: 5175, strictPort: true, fs: { allow: ['..'] } },
})
