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
/**
 * One origin (respondent at /, client at /client, console at /internal): this
 * app is served under /internal/. Its pictures and the shared seed's are written
 * as "/img/...", which at the root would load the respondent's files, so
 * every such literal is given this app's base.
 */
const BASE = '/internal/'
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
  /** The one data layer all three apps read. */
  resolve: { alias: { '@shared': shared } },
  server: { port: 5175, strictPort: true, fs: { allow: ['..'] } },
})
