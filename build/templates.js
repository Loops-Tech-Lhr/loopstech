// HTML templates. Every function returns a string; no DOM, no runtime JS needed to read the page.
export const SITE = {
  url: 'https://loopstech.com',
  whatsapp: '966597441504',
  email: 'info@loopstech.com',
  jnhUrl: 'https://jnhsystems.com',
  jnhEmail: 'info@jnhsystems.com',
  riyadhPhone: '+966 59 744 1504',
  lahorePhone: '+92 312 4277939',
  // Number used on the construction campaign landing page only (call + WhatsApp)
  campaign: {
    phone: '+966 59 167 9165',
    tel: '+966591679165',
    whatsapp: '966591679165'
  }
}

export const esc = s =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const stripTags = s => String(s).replace(/<[^>]*>/g, '')

// ---------- context ----------

export function makeCtx(lang, data, usedIcons) {
  const dict = data.i18n[lang]
  const get = path =>
    path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict)
  const t = path => {
    const v = get(path)
    if (v === undefined)
      throw new Error(`Missing i18n key "${path}" for ${lang}`)
    return v
  }
  const base = lang === 'ar' ? '/ar/' : '/'
  const url = (p = '') => base + p
  const L = obj => obj[lang] ?? obj.en
  const icon = (name, cls = '') => {
    const id = name.replace(/^fa-/, '')
    usedIcons.add(id)
    return `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="/img/icons.svg#i-${id}"></use></svg>`
  }
  return {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    data,
    t,
    get,
    url,
    L,
    icon
  }
}

