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
/**
 * One origin (respondent at /, client at /client, console at /internal): this
 * app is served under /client/. Its pictures and the shared seed's are written
 * as "/img/...", which at the root would load the respondent's files, so
 * every such literal is given this app's base.
 */
const BASE = '/client/'
const prefixImages = {
  name: 'prefix-public-images',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!/\.(t|j)sx?($|\?)/.test(id) || id.includes('node_modules')) return null
    return code.includes('/img/') ? code.replace(/(['"`])\/img\//g, `$1${BASE}img/`) : null
  },
}

export default defineConfig({
  base: BASE,
  plugins: [prefixImages, react(), tailwindcss()],
  /** The one data layer all three apps read: ../shared. */
  resolve: { alias: { '@shared': shared } },
  server: { port: 5174, fs: { allow: ['..'] } },
})
