// Static site build: data/*.json + templates -> dist/
// Usage: npm run build
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import * as T from './templates.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const r = (...p) => path.join(ROOT, ...p)
const readJson = f => JSON.parse(fs.readFileSync(r(f), 'utf8'))
const write = (rel, content) => {
  const f = path.join(DIST, rel)
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, content)
}
const hash = buf =>
  crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)
// Campaign landing page for Saudi construction companies
const SA_SLUG = 'it-services-for-construction-in-saudi-arabia'
const today = new Date().toISOString().slice(0, 10)

fs.rmSync(DIST, { recursive: true, force: true })
fs.mkdirSync(DIST, { recursive: true })

// ---------- fonts (self-hosted woff2, subset files from @fontsource) ----------
const fontDefs = [
  [
    'poppins',
    'Poppins',
    'latin',
    [300, 400, 500],
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
  ],
  [
    'noto-sans-arabic',
    'Noto Sans Arabic',
    'arabic',
    [300, 400, 500],
    'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC'
  ]
]
let fontCss = ''
const fontFiles = []
for (const [pkg, family, subset, weights, range] of fontDefs) {
  for (const w of weights) {
    const name = `${pkg}-${subset}-${w}-normal.woff2`
    fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true })
    fs.copyFileSync(
      r('node_modules', '@fontsource', pkg, 'files', name),
      path.join(DIST, 'fonts', name)
    )
    fontFiles.push(`/fonts/${name}`)
    fontCss += `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(/fonts/${name}) format('woff2');unicode-range:${range}}\n`
  }
}

// ---------- CSS / JS (content-hashed filenames) ----------
const minCss = s =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()
const emit = (dir, name, ext, content) => {
  const file = `${name}.${hash(content)}.${ext}`
  write(`${dir}/${file}`, content)
  return `/${dir}/${file}`
}
const cssHref = emit(
  'css',
  'styles',
  'css',
  minCss(fontCss + fs.readFileSync(r('css/styles.css'), 'utf8'))
)
const landingHref = emit(
  'css',
  'landing',
  'css',
  minCss(fs.readFileSync(r('css/landing.css'), 'utf8'))
)
const jsSrc = emit('js', 'app', 'js', fs.readFileSync(r('js/app.js'), 'utf8'))

// ---------- images ----------
const imgDir = path.join(DIST, 'img')
fs.mkdirSync(imgDir, { recursive: true })
fs.copyFileSync(
  r('img/loopstech-favicon.png'),
  path.join(imgDir, 'loopstech-favicon.png')
)

const heroSrc = r('img/loopstech-hero-workspace.jpg')
const heroMeta = await sharp(heroSrc).metadata()
const hero = []
for (const w of [800, 480, 1200]) {
  const h = Math.round((w * heroMeta.height) / heroMeta.width)
  await sharp(heroSrc)
    .resize(w)
    .webp({ quality: 76 })
    .toFile(path.join(imgDir, `hero-${w}.webp`))
  hero.push({ src: `/img/hero-${w}.webp`, w, h })
}

const logoMeta = await sharp(r('img/loopstech-logo.png')).metadata()
const logoH = 68
const logoW = Math.round((logoMeta.width * logoH) / logoMeta.height)
const logoBuf = await sharp(r('img/loopstech-logo.png'))
  .resize({ height: logoH })
  .png({ palette: true })
  .toBuffer()
fs.writeFileSync(path.join(imgDir, 'logo.png'), logoBuf)

// Open Graph card: hero photo, dark overlay, white logo, brand bar
const whiteLogo = await sharp({
  create: {
    width: logoW * 2,
    height: logoH * 2,
    channels: 4,
    background: '#ffffff'
  }
})
  .composite([
    {
      input: await sharp(logoBuf)
        .resize({ height: logoH * 2 })
        .toBuffer(),
      blend: 'dest-in'
    }
  ])
  .png()
  .toBuffer()
const ogSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#141414" fill-opacity="0.78"/><rect y="610" width="1200" height="20" fill="#ea580c"/></svg>`
)
await sharp(heroSrc)
  .resize(1200, 630, { fit: 'cover' })
  .composite([{ input: ogSvg }, { input: whiteLogo, left: 80, top: 90 }])
  .jpeg({ quality: 82 })
  .toFile(path.join(imgDir, 'og-image.jpg'))

// ---------- data ----------
const services = [
  ...readJson('data/services.json'),
  ...readJson('data/services-ai.json')
]
const defaultGraphic =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
for (const s of services) {
  if (!s.graphic && s.graphicFrom)
    s.graphic = services.find(x => x.id === s.graphicFrom)?.graphic
  if (!s.graphic) s.graphic = defaultGraphic
}
// Order: core services, then AI, then JNH partner services
const order = { core: 0, ai: 1, jnh: 2 }
services.sort((a, b) => order[a.category] - order[b.category])

const usedIcons = new Set()
const faDir = r('node_modules', '@fortawesome', 'fontawesome-free', 'svgs')
const iconFile = id =>
  ['solid', 'brands']
    .map(k => path.join(faDir, k, `${id}.svg`))
    .find(f => fs.existsSync(f))

const data = {
  i18n: {
    en: readJson('data/i18n/en.json'),
    ar: readJson('data/i18n/ar.json')
  },
  services,
  projects: readJson('data/projects.json'),
  sa: readJson('data/sa-landing.json'),
  saUrl: lang => (lang === 'ar' ? '/ar/' : '/') + SA_SLUG + '/',
  img: (u, w) =>
    /unsplash\.com/.test(u)
      ? u.replace(/([?&])w=\d+/, `$1w=${w}`).replace(/([?&])q=\d+/, '$1q=70')
      : u,
  hasIcon: name => Boolean(iconFile(name.replace(/^fa-/, ''))),
  assets: {
    css: cssHref,
    landingCss: landingHref,
    js: jsSrc,
    logo: '/img/logo.png',
    logoW,
    logoH,
    og: '/img/og-image.jpg',
    hero,
    fonts: fontFiles
  }
}