const waLink = (ctx, text, number = SITE.whatsapp) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text ?? (ctx.lang === 'ar' ? 'مرحباً، أود الاستفسار عن خدماتكم' : 'Hello, I would like to ask about your services'))}`

const arrow = ctx => ctx.icon('fa-arrow-right', 'flip-rtl')

// ---------- layout ----------

export function layout(ctx, page) {
  const { lang, dir, t, data } = ctx
  const isSa = (page.bodyClass || '').split(' ').includes('sa-page')
  const contact = isSa
    ? SITE.campaign
    : { phone: SITE.riyadhPhone, tel: '+966597441504', whatsapp: SITE.whatsapp }
  const other = lang === 'ar' ? 'en' : 'ar'
  const alt = page.alternates
  const canonical = SITE.url + alt[lang]
  const title = esc(page.title)
  const desc = esc(page.description)
  const ogImage = `${SITE.url}${data.assets.og}`
  const fontPreload =
    lang === 'ar'
      ? data.assets.fonts.filter(f => f.includes('arabic-400'))
      : data.assets.fonts.filter(f => f.includes('latin-400'))
  const navItems = [
    ['home', ''],
    ['services', 'services/'],
    ['ai_solutions', 'ai-solutions/'],
    ['saudi', null],
    ['portfolio', 'projects/'],
    ['about', 'about/'],
    ['contact', 'contact/']
  ]
  const hrefFor = (key, p) => (key === 'saudi' ? data.saUrl(lang) : ctx.url(p))
  const isActive = (key, p) =>
    page.nav === key || (key === 'services' && page.nav === 'services')
  const navHtml = cls =>
    navItems
      .map(([key, p]) => {
        const href = hrefFor(key, p)
        const hi = key === 'saudi' ? ' nav-highlight' : ''
        const act = isActive(key, p) ? ' active' : ''
        const cur = isActive(key, p) ? ' aria-current="page"' : ''
        return `<a href="${href}" class="${cls}${hi}${act}"${cur}>${t('nav.' + key)}</a>`
      })
      .join('')

  const jsonld = [data.orgLd, ...(page.jsonld || [])]
    .map(
      o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`
    )
    .join('\n    ')

  const css = [data.assets.css, ...(page.extraCss || [])]
    .map(h => `<link rel="stylesheet" href="${h}">`)
    .join('\n    ')

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https://images.unsplash.com; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="en" href="${SITE.url}${alt.en}">
    <link rel="alternate" hreflang="ar" href="${SITE.url}${alt.ar}">
    <link rel="alternate" hreflang="x-default" href="${SITE.url}${alt.en}">
    <meta name="robots" content="${page.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
    <meta name="theme-color" content="#141414">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(t('site.name'))}">
    <meta property="og:locale" content="${lang === 'ar' ? 'ar_SA' : 'en_US'}">
    <meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_US' : 'ar_SA'}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${ogImage}">
    <link rel="icon" type="image/png" href="/img/loopstech-favicon.png">
    <link rel="apple-touch-icon" href="/img/loopstech-favicon.png">
    ${fontPreload.map(f => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n    ')}
    ${page.preload || ''}
    ${css}
    ${jsonld}
  </head>
  <body class="${page.bodyClass || ''}">
    <a class="skip-link" href="#main">${t('nav.skip')}</a>
    <header class="site-header">
      <div class="container">
        <a href="${ctx.url()}" aria-label="${esc(t('site.name'))}">
          <img src="${data.assets.logo}" alt="${esc(t('site.name'))}" width="${data.assets.logoW}" height="${data.assets.logoH}" style="height:34px;width:auto">
        </a>
        <nav class="desktop-nav" aria-label="Main">${navHtml('nav-link')}</nav>
        <div class="header-actions">
          <div class="lang-switch" role="group" aria-label="${esc(t('nav.language'))}">
            <a href="${alt.en}" hreflang="en" lang="en" class="lang-btn${lang === 'en' ? ' is-active' : ''}"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a>
            <a href="${alt.ar}" hreflang="ar" lang="ar" class="lang-btn${lang === 'ar' ? ' is-active' : ''}"${lang === 'ar' ? ' aria-current="true"' : ''}>عربي</a>
          </div>
          ${isSa ? `<a href="tel:${contact.tel}" class="header-phone" dir="ltr">${ctx.icon('fa-phone')}<span>${contact.phone}</span></a>` : ''}
          <a href="${waLink(ctx, undefined, contact.whatsapp)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm header-wa">
            ${ctx.icon('fa-whatsapp')}<span>${t('nav.live_chat')}</span>
          </a>
          <button id="mobile-menu-btn" class="icon-btn menu-btn" type="button" aria-label="${esc(t('nav.menu_open'))}" aria-expanded="false" aria-controls="mobile-menu">
            ${ctx.icon('fa-bars')}
          </button>
        </div>
      </div>
    </header>

    <div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="mobile-menu-top">
        <img src="${data.assets.logo}" alt="" width="${data.assets.logoW}" height="${data.assets.logoH}" style="height:30px;width:auto">
        <button id="close-menu" class="icon-btn" type="button" aria-label="${esc(t('nav.menu_close'))}">${ctx.icon('fa-xmark')}</button>
      </div>
      <nav aria-label="Mobile">${navHtml('mobile-link')}</nav>
    </div>

    <main id="main" tabindex="-1">
${page.body}
    </main>

${footer(ctx, contact)}
    <script src="${data.assets.js}" defer></script>
  </body>
</html>
`
}

function footer(ctx, contact) {
  const { t, url, data, lang } = ctx
  return `    <footer class="site-footer">
      <div class="container" style="padding-top:64px;padding-bottom:32px">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="${data.assets.logo}" alt="${esc(t('site.name'))}" width="${data.assets.logoW}" height="${data.assets.logoH}" class="footer-logo">
            <p style="max-width:420px;margin-bottom:20px">${t('footer.desc')}</p>
            <p class="footer-contact"><a href="tel:${contact.tel}" dir="ltr">${contact.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
          </div>
          <div>
            <h2 class="footer-h">${t('footer.expertise_title')}</h2>
            <ul class="footer-list">
              <li><a href="${url('services/web-apps/')}">${t('footer.link_web')}</a></li>
              <li><a href="${url('services/mobile-apps/')}">${t('footer.link_mobile')}</a></li>
              <li><a href="${url('ai-solutions/')}">${t('footer.link_ai')}</a></li>
              <li><a href="${url('services/erp-crm/')}">${t('footer.link_erp')}</a></li>
            </ul>
          </div>
          <div>
            <h2 class="footer-h">${t('footer.work_with_us_title')}</h2>
            <ul class="footer-list">
              <li><a href="${data.landingUrl('construction', lang)}">${t('footer.link_construction')}</a></li>
              <li><a href="${data.landingUrl('logistics', lang)}">${t('footer.link_logistics')}</a></li>
              <li><a href="${data.landingUrl('realestate', lang)}">${t('footer.link_realestate')}</a></li>
              <li><a href="${data.landingUrl('healthcare', lang)}">${t('footer.link_healthcare')}</a></li>
              <li><a href="${data.landingUrl('retail', lang)}">${t('footer.link_retail')}</a></li>
              <li><a href="${data.landingUrl('tourism', lang)}">${t('footer.link_tourism')}</a></li>
              <li><a href="${data.landingUrl('education', lang)}">${t('footer.link_education')}</a></li>
              <li><a href="${data.landingUrl('consulting', lang)}">${t('footer.link_consulting')}</a></li>
              <li><a href="${url('partners/jnh-systems/')}">${t('footer.link_partner')}</a></li>
              <li><a href="${url('about/')}">${t('footer.link_journey')}</a></li>
              <li><a href="${url('contact/')}">${t('footer.link_start')}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${t('footer.copyright')}</p>
          <p style="max-width:520px">${t('footer.quote')}</p>
        </div>
      </div>
    </footer>`
}

// ---------- fragments ----------

const sectionHead = (eyebrow, heading, extra = '') => `
      <div class="section-head split reveal-on-scroll">
        <div class="max-w-2xl">
          <span class="eyebrow">${eyebrow}</span>
          <h2 class="heading">${heading}</h2>
        </div>
        ${extra}
      </div>`

const pageHead = (eyebrow, h1, lead = '') => `
    <section class="page-head">
      <div class="container">
        <span class="eyebrow">${eyebrow}</span>
        <h1 class="display" style="margin:16px 0 20px">${h1}</h1>
        ${lead ? `<p class="lead">${lead}</p>` : ''}
      </div>
    </section>`

function partnerBadge(ctx) {
  return `<span class="badge-partner">${ctx.icon('fa-handshake')}${ctx.t('services.partner_label')}</span>`
}

function serviceCell(ctx, s, idx) {
  const { L, t, icon, url } = ctx
  return `
        <a href="${url('services/' + s.id + '/')}" class="cell reveal-on-scroll" style="transition-delay:${(idx % 3) * 0.05}s">
          ${icon(s.icon, 'cell-icon')}
          <h3 class="cell-title">${L(s.title)}</h3>
          <p class="cell-text">${L(s.description)}</p>
          ${s.category === 'jnh' ? partnerBadge(ctx) : ''}
          <span class="link-arrow">${t('services.learn_more')} ${arrow(ctx)}</span>
        </a>`
}

function projectCard(ctx, p, idx) {
  const { L } = ctx
  return `
        <article class="project-card reveal-on-scroll" style="transition-delay:${(idx % 2) * 0.08}s">
          <div class="project-media">
            <img src="${ctx.data.img(p.img, 700)}" alt="${esc(p.title)}" width="700" height="438" loading="lazy" decoding="async">
          </div>
          <div class="project-body">
            <span class="eyebrow">${L(p.type)}</span>
            <h3>${esc(p.title)}</h3>
            <p>${L(p.description)}</p>
          </div>
        </article>`
}

function faqBlock(items) {
  return items
    .map(
      ({ q, a }) => `
          <details class="faq-item reveal-on-scroll">
            <summary>${q}</summary>
            <p>${a}</p>
          </details>`
    )
    .join('')
}

const faqLd = items => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
})

const breadcrumbLd = (ctx, crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: SITE.url + path
  }))
})

// ---------- contact form (shared by /contact and /sa) ----------

export function contactForm(ctx, { source, labels, options }) {
  const { lang } = ctx
  return `
            <form id="contact-form" class="contact-form" action="/contact.php" method="post" novalidate
              data-sending="${esc(labels.sending)}" data-success="${esc(labels.success)}" data-error="${esc(labels.error)}">
              <input type="hidden" name="lang" value="${lang}">
              <input type="hidden" name="source" value="${source}">
              <div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
              <div class="grid-2">
                <div class="field">
                  <label for="f-name">${labels.name}</label>
                  <input id="f-name" class="input" type="text" name="name" required autocomplete="name" placeholder="${esc(labels.placeholder_name || '')}">
                </div>
                <div class="field">
                  <label for="f-email">${labels.email}</label>
                  <input id="f-email" class="input" type="email" name="email" required autocomplete="email" dir="ltr" placeholder="name@company.com">
                </div>
              </div>
              ${
                labels.company
                  ? `<div class="grid-2">
                <div class="field">
                  <label for="f-company">${labels.company}</label>
                  <input id="f-company" class="input" type="text" name="company" autocomplete="organization">
                </div>
                <div class="field">
                  <label for="f-phone">${labels.phone}</label>
                  <input id="f-phone" class="input" type="tel" name="phone" autocomplete="tel" dir="ltr">
                </div>
              </div>`
                  : ''
              }
              <div class="field">
                <label for="f-service">${labels.project}</label>
                <select id="f-service" class="input" name="service">
                  ${options.map(o => `<option>${esc(o)}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <label for="f-message">${labels.message}</label>
                <textarea id="f-message" class="input" name="message" rows="5" required placeholder="${esc(labels.placeholder_message || '')}"></textarea>
              </div>
              <p class="form-status" role="status" aria-live="polite"></p>
              <div><button type="submit" class="btn btn-primary">${labels.submit}</button></div>
            </form>`
}

// ---------- pages ----------

export function homePage(ctx) {
  const { t, get, data, url, icon, lang } = ctx
  const heroSrcset = data.assets.hero.map(h => `${h.src} ${h.w}w`).join(', ')
  const stats = [
    [t('home.stats_projects'), t('home.stats_projects_text')],
    [t('hero.expertise'), t('hero.expertise_text')],
    [t('home.stats_riyadh'), t('home.stats_riyadh_text')],
    [t('home.stats_lahore'), t('home.stats_lahore_text')]
  ]
  const services = data.services
    .filter(s => s.category === 'core')
    .slice(0, 3)
    .concat(
      data.services.filter(s =>
        ['ai-solutions', 'private-ai', 'computer-vision-ais'].includes(s.id)
      )
    )
  const body = `
    <section class="hero hero-home">
      <div class="blob b1" aria-hidden="true"></div>
      <div class="blob b2" aria-hidden="true"></div>
      <div class="container hero-grid">
        <div>
          <span class="eyebrow rise" style="--i:0">${t('hero.badge')}</span>
          <h1 class="display rise" style="margin:20px 0 24px;--i:1">
            ${t('hero.title_bold')} <span class="accent">${t('hero.title_ideas')}</span>
            ${t('hero.title_smart')} <span class="accent">${t('hero.title_code')}</span>.
          </h1>
          <p class="lead rise" style="margin-bottom:32px;--i:2">${t('hero.subtitle')}</p>
          <div class="btn-row rise" style="--i:3">
            <a href="${url('contact/')}" class="btn btn-primary">${t('hero.btn_audit')}</a>
            <a href="${data.saUrl(lang)}" class="btn btn-outline">${t('hero.btn_saudi')}</a>
          </div>
        </div>
        <div class="rise" style="--i:2">
          <div class="hero-media">
            <img src="${data.assets.hero[0].src}" srcset="${heroSrcset}" sizes="(min-width:1024px) 560px, 100vw" alt="${esc(t('hero.image_alt'))}" width="${data.assets.hero[0].w}" height="${data.assets.hero[0].h}" fetchpriority="high" decoding="async">
          </div>
          <div class="hero-caption">
            <span>${icon('fa-robot')}${t('hero.caption_ai')}</span>
            <span>${icon('fa-code')}${t('hero.caption_code')}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${[0, 1].map(() => `<span>${['Laravel', 'React', 'Flutter', 'Python', 'PyTorch', 'NVIDIA CUDA', 'PostgreSQL', 'ZATCA e-invoicing', 'Arabic NLP', 'Computer vision', 'Edge AI', 'ERP', 'WhatsApp automation'].join('</span><span>')}</span>`).join('')}
      </div>
    </div>

    <div class="container">
      <div class="stats">
        ${stats.map(([v, l]) => `<div class="stat"><div class="stat-value"${/\d/.test(v) ? ' data-count' : ''}>${v}</div><div class="stat-label">${l}</div></div>`).join('')}
      </div>
    </div>

    <section class="section">
      <div class="container">
        ${sectionHead(t('home.services_badge'), t('home.services_title'), `<a href="${url('services/')}" class="link-arrow">${t('home.services_all')} ${arrow(ctx)}</a>`)}
        <div class="cells cells-3">${services.map((s, i) => serviceCell(ctx, s, i)).join('')}</div>
      </div>
    </section>

    <section class="section section-dark promo">
      <div class="container promo-grid">
        <div>
          <span class="eyebrow">${t('home.saudi_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.saudi_title')}</h2>
          <p style="max-width:520px">${t('home.saudi_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.saUrl(lang)}" class="btn btn-primary">${t('home.saudi_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.logistics_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.logistics_title')}</h2>
          <p style="max-width:520px">${t('home.logistics_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('logistics', lang)}" class="btn btn-primary">${t('home.logistics_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.realestate_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.realestate_title')}</h2>
          <p style="max-width:520px">${t('home.realestate_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('realestate', lang)}" class="btn btn-primary">${t('home.realestate_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.healthcare_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.healthcare_title')}</h2>
          <p style="max-width:520px">${t('home.healthcare_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('healthcare', lang)}" class="btn btn-primary">${t('home.healthcare_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.retail_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.retail_title')}</h2>
          <p style="max-width:520px">${t('home.retail_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('retail', lang)}" class="btn btn-primary">${t('home.retail_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.tourism_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.tourism_title')}</h2>
          <p style="max-width:520px">${t('home.tourism_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('tourism', lang)}" class="btn btn-primary">${t('home.tourism_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.education_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.education_title')}</h2>
          <p style="max-width:520px">${t('home.education_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('education', lang)}" class="btn btn-primary">${t('home.education_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.consulting_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.consulting_title')}</h2>
          <p style="max-width:520px">${t('home.consulting_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${data.landingUrl('consulting', lang)}" class="btn btn-primary">${t('home.consulting_cta')} ${arrow(ctx)}</a></div>
        </div>
        <div>
          <span class="eyebrow">${t('home.partner_badge')}</span>
          <h2 class="heading" style="margin:10px 0 14px">${t('home.partner_title')}</h2>
          <p style="max-width:520px">${t('home.partner_text')}</p>
          <div class="btn-row" style="margin-top:28px"><a href="${url('partners/jnh-systems/')}" class="btn btn-light">${t('home.partner_cta')} ${arrow(ctx)}</a></div>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead(t('home.specialized_badge'), t('home.specialized_title'))}
        <div class="cells cells-4">
          ${get('home.industries')
            .map(
              (it, i) => `
          <div class="cell reveal-on-scroll" style="transition-delay:${i * 0.05}s">
            ${icon(it.icon, 'cell-icon')}
            <h3 class="cell-title">${it.title}</h3>
            <p class="cell-text" style="margin-bottom:0">${it.desc}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead(t('home.process_badge'), t('home.process_title'))}
        <div class="cells cells-4">
          ${get('home.process')
            .map(
              (p, i) => `
          <div class="cell reveal-on-scroll" style="transition-delay:${i * 0.05}s">
            <span class="cell-num">0${i + 1}</span>
            <h3 class="cell-title">${p.title}</h3>
            <p class="cell-text" style="margin-bottom:0">${p.desc}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead(t('home.work_badge'), t('home.work_title'), `<a href="${url('projects/')}" class="link-arrow">${t('home.work_all')} ${arrow(ctx)}</a>`)}
        <div class="grid-2 gap-lg">${data.projects
          .slice(0, 2)
          .map((p, i) => projectCard(ctx, p, i))
          .join('')}</div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container cta-band">
        <div style="max-width:560px">
          <h2 class="heading">${t('home.cta_title')}</h2>
          <p style="margin-top:12px">${t('home.cta_text')}</p>
        </div>
        <a href="${url('contact/')}" class="btn btn-primary">${t('home.cta_btn')} ${arrow(ctx)}</a>
      </div>
    </section>`
  return {
    title: t('seo.home_title'),
    description: t('seo.home_desc'),
    nav: 'home',
    body,
    preload: `<link rel="preload" as="image" href="${data.assets.hero[0].src}" imagesrcset="${heroSrcset}" imagesizes="(min-width:1024px) 560px, 100vw" fetchpriority="high">`
  }
}

export function servicesPage(ctx, aiOnly = false) {
  const { t, data, L } = ctx
  const groups = aiOnly
    ? [
        ['group_ai', data.services.filter(s => s.category === 'ai')],
        ['group_jnh', data.services.filter(s => s.category === 'jnh')]
      ]
    : [
        ['group_core', data.services.filter(s => s.category === 'core')],
        ['group_ai', data.services.filter(s => s.category === 'ai')],
        ['group_jnh', data.services.filter(s => s.category === 'jnh')]
      ]
  const body = `${pageHead(t('services.badge'), aiOnly ? t('services.ai_title') : t('services.title'), aiOnly ? t('services.ai_subtitle') : t('services.subtitle'))}
    <section class="section">
      <div class="container" style="display:grid;gap:56px">
        ${groups
          .map(
            ([key, list]) => `
        <div>
          <h2 class="group-title">${t('services.' + key)}</h2>
          <div class="cells cells-3">${list.map((s, i) => serviceCell(ctx, s, i)).join('')}</div>
        </div>`
          )
          .join('')}
      </div>
    </section>`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: data.services
      .filter(s => (aiOnly ? s.category !== 'core' : true))
      .map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: L(s.title),
        url: SITE.url + ctx.url('services/' + s.id + '/')
      }))
  }
  return {
    title: aiOnly ? t('seo.ai_title') : t('seo.services_title'),
    description: aiOnly ? t('seo.ai_desc') : t('seo.services_desc'),
    nav: aiOnly ? 'ai_solutions' : 'services',
    body,
    jsonld: [ld]
  }
}

export function serviceDetailPage(ctx, s) {
  const { t, L, data, url, icon } = ctx
  const others = data.services.filter(x => x.id !== s.id).slice(0, 6)
  const paragraphs = L(s.longDescription)
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p>${p}</p>`)
    .join('')
  const features = (s.features || [])
    .map(
      f => `
          <div class="cell">
            ${icon(f.icon, 'cell-icon')}
            <h3 class="cell-title">${L(f.title)}</h3>
            <p class="cell-text" style="margin-bottom:0">${L(f.description)}</p>
          </div>`
    )
    .join('')
  const benefits = (s.benefits || [])
    .map(b => `<li>${icon('fa-check')}<span>${L(b)}</span></li>`)
    .join('')
  const tech = (s.technologies || [])
    .map(
      x =>
        `<span class="tag">${x.icon && data.hasIcon(x.icon) ? icon(x.icon) : ''}${esc(x.name)}</span>`
    )
    .join('')
  const graphic = data.img(s.graphic, 1000)
  const title = L(s.title)
  const body = `
    <section class="page-head">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="${url('services/')}">${t('services.breadcrumb')}</a>
          ${icon('fa-chevron-right', 'flip-rtl')}
          <span aria-current="page">${title}</span>
        </nav>
        <h1 class="display" style="margin:20px 0">${title}</h1>
        <p class="lead">${L(s.description)}</p>
        ${s.category === 'jnh' ? `<p class="partner-note">${icon('fa-handshake')}<span>${t('services.partner_note')} <a href="${url('partners/jnh-systems/')}" class="link-arrow">${t('home.partner_cta')}</a></span></p>` : ''}
      </div>
    </section>
    <section class="section">
      <div class="container detail-grid">
        <div style="display:grid;gap:56px;align-content:start">
          <img src="${graphic}" alt="${esc(s.title.en)}" width="1000" height="500" style="width:100%;aspect-ratio:2/1;object-fit:cover;border:1px solid var(--line)" decoding="async">
          <div class="prose-body">${paragraphs}</div>
          ${features ? `<div class="cells cells-2">${features}</div>` : ''}
          ${
            benefits
              ? `<div class="section-dark" style="padding:40px">
            <h2 class="heading" style="margin-bottom:16px">${t('services.why')}</h2>
            <ul class="check-list">${benefits}</ul>
            <div style="margin-top:32px"><a href="${url('contact/')}" class="btn btn-primary">${t('services.hire')}</a></div>
          </div>`
              : ''
          }
        </div>
        <aside>
          <div class="side-box sticky">
            <h2 class="eyebrow" style="margin-bottom:12px">${t('services.badge')}</h2>
            ${others.map(o => `<a href="${url('services/' + o.id + '/')}" class="side-link">${icon(o.icon)}<span>${L(o.title)}</span></a>`).join('')}
            ${tech ? `<div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--line)"><h2 class="eyebrow" style="margin-bottom:14px">${t('services.stack')}</h2><div class="tag-row">${tech}</div></div>` : ''}
          </div>
        </aside>
      </div>
    </section>`
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description: stripTags(L(s.description)),
      serviceType: title,
      provider: { '@id': SITE.url + '/#org' },
      areaServed: [
        { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'Pakistan' }
      ],
      url: SITE.url + url('services/' + s.id + '/')
    },
    breadcrumbLd(ctx, [
      [t('nav.home'), url()],
      [t('services.breadcrumb'), url('services/')],
      [title, url('services/' + s.id + '/')]
    ])
  ]
  return {
    title: `${title} | ${t('site.name')}`,
    description: stripTags(L(s.description)),
    nav: 'services',
    body,
    jsonld: ld
  }
}

export function projectsPage(ctx) {
  const { t, data } = ctx
  const body = `${pageHead(t('portfolio.badge'), t('portfolio.title'), t('portfolio.subtitle'))}
    <section class="section">
      <div class="container">
        <div class="grid-3 gap-lg">${data.projects.map((p, i) => projectCard(ctx, p, i)).join('')}</div>
      </div>
    </section>`
  return {
    title: `${t('seo.projects_title')} | ${t('site.name')}`,
    description: t('seo.projects_desc'),
    nav: 'portfolio',
    body
  }
}

export function aboutPage(ctx) {
  const { t, get, data } = ctx
  const faq = get('about.faq')
  const body = `${pageHead(t('about.badge'), t('about.title'))}
    <section class="section">
      <div class="container grid-2 gap-lg" style="align-items:start">
        <div class="reveal-on-scroll" style="display:grid;gap:24px">
          <p class="lead" style="font-size:17px">${t('about.text1')}</p>
          <p class="lead" style="font-size:17px;color:var(--ink);border-inline-start:2px solid var(--brand);padding-inline-start:24px">${t('about.text2')}</p>
          <p class="lead">${t('about.text3')}</p>
        </div>
        <div class="reveal-on-scroll">
          <img src="${data.img('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80', 900)}" alt="${esc(t('about.image_alt'))}" width="900" height="675" loading="lazy" decoding="async" style="width:100%;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--line)">
          <div class="stats" style="grid-template-columns:1fr 1fr;border-top:0">
            <div class="stat"><div class="stat-value">${t('about.quality_audit')}</div><div class="stat-label">${t('about.quality_audit_text')}</div></div>
            <div class="stat"><div class="stat-value">${t('hero.expertise')}</div><div class="stat-label">${t('hero.expertise_text')}</div></div>
          </div>
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container" style="max-width:860px">
        ${sectionHead(t('about.faq_badge'), t('about.faq_title'))}
        <div class="faq">${faqBlock(faq)}</div>
      </div>
    </section>`
  return {
    title: `${t('seo.about_title')} | ${t('site.name')}`,
    description: t('seo.about_desc'),
    nav: 'about',
    body,
    jsonld: [faqLd(faq)]
  }
}

export function contactPage(ctx) {
  const { t, get } = ctx
  const labels = {
    name: t('contact.label_name'),
    email: t('contact.label_email'),
    project: t('contact.label_project_type'),
    message: t('contact.label_message'),
    submit: t('contact.btn_send'),
    sending: t('contact.sending'),
    success: t('contact.success_text'),
    error: t('contact.error_text'),
    placeholder_name: t('contact.placeholder_name'),
    placeholder_message: t('contact.placeholder_message')
  }
  const body = `${pageHead(t('contact.badge'), t('contact.title'), t('contact.subtitle'))}
    <section class="section">
      <div class="container contact-grid">
        <div class="reveal-on-scroll">${contactForm(ctx, { source: 'contact', labels, options: get('contact.project_types') })}
        </div>
        <aside class="reveal-on-scroll">
          <div class="side-box" style="display:grid;gap:28px">
            <div>
              <h2 class="eyebrow" style="margin-bottom:10px">${t('contact.office_riyadh')}</h2>
              <p>${t('contact.riyadh_address')}</p>
              <a href="tel:+966597441504" class="link-arrow" style="margin-top:10px" dir="ltr">${SITE.riyadhPhone}</a>
            </div>
            <div style="padding-top:24px;border-top:1px solid var(--line)">
              <h2 class="eyebrow" style="margin-bottom:10px">${t('contact.office_lahore')}</h2>
              <p>${t('contact.lahore_address')}</p>
              <a href="tel:+923124277939" class="link-arrow" style="margin-top:10px" dir="ltr">${SITE.lahorePhone}</a>
            </div>
            <div style="padding-top:24px;border-top:1px solid var(--line)">
              <h2 class="eyebrow" style="margin-bottom:10px">${t('contact.direct_email')}</h2>
              <a href="mailto:${SITE.email}" class="link-arrow">${SITE.email}</a>
              <div style="margin-top:14px"><a href="${waLink(ctx)}" target="_blank" rel="noopener" class="link-arrow">${t('contact.whatsapp')}</a></div>
            </div>
          </div>
        </aside>
      </div>
    </section>`
  return {
    title: `${t('seo.contact_title')} | ${t('site.name')}`,
    description: t('seo.contact_desc'),
    nav: 'contact',
    body
  }
}

export function partnerPage(ctx) {
  const { t, get, data, url, icon, L } = ctx
  const jnh = data.services.filter(s => s.category === 'jnh')
  const body = `${pageHead(t('partner.badge'), t('partner.title'), t('partner.lead'))}
    <section class="section">
      <div class="container grid-2 gap-lg" style="align-items:start">
        <div class="reveal-on-scroll" style="display:grid;gap:20px">
          <h2 class="heading">${t('partner.jnh_title')}</h2>
          <p class="lead">${t('partner.jnh_text')}</p>
          <h3 class="eyebrow" style="margin-top:12px">${t('partner.sectors_title')}</h3>
          <div class="tag-row">${get('partner.sectors')
            .map(x => `<span class="tag">${x}</span>`)
            .join('')}</div>
          <div class="btn-row" style="margin-top:12px"><a href="${SITE.jnhUrl}" target="_blank" rel="noopener" class="btn btn-outline">${t('partner.visit')}</a></div>
        </div>
        <div class="side-box reveal-on-scroll" style="display:grid;gap:12px">
          <h3 class="eyebrow">${t('partner.contact_title')}</h3>
          <p>${icon('fa-location-dot')} ${t('partner.location')}</p>
          <a href="mailto:${SITE.jnhEmail}" class="link-arrow" style="justify-self:start">${SITE.jnhEmail}</a>
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        ${sectionHead(t('partner.badge'), t('partner.offers_title'))}
        <div class="cells cells-2">${jnh.map((s, i) => serviceCell(ctx, s, i)).join('')}</div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${sectionHead('', t('partner.path_title'))}
        <div class="cells cells-3">
          ${get('partner.path')
            .map(
              (p, i) => `
          <div class="cell reveal-on-scroll"><span class="cell-num">0${i + 1} · ${p.badge}</span><h3 class="cell-title">${p.title}</h3><p class="cell-text" style="margin-bottom:0">${p.text}</p></div>`
            )
            .join('')}
        </div>
        <div class="btn-row" style="margin-top:40px"><a href="${url('contact/')}" class="btn btn-primary">${t('hero.btn_audit')}</a><a href="${data.saUrl(ctx.lang)}" class="btn btn-outline">${t('hero.btn_saudi')}</a></div>
      </div>
    </section>`
  return {
    title: t('seo.partner_title'),
    description: t('seo.partner_desc'),
    nav: 'about',
    body,
    jsonld: [
      breadcrumbLd(ctx, [
        [t('nav.home'), url()],
        [t('footer.link_partner'), url('partners/jnh-systems/')]
      ])
    ]
  }
}

export function notFoundPage(ctx) {
  const { t, url } = ctx
  const body = `${pageHead('404', t('notfound.title'), t('notfound.text'))}
    <section class="section"><div class="container"><a href="${url()}" class="btn btn-primary">${t('notfound.home')}</a></div></section>`
  return {
    title: `${t('notfound.title')} | ${t('site.name')}`,
    description: t('notfound.text'),
    nav: '',
    body,
    noindex: true
  }
}

// ---------- Saudi landing page ----------

export function saLanding(ctx, key = 'construction') {
  const { lang, icon, data, url } = ctx
  const c = data.landings[key][lang]
  const t = ctx.t
  const wa = waLink(
    ctx,
    lang === 'ar'
      ? 'مرحباً، أود حجز دراسة تشغيلية مجانية'
      : 'Hello, I would like to book a free Operations Study',
    SITE.campaign.whatsapp
  )
  const form = c.form
  const labels = {
    name: form.name,
    email: form.email,
    company: form.company,
    phone: form.phone,
    project: form.interest,
    message: form.message,
    submit: form.submit,
    sending: form.sending,
    success: form.success,
    error: form.error
  }
  const mock = c.mock
  const mockView =
    c.mockType === 'doc'
      ? `<div class="mock-view docscan" aria-hidden="true">
            <div class="paper" dir="rtl">
              <i class="seal"></i>
              <i class="ln l1" style="--n:0"></i><i class="ln l2" style="--n:1"></i><i class="ln l3" style="--n:2"></i><i class="ln l4" style="--n:3"></i><i class="ln l5" style="--n:4"></i><i class="ln l6" style="--n:5"></i><i class="ln l7" style="--n:6"></i><i class="ln l8" style="--n:7"></i><i class="ln l9" style="--n:8"></i>
            </div>
            <div class="scan"></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
          </div>`
      : c.mockType === 'exam'
        ? `<div class="mock-view exam" aria-hidden="true">
            <div class="student s1"></div>
            <div class="student s2"></div>
            <div class="phone"></div>
            <div class="scan"></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-dev"><span>${mock.tag_extra}</span></div>
          </div>`
        : c.mockType === 'crowd'
          ? `<div class="mock-view crowd" aria-hidden="true">
            <div class="stage"></div>
            <div class="hz"></div>
            <div class="pack dense"></div>
            <div class="pack sparse"></div>
            <i class="staff"></i>
            <div class="scan"></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
          </div>`
          : c.mockType === 'store'
            ? `<div class="mock-view store" aria-hidden="true">
            <div class="heat h1"></div>
            <div class="heat h2"></div>
            <div class="shelf sh1"></div><div class="shelf sh2"></div><div class="shelf sh3"></div>
            <i class="cust c1"></i><i class="cust c2"></i><i class="cust c3"></i><i class="cust c4"></i>
            <div class="scan"></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
          </div>`
            : c.mockType === 'ward'
              ? `<div class="mock-view ward" aria-hidden="true">
            <div class="scan"></div>
            <div class="beds">
              <i class="bed occ"></i><i class="bed occ"></i><i class="bed free"></i><i class="bed occ"></i>
              <i class="bed occ"></i><i class="bed occ"></i><i class="bed occ"></i><i class="bed occ"></i>
            </div>
            <div class="corridor">
              <i class="pt" style="--d:0"></i><i class="pt" style="--d:1"></i><i class="pt" style="--d:2"></i><i class="pt" style="--d:3"></i>
            </div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
          </div>`
              : c.mockType === 'facade'
                ? `<div class="mock-view facade" aria-hidden="true">
            <div class="scan"></div>
            <div class="drone"></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
          </div>`
                : c.mockType === 'conveyor'
                  ? `<div class="mock-view conveyor" aria-hidden="true">
            <div class="scan-v"></div>
            <div class="belt"></div>
            <div class="parcel p1" style="--d:0"><span class="ptag ok">${mock.tag_ok}</span></div>
            <div class="parcel p2 bad" style="--d:1"><span class="ptag bad">${mock.tag_bad}</span></div>
            <div class="parcel p3" style="--d:2"><span class="ptag ok">${mock.tag_ok}</span></div>
          </div>`
                  : `<div class="mock-view" aria-hidden="true">
            <div class="scan"></div>
            <div class="worker w1"></div>
            <div class="worker w2"></div>
            <div class="box box-bad"><span>${mock.tag_bad}</span></div>
            <div class="box box-ok"><span>${mock.tag_ok}</span></div>
          </div>`
  const phone = SITE.campaign.phone
  const tel = 'tel:' + SITE.campaign.tel
  const ctaRow = (extra = '') => `
          <div class="cta-row${extra}">
            <a href="${tel}" class="btn btn-amber btn-lg" data-cta="call">${icon('fa-phone')}<span class="btn-stack"><small>${c.cta_call}</small><strong dir="ltr">${phone}</strong></span></a>
            <a href="${wa}" target="_blank" rel="noopener" class="btn btn-wa btn-lg" data-cta="whatsapp">${icon('fa-whatsapp')}<span>${c.cta_wa}</span></a>
            <a href="#book" class="btn btn-ghost btn-lg" data-cta="contact">${icon('fa-envelope')}<span>${c.cta_contact}</span></a>
          </div>`
  const body = `
    <section class="sa-hero">
      <div class="hazard-bar" aria-hidden="true"></div>
      <div class="sa-glow" aria-hidden="true"></div>
      <div class="container sa-hero-grid">
        <div>
          <span class="kicker rise" style="--i:0"><span class="live-dot" aria-hidden="true"></span>${c.kicker}</span>
          <h1 class="sa-title rise" style="--i:1">${c.title}</h1>
          <p class="sa-sub rise" style="--i:2">${c.subtitle}</p>
          <div class="rise" style="--i:3">${ctaRow()}</div>
          <p class="response-note rise" style="--i:4">${icon('fa-circle-check')}${c.response_note}</p>
          <ul class="chips rise" style="--i:5">${c.chips.map(x => `<li>${icon(x.icon)}${x.text}</li>`).join('')}</ul>
        </div>
        <div class="mock rise" style="--i:3" aria-label="${esc(mock.label)}">
          <div class="mock-top"><span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span><span class="mock-label">${mock.label}</span><span class="rec"><i></i>LIVE</span></div>
          ${mockView}
          <ul class="mock-feed">
            ${mock.rows.map(r => `<li class="lvl-${r.level}"><span class="pip"></span><span class="mock-text">${r.text}</span><span class="mock-time" dir="ltr">${r.time}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    </section>

    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">
        ${[0, 1].map(() => `<span>${c.ticker.join('</span><span>')}</span>`).join('')}
      </div>
    </div>

    <div class="container sa-stats-wrap">
      <div class="stats stats-dark">
        ${c.stats.map(s => `<div class="stat"><div class="stat-value"${s.count ? ' data-count' : ''}>${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
      </div>
    </div>

    <section class="section roles">
      <div class="container">
        ${sectionHead(c.roles.eyebrow, c.roles.title)}
        <div class="role-grid">
          ${c.roles.items
            .map(
              (r, i) => `
          <article class="role-card reveal-on-scroll" style="transition-delay:${i * 0.08}s">
            <div class="role-top">${icon(r.icon, 'role-icon')}<span class="role-who">${r.who}</span></div>
            <h3>${r.title}</h3>
            <p>${r.text}</p>
          </article>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead(c.problem.eyebrow, c.problem.title)}
        <div class="cells cells-4">
          ${c.problem.items
            .map(
              (p, i) => `
          <div class="cell reveal-on-scroll" style="transition-delay:${i * 0.05}s">
            ${icon(p.icon, 'cell-icon')}<h3 class="cell-title">${p.title}</h3><p class="cell-text" style="margin-bottom:0">${p.text}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="solutions">
      <div class="container">
        ${sectionHead(c.solutions.eyebrow, c.solutions.title)}
        <div class="bento">
          ${c.solutions.items
            .map(
              (s, i) => `
          <article class="bento-card bento-${i + 1} reveal-on-scroll">
            <div class="bento-top">${icon(s.icon, 'bento-icon')}<span class="bento-tag">${s.tag}</span></div>
            <h3>${s.title}</h3>
            <p>${s.text}</p>
            ${s.partner ? `<span class="badge-partner">${icon('fa-handshake')}${t('services.partner_label')}</span>` : ''}
          </article>`
            )
            .join('')}
        </div>
        <div class="inline-cta reveal-on-scroll">${ctaRow(' cta-compact')}</div>
      </div>
    </section>

    <section class="section section-dark gpu" id="private-ai">
      <div class="container gpu-grid">
        <div>
          <span class="eyebrow">${c.gpu.eyebrow}</span>
          <h2 class="heading" style="margin:10px 0 16px">${c.gpu.title}</h2>
          <p style="max-width:560px">${c.gpu.text}</p>
          <ul class="check-list" style="margin-top:20px;max-width:560px">${c.gpu.points.map(p => `<li>${icon('fa-check')}<span>${p}</span></li>`).join('')}</ul>
          <div class="btn-row" style="margin-top:28px"><a href="${url('services/private-ai/')}" class="btn btn-light">${c.gpu.link} ${arrow(ctx)}</a></div>
        </div>
        <div class="boundary" role="img" aria-label="${esc(c.gpu.diagram.label)}">
          <span class="boundary-label">${icon('fa-lock')}${c.gpu.diagram.boundary}</span>
          <div class="node">${icon('fa-video')}<span>${c.gpu.diagram.n1}</span></div>
          <div class="link">${icon('fa-arrow-down')}</div>
          <div class="node node-main">${icon('fa-server')}<span>${c.gpu.diagram.n2}</span></div>
          <div class="link">${icon('fa-arrow-down')}</div>
          <div class="node">${icon('fa-chart-line')}<span>${c.gpu.diagram.n3}</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead(c.jnh.eyebrow, c.jnh.title, `<a href="${SITE.jnhUrl}" target="_blank" rel="noopener" class="link-arrow">${c.jnh.link} ${arrow(ctx)}</a>`)}
        <p class="lead" style="margin:-16px 0 32px">${c.jnh.text}</p>
        <div class="cells cells-3">
          ${c.jnh.items
            .map(
              (p, i) => `
          <div class="cell reveal-on-scroll" style="transition-delay:${i * 0.05}s">
            ${icon(p.icon, 'cell-icon')}<h3 class="cell-title">${p.title}</h3><p class="cell-text" style="margin-bottom:0">${p.text}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead(c.process.eyebrow, c.process.title)}
        <div class="steps">
          ${c.process.items
            .map(
              (p, i) => `
          <div class="step reveal-on-scroll" style="transition-delay:${i * 0.1}s"><span class="step-n">0${i + 1}</span><span class="step-badge">${p.badge}</span><h3 class="cell-title">${p.title}</h3><p class="cell-text" style="margin-bottom:0">${p.text}</p></div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="book">
      <div class="container contact-grid">
        <div>
          <span class="eyebrow">${c.process.items[0].badge} · ${c.process.items[0].title}</span>
          <h2 class="heading" style="margin:10px 0 14px">${form.title}</h2>
          <p class="lead" style="margin-bottom:28px">${form.text}</p>
          ${contactForm(ctx, { source: 'landing-' + key, labels, options: form.options })}
        </div>
        <aside>
          <div class="phone-card">
            <span class="phone-label">${c.cta_call}</span>
            <a href="${tel}" class="phone-number" dir="ltr">${icon('fa-phone')}${phone}</a>
            <div class="phone-actions">
              <a href="${wa}" target="_blank" rel="noopener" class="btn btn-wa">${icon('fa-whatsapp')}${c.cta_wa}</a>
              <a href="mailto:${SITE.email}" class="btn btn-dark">${icon('fa-envelope')}${SITE.email}</a>
            </div>
            <p class="phone-addr">${icon('fa-location-dot')}${t('contact.riyadh_address')}</p>
          </div>
          <div class="faq" style="margin-top:32px">
            <h2 class="eyebrow" style="margin-bottom:12px">${c.faq.title}</h2>
            ${faqBlock(c.faq.items)}
          </div>
        </aside>
      </div>
    </section>

    <section class="final-cta">
      <div class="hazard-bar" aria-hidden="true"></div>
      <div class="container final-inner">
        <div>
          <h2>${c.final.title}</h2>
          <p>${c.final.text}</p>
        </div>
        <div class="final-actions">
          <a href="${tel}" class="final-phone" dir="ltr" data-cta="call">${icon('fa-phone')}${phone}</a>
          <div class="btn-row">
            <a href="${wa}" target="_blank" rel="noopener" class="btn btn-wa btn-lg" data-cta="whatsapp">${icon('fa-whatsapp')}<span>${c.cta_wa}</span></a>
            <a href="#book" class="btn btn-dark btn-lg" data-cta="contact">${icon('fa-envelope')}<span>${c.cta_contact}</span></a>
          </div>
        </div>
      </div>
    </section>

    <a href="${wa}" target="_blank" rel="noopener" class="wa-fab" aria-label="${esc(t('contact.whatsapp'))}">${icon('fa-whatsapp')}</a>

    <div class="sticky-cta" role="complementary">
      <a href="${tel}" class="btn btn-amber" data-cta="call">${icon('fa-phone')}<span>${c.cta_call}</span></a>
      <a href="${wa}" target="_blank" rel="noopener" class="btn btn-wa" data-cta="whatsapp">${icon('fa-whatsapp')}<span>WhatsApp</span></a>
      <a href="#book" class="btn btn-dark" data-cta="contact">${icon('fa-envelope')}<span>${t('nav.contact')}</span></a>
    </div>`

  const path = data.landingUrl(key, lang)
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: stripTags(c.title),
      description: c.meta.description,
      provider: { '@id': SITE.url + '/#org' },
      areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
      audience: {
        '@type': 'Audience',
        audienceType: c.audience
      },
      url: SITE.url + path,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: c.solutions.title,
        itemListElement: c.solutions.items.map(s => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.title,
            description: s.text
          }
        }))
      }
    },
    faqLd(c.faq.items),
    breadcrumbLd(ctx, [
      [t('nav.home'), url()],
      [c.eyebrow, path]
    ])
  ]
  return {
    title: c.meta.title,
    description: c.meta.description,
    nav: key === 'construction' ? 'saudi' : '',
    bodyClass: 'sa-page' + (c.theme ? ' ' + c.theme : ''),
    extraCss: [data.assets.landingCss],
    body,
    jsonld: ld
  }
}
