// Serves the assembled dist/ as one origin, the way the deployment does:
// /client/* and /internal/* fall back to their own index.html, everything
// else to the respondent app's. Node only, no packages.
//
//   npm run build:all && node scripts/serve-all.mjs     http://localhost:5180
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const ROOT = join(process.cwd(), 'dist')
const PORT = Number(process.env.PORT ?? 5180)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)
  let file = normalize(join(ROOT, path))
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const app = path.startsWith('/client') ? 'client' : path.startsWith('/internal') ? 'internal' : ''
    file = join(ROOT, app, 'index.html')
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(readFileSync(file))
}).listen(PORT, () => console.log(`one origin on http://localhost:${PORT}  (/  /client  /internal)`))
