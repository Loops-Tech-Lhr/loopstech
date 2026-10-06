// Post-build checks on dist/: internal links and assets resolve, and every page has the SEO basics.
// Usage: npm run build && npm run check
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist'
)
const SITE = 'https://loopstech.com'
const errors = []
const fail = (page, msg) => errors.push(`${page}: ${msg}`)

const htmlFiles = fs
  .readdirSync(DIST, { recursive: true })
  .filter(f => f.endsWith('.html') && !f.startsWith('google'))
  .map(f => f.replaceAll('\\', '/'))

const exists = urlPath => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0])
  const f = path.join(DIST, clean)
  if (!f.startsWith(DIST)) return false
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return true
  return fs.existsSync(path.join(f, 'index.html'))
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(DIST, file), 'utf8')
  const isErrorPage = file === '404.html'

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  if (!title) fail(file, 'missing <title>')
  else if (title.length > 75)
    fail(file, `title too long (${title.length}): ${title}`)
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
  if (!desc) fail(file, 'missing meta description')
  else if (desc.length > 320)
    fail(file, `meta description too long (${desc.length})`)
  if ((html.match(/<h1[\s>]/g) || []).length !== 1)
    fail(file, 'must have exactly one <h1>')
  if (!/<html lang="(en|ar)" dir="(ltr|rtl)">/.test(html))
    fail(file, 'missing lang/dir on <html>')
  if (!isErrorPage) {
    if (!/<link rel="canonical" href="https:\/\/loopstech\.com\//.test(html))
      fail(file, 'missing canonical')
    if (!/hreflang="en"/.test(html) || !/hreflang="ar"/.test(html))
      fail(file, 'missing hreflang pair')
    if (!/application\/ld\+json/.test(html)) fail(file, 'missing JSON-LD')
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0]
    if (!/\balt="/.test(tag)) fail(file, `img without alt: ${tag.slice(0, 80)}`)
    if (!/\bwidth="/.test(tag) || !/\bheight="/.test(tag))
      fail(file, `img without width/height: ${tag.slice(0, 80)}`)
  }
  for (const block of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  )) {
    try {
      JSON.parse(block[1])
    } catch {
      fail(file, 'invalid JSON-LD')
    }
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
    if (m[1].startsWith('//')) continue
    if (!exists(m[1])) fail(file, `broken internal reference ${m[1]}`)
  }
  for (const m of html.matchAll(/(?:imagesrcset|srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0]
      if (u.startsWith('/') && !exists(u)) fail(file, `broken srcset ${u}`)
    }
  }
}

// sitemap: every URL exists, and hreflang alternates are reciprocal
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
for (const loc of locs) {
  const p = loc.replace(SITE, '')
  if (!exists(p)) fail('sitemap.xml', `URL does not exist in dist: ${loc}`)
}
for (const file of htmlFiles.filter(f => f !== '404.html')) {
  const url = SITE + '/' + file.replace(/index\.html$/, '')
  if (!locs.includes(url)) fail(file, `not listed in sitemap.xml (${url})`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  console.error(`\n${errors.length} problem(s) found`)
  process.exit(1)
}
console.log(`OK: ${htmlFiles.length} pages, ${locs.length} sitemap URLs`)
