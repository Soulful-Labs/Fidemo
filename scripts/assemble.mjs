// One origin for the three apps. After each app has built, copies the client
// app into dist/client and the console into dist/internal, beside the
// respondent app at dist/. Each keeps its own build, router and base path.
//
//   npm run build:all      builds all three, then runs this
import { cpSync, existsSync, rmSync } from 'node:fs'

for (const [from, to] of [['client/dist', 'dist/client'], ['internal/dist', 'dist/internal']]) {
  if (!existsSync(`${from}/index.html`)) throw new Error(`${from} has not been built`)
  rmSync(to, { recursive: true, force: true })
  cpSync(from, to, { recursive: true })
  console.log(`copied ${from} -> ${to}`)
}
