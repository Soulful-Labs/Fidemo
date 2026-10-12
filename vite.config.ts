import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Vite runs from the repo root for this app; the shared data layer is ./shared. No Node typings are installed, hence the declaration. */
declare const process: { cwd(): string }
const shared = `${process.cwd().split('\\').join('/')}/shared`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /** The one data layer all three apps read. */
  resolve: { alias: { '@shared': shared } },
})