const S = T.SITE
data.orgLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${S.url}/#org`,
  name: 'Loops Technologies',
  alternateName: 'لوبس تكنولوجيز',
  url: S.url,
  logo: `${S.url}/img/logo.png`,
  image: `${S.url}/img/og-image.jpg`,
  email: S.email,
  telephone: '+966597441504',
  foundingDate: '2013',
  founder: { '@type': 'Person', name: 'Mukarram Hussain' },
  description:
    'Software engineering studio in Riyadh and Lahore: web and mobile apps, ERP, ZATCA e-invoicing, private AI and computer vision.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6943 Ibn Aous Road',
    addressLocality: 'Riyadh',
    addressCountry: 'SA'
  },
  location: [
    {
      '@type': 'Place',
      name: 'Riyadh Office',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '6943 Ibn Aous Road',
        addressLocality: 'Riyadh',
        addressCountry: 'SA'
      }
    },
    {
      '@type': 'Place',
      name: 'Lahore Office',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '73 3 D1 Green Town',
        addressLocality: 'Lahore',
        addressCountry: 'PK'
      }
    }
  ],
  areaServed: [
    { '@type': 'Country', name: 'Saudi Arabia' },
    { '@type': 'Country', name: 'Pakistan' }
  ],
  knowsAbout: [
    'Custom software',
    'ERP',
    'ZATCA e-invoicing',
    'Artificial intelligence',
    'Computer vision',
    'On-premise GPU deployment'
  ]
}

// ---------- pages ----------
const routes = [] // { alternates:{en,ar}, lastmod }
const altFor = p => ({ en: '/' + p, ar: '/ar/' + p })

function emitPage(rel, lang, build, alternates) {
  const ctx = T.makeCtx(lang, data, usedIcons)
  const page = build(ctx)
  page.alternates = alternates
  write(rel, T.layout(ctx, page))
}

const pages = [
  ['', ctx => T.homePage(ctx)],
  ['services/', ctx => T.servicesPage(ctx)],
  ['ai-solutions/', ctx => T.servicesPage(ctx, true)],
  ['projects/', ctx => T.projectsPage(ctx)],
  ['about/', ctx => T.aboutPage(ctx)],
  ['contact/', ctx => T.contactPage(ctx)],
  ['partners/jnh-systems/', ctx => T.partnerPage(ctx)],
  ...services.map(s => [
    `services/${s.id}/`,
    ctx => T.serviceDetailPage(ctx, s)
  ])
]
for (const [p, build] of pages) {
  const alternates = altFor(p)
  emitPage(`${p}index.html`, 'en', build, alternates)
  emitPage(`ar/${p}index.html`, 'ar', build, alternates)
  routes.push({
    alternates,
    priority:
      p === ''
        ? '1.0'
        : p.startsWith('services/') && p !== 'services/'
          ? '0.7'
          : '0.8'
  })
}
const saAlt = { en: '/' + SA_SLUG + '/', ar: '/ar/' + SA_SLUG + '/' }
emitPage(SA_SLUG + '/index.html', 'en', T.saLanding, saAlt)
emitPage('ar/' + SA_SLUG + '/index.html', 'ar', T.saLanding, saAlt)
routes.push({ alternates: saAlt, priority: '1.0' })

// 404 (English shell; served with a real 404 status by .htaccess)
emitPage('404.html', 'en', T.notFoundPage, { en: '/404.html', ar: '/404.html' })

// ---------- icon sprite ----------
let sprite = '<svg xmlns="http://www.w3.org/2000/svg">'
const missing = []
for (const id of [...usedIcons].sort()) {
  const f = iconFile(id)
  if (!f) {
    missing.push(id)
    continue
  }
  const svg = fs.readFileSync(f, 'utf8')
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1]
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/svg>\s*$/, '')
  sprite += `<symbol id="i-${id}" viewBox="${viewBox}">${inner}</symbol>`
}
sprite += '</svg>'
write('img/icons.svg', sprite)
if (missing.length)
  console.warn('! Icons not found in Font Awesome Free:', missing.join(', '))

// ---------- sitemap, robots, static files ----------
const xhtml = a =>
  `<xhtml:link rel="alternate" hreflang="en" href="${S.url}${a.en}"/><xhtml:link rel="alternate" hreflang="ar" href="${S.url}${a.ar}"/><xhtml:link rel="alternate" hreflang="x-default" href="${S.url}${a.en}"/>`
const urls = routes.flatMap(rt =>
  ['en', 'ar'].map(
    l =>
      `  <url><loc>${S.url}${rt.alternates[l]}</loc><lastmod>${today}</lastmod><priority>${rt.priority}</priority>${xhtml(rt.alternates)}</url>`
  )
)
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
)

// public/ is copied as-is (.htaccess, robots.txt, contact.php, search-console file)
const copyDir = (src, dst) => {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      copyDir(s, d)
    } else fs.copyFileSync(s, d)
  }
}
copyDir(r('public'), DIST)

const count = fs
  .readdirSync(DIST, { recursive: true })
  .filter(f => f.endsWith('.html')).length
console.log(`Built ${count} HTML pages, ${usedIcons.size} icons -> dist/`)
