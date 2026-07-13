/* global localStorage, IntersectionObserver */

const App = {
  state: {
    lang: 'en',
    route: 'home',
    translations: {},
    services: [],
    projects: [],
    pages: [],
    isTransitioning: false
  },

  parseRouteAndLang () {
    const path = window.location.pathname.replace(/^\/|\/$/g, '')
    const segments = path.split('/')
    let lang = localStorage.getItem('lang') || 'en'
    let route = 'home'

    if (segments[0] === 'ar' || segments[0] === 'ro') {
      lang = segments[0]
      route = segments.slice(1).join('/') || 'home'
    } else {
      lang = 'en'
      route = path || 'home'
    }

    localStorage.setItem('lang', lang)
    return { route, lang }
  },

  resolveRouteFromPath (href) {
    const path = href.replace(/^\/|\/$/g, '')
    const segments = path.split('/')
    if (segments[0] === 'ar' || segments[0] === 'ro') {
      return segments.slice(1).join('/') || 'home'
    }
    return path || 'home'
  },

  toggleMobileMenu (isOpen) {
    const menu = document.getElementById('mobile-menu')
    const openBtn = document.getElementById('mobile-menu-btn')
    if (menu) {
      if (isOpen) {
        menu.classList.remove('hidden')
        menu.classList.add('flex')
        document.body.classList.add('overflow-hidden')
        if (openBtn) openBtn.setAttribute('aria-expanded', 'true')
      } else {
        menu.classList.add('hidden')
        menu.classList.remove('flex')
        document.body.classList.remove('overflow-hidden')
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false')
      }
    }
  },

  // Eye-comforting palette for boxes
  palette: [
    {
      bg: 'bg-blue-100/50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'bg-blue-200/50'
    },
    {
      bg: 'bg-orange-100/50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: 'bg-orange-200/50'
    },
    {
      bg: 'bg-emerald-100/50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: 'bg-emerald-200/50'
    },
    {
      bg: 'bg-purple-100/50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: 'bg-purple-200/50'
    },
    {
      bg: 'bg-rose-100/50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: 'bg-rose-200/50'
    },
    {
      bg: 'bg-amber-100/50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'bg-amber-200/50'
    }
  ],

  async init () {
    const { route, lang } = this.parseRouteAndLang()
    this.state.route = route
    this.state.lang = lang

    await this.loadData()
    this.setupEventListeners()
    this.setupRevealObserver()
    this.render()
    this.updateHTMLLangAttributes()
    this.updateLanguageSwitcherUI()
  },

  async loadData () {
    try {
      const [i18n, services, projects, pages] = await Promise.all([
        fetch(`/data/i18n/${this.state.lang}.json?v=1.0.1`).then(res =>
          res.json()
        ),
        fetch(`/data/services.json?v=1.0.1`).then(res => res.json()),
        fetch(`/data/projects.json?v=1.0.1`).then(res => res.json()),
        fetch(`/data/pages.json?v=1.0.1`).then(res => res.json())
      ])

      this.state.translations = i18n
      this.state.services = services
      this.state.projects = projects
      this.state.pages = pages
    } catch (error) {
      console.error('Error loading data:', error)
    }
  },

  setupEventListeners () {
    window.addEventListener('popstate', () => {
      const { route, lang } = this.parseRouteAndLang()
      if (lang !== this.state.lang) {
        this.state.lang = lang
        this.loadData().then(() => this.navigateTo(window.location.pathname))
      } else {
        this.navigateTo(window.location.pathname)
      }
    })

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="/"]')
      if (link && !link.getAttribute('target')) {
        const href = link.getAttribute('href')
        if (
          href.startsWith('/') &&
          !href.includes(':') &&
          !href.includes('.')
        ) {
          e.preventDefault()
          if (href !== window.location.pathname) {
            this.navigateTo(href)
          }
        }
      }
      if (e.target.closest('#mobile-menu-btn')) {
        this.toggleMobileMenu(true)
      }
      if (
        e.target.closest('#close-menu') ||
        e.target.closest('#mobile-menu a')
      ) {
        this.toggleMobileMenu(false)
      }
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.toggleMobileMenu(false)
      }
    })

    // Form submission intercept
    document.addEventListener('submit', async e => {
      if (e.target.id === 'contact-form') {
        e.preventDefault()
        const form = e.target
        const btn = form.querySelector('button[type="submit"]')
        const originalText = btn.innerText
        btn.innerText =
          this.state.lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'
        btn.disabled = true

        try {
          const formData = new FormData(form)
          const data = Object.fromEntries(formData.entries())
          const response = await fetch('/contact_handler.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          const result = await response.json()
          if (result.success) {
            form.innerHTML = `
              <div class="text-center py-20 animate-reveal">
                  <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg">
                      <i class="fa fa-check-circle"></i>
                  </div>
                  <h3 class="text-4xl font-black text-dark mb-4">${this.t('contact.form_success_badge')}</h3>
                  <p class="text-xl text-stone-500 font-bold">${this.t('contact.form_success_text')}</p>
                  <button onclick="location.reload()" class="mt-10 text-primary font-black uppercase tracking-widest text-sm underline decoration-4 underline-offset-8">Send Another Inquiry</button>
              </div>
            `
          } else {
            alert(result.message || 'An error occurred. Please try again.')
            btn.disabled = false
            btn.innerText = originalText
          }
        } catch (error) {
          console.error('Submission error:', error)
          alert('Network error. Please check your connection and try again.')
          btn.disabled = false
          btn.innerText = originalText
        }
      }
    })
  },

  setupRevealObserver () {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    this.observeElements = () => {
      document
        .querySelectorAll('.reveal-on-scroll')
        .forEach(el => observer.observe(el))
    }
  },

  async navigateTo (route) {
    if (this.state.isTransitioning) return
    this.state.isTransitioning = true

    const layer = document.getElementById('app-transition-layer')
    layer.classList.remove('finished')
    layer.classList.add('active')

    setTimeout(async () => {
      let targetPath = route
      let cleanRoute = route.replace(/^\/|\/$/g, '')
      let prefix = ''
      if (cleanRoute.startsWith('ar/') || cleanRoute.startsWith('ro/')) {
        prefix = cleanRoute.slice(0, 2)
        cleanRoute = cleanRoute.slice(3) || 'home'
      } else if (cleanRoute === 'ar' || cleanRoute === 'ro') {
        prefix = cleanRoute
        cleanRoute = 'home'
      } else {
        prefix = this.state.lang === 'en' ? '' : this.state.lang
      }

      this.state.route = cleanRoute || 'home'

      let historyUrl = '/'
      if (prefix) historyUrl += prefix + '/'
      if (cleanRoute !== 'home') historyUrl += cleanRoute

      window.history.pushState({}, '', historyUrl)
      this.render()
      window.scrollTo(0, 0)

      setTimeout(() => {
        layer.classList.remove('active')
        layer.classList.add('finished')
        this.state.isTransitioning = false
      }, 400)
    }, 800)
  },

  async setLanguage (lang) {
    this.state.lang = lang
    localStorage.setItem('lang', lang)
    await this.loadData()
    this.updateHTMLLangAttributes()
    this.updateLanguageSwitcherUI()

    let historyUrl = '/'
    if (lang !== 'en') historyUrl += lang + '/'
    if (this.state.route !== 'home') historyUrl += this.state.route
    window.history.pushState({}, '', historyUrl)

    this.render()
  },

  updateHTMLLangAttributes () {
    document.documentElement.lang = this.state.lang
    document.documentElement.dir = this.state.lang === 'ar' ? 'rtl' : 'ltr'
    if (this.state.lang === 'ar') {
      document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif"
    } else {
      document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif"
    }
  },

  updateLanguageSwitcherUI () {
    ;['en', 'ar', 'ro'].forEach(l => {
      const btn = document.getElementById(`lang-${l}`)
      if (btn) {
        if (l === this.state.lang) {
          btn.classList.add('bg-primary', 'text-white', 'shadow-lg')
          btn.classList.remove('text-stone-500')
        } else {
          btn.classList.remove('bg-primary', 'text-white', 'shadow-lg')
          btn.classList.add('text-stone-500')
        }
      }
    })
  },

  t (path) {
    const value = path
      .split('.')
      .reduce((obj, key) => obj && obj[key], this.state.translations)
    if (value === undefined) {
      // Fallback for hero.title specifically since it was identified as an error
      if (path === 'hero.title') {
        return this.t('hero.title_bold') + ' ' + this.t('hero.title_ideas')
      }
      return path
    }
    return value
  },

  render () {
    this.updateSEO()
    this.renderNavigation()
    this.renderContent()
    this.renderFooter()
    this.updateActiveNavLink()
    if (this.observeElements) this.observeElements()
  },

  updateSEO () {
    const isServiceDetail = this.state.route.startsWith('services/')
    if (isServiceDetail) {
      const serviceId = this.state.route.split('/')[1]
      const service = this.state.services.find(s => s.id === serviceId)
      if (service) {
        document.title = `${service.title[this.state.lang]} | Loops Technologies`
        return
      }
    }
    const page =
      this.state.pages.find(p => p.id === this.state.route) ||
      this.state.pages[0]
    document.title = `${this.t('nav.' + (page ? page.nav_key : 'home'))} | Loops Technologies`
  },

  renderNavigation () {
    const navContainer = document.getElementById('nav-links')
    const mobileNavContainer = document.getElementById('mobile-nav-links')

    const langPrefix = this.state.lang === 'en' ? '' : `/${this.state.lang}`

    const linksHTML = this.state.pages
      .filter(p => p.show_in_nav)
      .map(
        page => {
          const path = page.id === 'home' ? '' : page.id
          return `
            <a href="${langPrefix}/${path}" class="nav-link font-black text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-primary transition-all relative py-2">
                ${this.t('nav.' + page.nav_key)}
            </a>
          `
        }
      )
      .join('')

    const mobileLinksHTML = this.state.pages
      .filter(p => p.show_in_nav)
      .map(
        page => {
          const path = page.id === 'home' ? '' : page.id
          return `
            <a href="${langPrefix}/${path}" class="text-4xl font-black uppercase tracking-tighter hover:text-primary transition-colors">${this.t('nav.' + page.nav_key)}</a>
          `
        }
      )
      .join('')

    if (navContainer) navContainer.innerHTML = linksHTML
    if (mobileNavContainer) mobileNavContainer.innerHTML = mobileLinksHTML

    const liveChatBtn = document.getElementById('live-chat-text')
    if (liveChatBtn) liveChatBtn.innerText = this.t('nav.live_chat')
  },

  updateActiveNavLink () {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href')
      const route = this.resolveRouteFromPath(href)
      if (
        route === this.state.route ||
        (this.state.route.startsWith('services') && route === 'services')
      ) {
        link.classList.add('text-primary')
        link.classList.remove('text-stone-500')
      } else {
        link.classList.remove('text-primary')
        link.classList.add('text-stone-500')
      }
    })
  },

  renderContent () {
    const appContainer = document.getElementById('app')
    if (!appContainer) return

    if (this.state.route.startsWith('services/')) {
      const serviceId = this.state.route.split('/')[1]
      appContainer.innerHTML = this.getServiceDetailHTML(serviceId)
      return
    }

    switch (this.state.route) {
      case 'home':
        appContainer.innerHTML = this.getHomeHTML()
        this.renderHomeServices()
        break
      case 'services':
        appContainer.innerHTML = this.getServicesListHTML()
        this.renderFullServices()
        break
      case 'projects':
        appContainer.innerHTML = this.getPortfolioHTML()
        this.renderProjects()
        break
      case 'ai-solutions':
        appContainer.innerHTML = this.getServicesListHTML(true)
        this.renderFullServices(true)
        break
      case 'about':
        appContainer.innerHTML = this.getAboutHTML()
        break
      case 'contact':
        appContainer.innerHTML = this.getContactHTML()
        break
      default:
        appContainer.innerHTML = this.getHomeHTML()
        this.renderHomeServices()
    }
  },

  getHomeHTML () {
    return `
            <!-- Dynamic Hero -->
            <section class="relative min-h-[90vh] flex items-center px-4 pt-20 pb-32 bg-warm-gradient overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" class="w-full h-full text-primary">
                        <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/></pattern></defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>

                <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div class="space-y-12 animate-slide-up">
                        <div class="inline-flex items-center gap-4 bg-primary/10 text-primary px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-sm">
                            <span class="flex h-3 w-3 rounded-full bg-primary animate-ping"></span>
                            ${this.t('hero.badge')}
                        </div>
                        
                        <h1 class="text-7xl lg:text-[6rem] font-black text-dark leading-[1] tracking-tighter uppercase">
                            ${this.t('hero.title_bold')} <span class="text-gradient">${this.t('hero.title_ideas')}</span><br>
                            ${this.t('hero.title_smart')} <span class="text-gradient">${this.t('hero.title_code')}</span>.
                        </h1>

                        <p class="text-2xl text-stone-500 leading-relaxed max-w-xl font-bold border-l-4 border-primary pl-8">
                            ${this.t('hero.subtitle')}
                        </p>

                        <div class="flex flex-col sm:flex-row gap-8">
                            <a href="/contact" class="bg-solar-gradient text-white px-14 py-6 rounded-xl font-black text-xl shadow-[0_30px_60px_-15px_rgba(234,88,12,0.4)] hover:-translate-y-2 transition-all flex items-center justify-center gap-4 group">
                                ${this.t('hero.btn_audit')} <i class="fa fa-bolt group-hover:rotate-12 transition-transform"></i>
                            </a>
                            <a href="/services" class="bg-white border-4 border-stone-100 text-dark px-14 py-6 rounded-xl font-black text-xl hover:border-primary transition-all text-center">
                                ${this.t('hero.btn_services')}
                            </a>
                        </div>
                    </div>

                    <div class="relative group">
                        <div class="absolute -inset-10 bg-solar-gradient rounded-full opacity-20 blur-[120px] group-hover:opacity-30 transition-opacity animate-pulse"></div>
                        <div class="relative z-10 animate-float">
                            <img src="/img/loopstech-main-photograph.jpg" alt="Loops Tech" class="rounded-xl shadow-[0_60px_100px_-20px_rgba(0,0,0,0.3)] border-[20px] border-white ring-1 ring-stone-100">
                            <div class="absolute top-20 -right-16 bg-white p-10 rounded-xl shadow-2xl animate-float-delayed hidden xl:block border border-stone-50">
                                <i class="fa fa-robot text-5xl text-primary mb-4"></i>
                                <p class="font-black text-dark text-lg">AI Ready</p>
                            </div>
                            <div class="absolute -bottom-10 -left-16 bg-dark text-white p-10 rounded-xl shadow-2xl animate-float hidden xl:block">
                                <i class="fa fa-code text-5xl text-accent mb-4"></i>
                                <p class="font-black text-lg">Clean Code</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Creative Process -->
            <section class="py-32 px-4 bg-dark text-white relative overflow-hidden">
                <div class="process-line"></div>
                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="text-center mb-32 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.5em] text-xs">${this.t('home.process_badge')}</h2>
                        <h3 class="text-6xl font-black tracking-tighter uppercase  leading-none">${this.t('home.process_title')}</h3>
                    </div>
                    
                    <div class="grid md:grid-cols-4 gap-12">
                        ${[
                          {
                            step: '01',
                            title: this.t('home.process_step1_title'),
                            icon: 'fa-comments-alt',
                            desc: this.t('home.process_step1_desc')
                          },
                          {
                            step: '02',
                            title: this.t('home.process_step2_title'),
                            icon: 'fa-draw-polygon',
                            desc: this.t('home.process_step2_desc')
                          },
                          {
                            step: '03',
                            title: this.t('home.process_step3_title'),
                            icon: 'fa-code',
                            desc: this.t('home.process_step3_desc')
                          },
                          {
                            step: '04',
                            title: this.t('home.process_step4_title'),
                            icon: 'fa-rocket',
                            desc: this.t('home.process_step4_desc')
                          }
                        ]
                          .map(
                            (p, idx) => `
                            <div class="relative group reveal-on-scroll" style="transition-delay: ${idx * 0.1}s">
                                <div class="text-8xl font-black text-white/5 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">${p.step}</div>
                                <div class="w-20 h-20 bg-stone-900 rounded-xl flex items-center justify-center mb-8 border border-stone-800 group-hover:bg-primary transition-all shadow-xl">
                                    <i class="fa ${p.icon} text-3xl"></i>
                                </div>
                                <h5 class="text-3xl font-black mb-4  tracking-tighter uppercase">${p.title}</h5>
                                <p class="text-stone-500 font-medium leading-relaxed">${p.desc}</p>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </section>

            <!-- Interactive Services Grid -->
            <section class="py-32 px-4 bg-white">
                <div class="max-w-7xl mx-auto">
                    <div class="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10 reveal-on-scroll">
                        <div class="space-y-6 max-w-2xl text-left">
                            <h2 class="text-primary font-black uppercase tracking-[0.5em] text-xs">${this.t('home.services_badge')}</h2>
                            <h3 class="text-6xl font-black text-dark tracking-tighter uppercase leading-none ">${this.t('home.services_title')}</h3>
                        </div>
                        <a href="/services" class="bg-stone-100 text-dark px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                            ${this.t('home.services_all')}
                        </a>
                    </div>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="home-services-grid"></div>
                </div>
            </section>

            <!-- Industry Specialized Solutions -->
            <section class="py-32 px-4 bg-white relative overflow-hidden">
                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.4em] text-xs">${this.t('home.specialized_badge')}</h2>
                        <h3 class="text-5xl font-black text-dark tracking-tighter  uppercase">${this.t('home.specialized_title')}</h3>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${[
                          {
                            icon: 'fa-hospital',
                            title: this.t('home.industry1_title'),
                            desc: this.t('home.industry1_desc')
                          },
                          {
                            icon: 'fa-cash-register',
                            title: this.t('home.industry2_title'),
                            desc: this.t('home.industry2_desc')
                          },
                          {
                            icon: 'fa-truck-fast',
                            title: this.t('home.industry3_title'),
                            desc: this.t('home.industry3_desc')
                          },
                          {
                            icon: 'fa-bed',
                            title: this.t('home.industry4_title'),
                            desc: this.t('home.industry4_desc')
                          }
                        ]
                          .map((item, idx) => {
                            const color =
                              this.palette[idx % this.palette.length]
                            return `
                                <div class="${color.bg} ${color.border} border-2 p-10 rounded-xl shadow-lg shadow-stone-100 card-creative reveal-on-scroll" style="transition-delay: ${idx * 0.1}s">
                                    <div class="w-16 h-16 ${color.icon} rounded-xl flex items-center justify-center ${color.text} mb-8 shadow-sm">
                                        <i class="fa ${item.icon} text-2xl"></i>
                                    </div>
                                    <h5 class="text-2xl font-black mb-4 tracking-tighter uppercase ">${item.title}</h5>
                                    <p class="text-stone-600 leading-relaxed font-bold text-sm">${item.desc}</p>
                                </div>
                            `
                          })
                          .join('')}
                    </div>
                </div>
            </section>

            <!-- Impact Section (Projects) -->
            <section class="py-32 bg-white overflow-hidden">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-accent font-black uppercase tracking-[0.5em] text-xs">${this.t('home.edge_badge')}</h2>
                        <h3 class="text-7xl font-black text-dark tracking-tighter uppercase  leading-none">${this.t('home.edge_title')}</h3>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-16" id="home-projects-grid"></div>
                </div>
            </section>

            <!-- CTA -->
            <section class="py-32 px-4 bg-light">
                <div class="max-w-7xl mx-auto">
                    <div class="bg-dark rounded-xl p-16 lg:p-32 text-center relative overflow-hidden reveal-on-scroll">
                        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
                        <div class="relative z-10 space-y-12">
                            <h3 class="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none uppercase ">
                                ${this.t('home.cta_title')}
                            </h3>
                            <p class="text-2xl text-stone-400 font-bold max-w-2xl mx-auto">
                                ${this.t('home.cta_desc')}
                            </p>
                            <div class="pt-8">
                                <a href="/contact" class="bg-solar-gradient text-white px-16 py-8 rounded-xl font-black text-2xl shadow-2xl hover:scale-105 transition-transform inline-block uppercase tracking-[0.2em]">
                                    ${this.t('home.cta_btn')} <i class="fa fa-arrow-right ml-4"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `
  },

  renderHomeServices () {
    const grid = document.getElementById('home-services-grid')
    if (!grid) return

    const langPrefix = this.state.lang === 'en' ? '' : `/${this.state.lang}`

    grid.innerHTML = this.state.services
      .slice(0, 6)
      .map((s, idx) => {
        const color = this.palette[idx % this.palette.length]
        return `
                <div class="p-12 rounded-xl ${color.bg} ${color.border} border-2 card-creative group text-left reveal-on-scroll" style="transition-delay: ${idx * 0.05}s">
                    <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center ${color.text} mb-10 group-hover:bg-solar-gradient group-hover:text-white transition-all duration-500 shadow-md">
                        <i class="fa ${s.icon} text-2xl"></i>
                    </div>
                    <h4 class="text-3xl font-black mb-4 uppercase tracking-tighter  group-hover:text-primary transition-colors">${s.title[this.state.lang]}</h4>
                    <p class="text-stone-600 text-sm leading-relaxed mb-10 font-bold">${s.description[this.state.lang]}</p>
                    <a href="${langPrefix}/services/${s.id}" class="inline-flex items-center gap-3 ${color.text} font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-5 transition-all">
                        ${this.t('services.learn_more')} <i class="fa fa-chevron-right"></i>
                    </a>
                </div>
            `
      })
      .join('')

    const projectGrid = document.getElementById('home-projects-grid')
    if (projectGrid) {
      projectGrid.innerHTML = this.state.projects
        .slice(0, 2)
        .map(
          (p, idx) => `
                <div class="group cursor-pointer reveal-on-scroll" style="transition-delay: ${idx * 0.2}s">
                    <div class="relative overflow-hidden rounded-xl shadow-2xl mb-12 border-[20px] border-white ring-1 ring-stone-100 aspect-video">
                        <img src="${p.img}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000">
                        <div class="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-12">
                            <div class="text-center scale-90 group-hover:scale-100 transition-transform">
                                <p class="text-primary font-black uppercase text-xs tracking-[0.5em] mb-6">${p.type[this.state.lang]}</p>
                                <h4 class="text-white font-black text-5xl  tracking-tighter uppercase mb-8">${this.t('portfolio.view_story')}</h4>
                                <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-white">
                                    <i class="fa fa-arrow-right text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-12">
                        <h4 class="text-4xl font-black text-dark mb-4 tracking-tighter uppercase ">${p.title}</h4>
                        <p class="text-stone-500 text-xl font-bold leading-relaxed">${p.description[this.state.lang]}</p>
                    </div>
                </div>
            `
        )
        .join('')
    }
  },

  getServicesListHTML (isAIOnly = false) {
    return `
            <div class="py-32 px-4 bg-light min-h-screen">
                <div class="max-w-7xl mx-auto">
                    <div class="max-w-3xl mb-32 space-y-8 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.5em] text-xs">Excellence</h2>
                        <h2 class="text-7xl lg:text-8xl font-black text-dark tracking-tighter uppercase leading-none ">${isAIOnly ? 'AI Support <span class="text-gradient">Agents.</span>' : this.t('services.title')}</h2>
                        <p class="text-stone-500 text-2xl font-bold leading-relaxed border-l-8 border-primary pl-8">${this.t('services.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10" id="full-services-grid"></div>
                </div>
            </div>
        `
  },

  renderFullServices (isAIOnly = false) {
    const grid = document.getElementById('full-services-grid')
    if (!grid) return

    let list = this.state.services
    if (isAIOnly) {
      list = list.filter(s => s.id.includes('ai'))
    }

    grid.innerHTML = list
      .map((s, idx) => {
        const color = this.palette[idx % this.palette.length]
        return `
                <div class="p-12 rounded-xl ${color.bg} ${color.border} border-2 card-creative group reveal-on-scroll" style="transition-delay: ${idx * 0.05}s">
                    <div class="w-24 h-24 bg-white rounded-xl flex items-center justify-center ${color.text} mb-12 group-hover:bg-solar-gradient group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0 shadow-lg">
                        <i class="fa ${s.icon} text-4xl"></i>
                    </div>
                    <h4 class="text-4xl font-black mb-6 uppercase tracking-tighter  leading-none group-hover:${color.text} transition-colors">${s.title[this.state.lang]}</h4>
                    <p class="text-stone-500 text-lg leading-relaxed mb-12 font-bold">${s.description[this.state.lang]}</p>
                    <a href="/services/${s.id}" class="bg-stone-900 text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all inline-block shadow-2xl">
                        View Solution
                    </a>
                </div>
            `
      })
      .join('')
  },

  getServiceDetailHTML (serviceId) {
    const service = this.state.services.find(s => s.id === serviceId)
    if (!service) return this.getHomeHTML()

    const otherServices = this.state.services
      .filter(s => s.id !== serviceId)
      .slice(0, 6)

    return `
            <div class="py-32 bg-white min-h-screen">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="grid lg:grid-cols-3 gap-24">
                        <div class="lg:col-span-2 space-y-24 animate-slide-up">
                            <div class="space-y-10">
                                <a href="/services" class="inline-flex items-center gap-4 text-primary font-black uppercase tracking-[0.3em] text-xs hover:-translate-x-3 transition-transform group">
                                    <i class="fa fa-chevron-left bg-stone-100 p-4 rounded-full group-hover:bg-primary group-hover:text-white"></i> All Expertise
                                </a>
                                <h1 class="text-7xl lg:text-[110px] font-black text-dark tracking-tighter leading-[0.8] uppercase ">
                                    ${service.title[this.state.lang]}
                                </h1>
                                <p class="text-3xl text-stone-400 font-bold leading-relaxed  border-l-8 border-indigo-100 pl-10">
                                    "${service.description[this.state.lang]}"
                                </p>
                            </div>

                            <div class="relative group reveal-on-scroll">
                                <div class="absolute inset-0 bg-solar-gradient rounded-xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img src="${service.graphic || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}" class="relative z-10 w-full h-[600px] object-cover rounded-xl shadow-2xl border-[15px] border-white" alt="${service.title.en}">
                            </div>

                             <div class="prose prose-2xl max-w-none text-stone-600 font-bold leading-[1.8] reveal-on-scroll">
                                 ${
                                   service.longDescription
                                     ? service.longDescription[this.state.lang]
                                         .split('\n')
                                         .map(
                                           p =>
                                             `<p class="mb-10 text-xl">${p}</p>`
                                         )
                                         .join('')
                                     : '<p>Detailed description coming soon...</p>'
                                 }
                             </div>

                             ${(() => {
                               if (serviceId === 'web-apps') {
                                 return `
                                 <div class="bg-stone-50 rounded-xl p-12 border border-stone-100 reveal-on-scroll space-y-8 my-16">
                                     <h4 class="text-2xl font-black uppercase tracking-tighter text-dark mb-6 text-left">System Architecture Flow</h4>
                                     <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center">
                                         <div class="bg-white p-6 rounded-xl border-2 border-stone-200 shadow-sm">
                                             <i class="fa fa-users text-primary text-2xl mb-2"></i>
                                             <p class="font-black text-xs uppercase tracking-wider text-dark">User Client</p>
                                         </div>
                                         <div class="text-stone-400 text-2xl"><i class="fa fa-arrow-right hidden md:block"></i><i class="fa fa-arrow-down block md:hidden"></i></div>
                                         <div class="bg-white p-6 rounded-xl border-2 border-primary shadow-sm ring-4 ring-primary/5">
                                             <i class="fa fa-laptop-code text-primary text-2xl mb-2"></i>
                                             <p class="font-black text-xs uppercase tracking-wider text-dark">React Frontend</p>
                                         </div>
                                         <div class="text-stone-400 text-2xl"><i class="fa fa-arrow-right hidden md:block"></i><i class="fa fa-arrow-down block md:hidden"></i></div>
                                         <div class="bg-white p-6 rounded-xl border-2 border-accent shadow-sm">
                                             <i class="fa fa-gears text-accent text-2xl mb-2"></i>
                                             <p class="font-black text-xs uppercase tracking-wider text-dark">Laravel API</p>
                                         </div>
                                         <div class="text-stone-400 text-2xl"><i class="fa fa-arrow-right hidden md:block"></i><i class="fa fa-arrow-down block md:hidden"></i></div>
                                         <div class="bg-white p-6 rounded-xl border-2 border-dark shadow-sm">
                                             <i class="fa fa-database text-dark text-2xl mb-2"></i>
                                             <p class="font-black text-xs uppercase tracking-wider text-dark">Secure MySQL</p>
                                         </div>
                                     </div>
                                 </div>`;
                               } else if (serviceId === 'ai-solutions') {
                                 return `
                                 <div class="bg-stone-900 rounded-xl p-12 border border-stone-800 reveal-on-scroll text-white space-y-6 my-16">
                                     <div class="flex items-center justify-between border-b border-stone-800 pb-6">
                                         <div class="flex items-center gap-4">
                                             <span class="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                                             <span class="font-black text-xs uppercase tracking-widest text-emerald-400">Live Assistant Preview</span>
                                         </div>
                                         <span class="text-stone-500 font-bold text-xs uppercase">LoopsAI Agent v1.2</span>
                                     </div>
                                     <div class="space-y-6 text-left">
                                         <div class="flex items-start gap-4">
                                             <div class="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center font-black text-xs text-white">U</div>
                                             <div class="bg-stone-800 p-6 rounded-2xl rounded-tl-none max-w-md">
                                                 <p class="font-bold text-sm">Hi, can I check my order status for booking #8829?</p>
                                             </div>
                                         </div>
                                         <div class="flex items-start gap-4 justify-end">
                                             <div class="bg-primary p-6 rounded-2xl rounded-tr-none max-w-md text-left">
                                                 <p class="font-bold text-sm text-white">Hello! I've located booking #8829. Your developer team is currently on step 03 (Build), with 85% of tasks completed. Uptime is at 99.9%.</p>
                                             </div>
                                             <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black text-xs text-white">AI</div>
                                         </div>
                                         <div class="flex items-center gap-3 text-stone-500 text-xs">
                                             <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                             <span>Agent typing response...</span>
                                         </div>
                                     </div>
                                 </div>`;
                               } else if (serviceId === 'ai-infrastructure') {
                                 return `
                                 <div class="bg-stone-950 rounded-xl p-12 border border-stone-800 text-white reveal-on-scroll space-y-8 my-16">
                                     <div class="flex items-center justify-between border-b border-stone-800 pb-6">
                                         <span class="font-black text-xs uppercase tracking-widest text-stone-400">MLOps Cluster Monitor</span>
                                         <span class="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">Active</span>
                                     </div>
                                     <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                                         <div class="space-y-3">
                                             <div class="flex justify-between font-black text-xs uppercase text-stone-500">
                                                 <span>GPU Usage</span>
                                                 <span class="text-white">94%</span>
                                             </div>
                                             <div class="w-full bg-stone-800 h-3 rounded-full overflow-hidden">
                                                 <div class="bg-solar-gradient h-full rounded-full" style="width: 94%"></div>
                                             </div>
                                         </div>
                                         <div class="space-y-3">
                                             <div class="flex justify-between font-black text-xs uppercase text-stone-500">
                                                 <span>Model Load (LLM)</span>
                                                 <span class="text-white">82%</span>
                                             </div>
                                             <div class="w-full bg-stone-800 h-3 rounded-full overflow-hidden">
                                                 <div class="bg-emerald-500 h-full rounded-full" style="width: 82%"></div>
                                             </div>
                                         </div>
                                         <div class="space-y-3">
                                             <div class="flex justify-between font-black text-xs uppercase text-stone-500">
                                                 <span>Compute Nodes</span>
                                                 <span class="text-white">16 / 16</span>
                                             </div>
                                             <div class="w-full bg-stone-800 h-3 rounded-full overflow-hidden">
                                                 <div class="bg-blue-500 h-full rounded-full" style="width: 100%"></div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>`;
                               } else if (serviceId === 'mobile-apps') {
                                 return `
                                 <div class="bg-stone-50 rounded-xl p-12 border border-stone-100 reveal-on-scroll grid lg:grid-cols-2 gap-12 items-center my-16 text-left">
                                     <div class="space-y-6">
                                         <h4 class="text-3xl font-black uppercase tracking-tighter text-dark">Mobile UX Blueprint</h4>
                                         <p class="text-stone-600 font-bold leading-relaxed text-sm">We prototype high-speed native feel frameworks. Drag-and-drop structures and native navigation controls are compiled directly from clean, cross-platform layouts.</p>
                                         <div class="flex gap-4">
                                             <span class="bg-white px-4 py-2 border border-stone-200 rounded-lg text-xs font-black text-dark"><i class="fab fa-apple mr-2"></i> iOS Ready</span>
                                             <span class="bg-white px-4 py-2 border border-stone-200 rounded-lg text-xs font-black text-dark"><i class="fab fa-android mr-2"></i> Android Ready</span>
                                         </div>
                                     </div>
                                     <div class="flex justify-center">
                                         <div class="w-64 h-[400px] bg-dark rounded-[40px] border-[12px] border-stone-800 shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                             <div class="w-20 h-4 bg-stone-800 rounded-full mx-auto -mt-2"></div>
                                             <div class="space-y-4 my-auto">
                                                 <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-xl mx-auto"><i class="fa fa-bolt"></i></div>
                                                 <div class="text-center text-white">
                                                     <p class="font-black text-sm uppercase">Loops Wallet</p>
                                                     <p class="text-stone-500 text-[10px] mt-1">Transaction Completed</p>
                                                 </div>
                                                 <div class="bg-stone-900 border border-stone-800 p-4 rounded-xl text-center text-xs font-bold text-stone-400">$1,420.00</div>
                                             </div>
                                             <div class="w-32 h-1 bg-stone-700 rounded-full mx-auto -mb-2"></div>
                                         </div>
                                     </div>
                                 </div>`;
                               } else if (serviceId === 'marketing') {
                                 return `
                                 <div class="bg-stone-50 rounded-xl p-12 border border-stone-100 reveal-on-scroll space-y-8 my-16 text-left">
                                     <h4 class="text-2xl font-black uppercase tracking-tighter text-dark">Organic Conversion Loop</h4>
                                     <div class="space-y-6 max-w-xl mx-auto">
                                         <div class="flex items-center gap-6">
                                             <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center text-blue-700 font-black text-xs uppercase tracking-widest" style="width: 100%">Organic Traffic (SEO Audits) - 100%</div>
                                         </div>
                                         <div class="flex items-center gap-6">
                                             <div class="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-center text-orange-700 font-black text-xs uppercase tracking-widest mx-auto" style="width: 80%">User Engagement (Funnel Speed) - 45%</div>
                                         </div>
                                         <div class="flex items-center gap-6">
                                             <div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-emerald-700 font-black text-xs uppercase tracking-widest mx-auto" style="width: 50%">Converted Customers (ROI Sales) - 18%</div>
                                         </div>
                                     </div>
                                 </div>`;
                               } else if (serviceId === 'iot-solutions') {
                                 return `
                                 <div class="bg-stone-950 rounded-xl p-12 border border-stone-900 text-white reveal-on-scroll space-y-8 my-16 text-left">
                                     <div class="flex items-center justify-between border-b border-stone-900 pb-6">
                                         <span class="font-black text-xs uppercase tracking-widest text-stone-500">Live Device Logs</span>
                                         <span class="flex items-center gap-2 text-xs font-bold text-emerald-400"><i class="fa fa-wifi"></i> Active Sensor Sync</span>
                                     </div>
                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
                                         <div class="bg-stone-900 p-6 rounded-xl border border-stone-800 space-y-2">
                                             <p class="text-stone-500 uppercase font-black text-[10px] tracking-wider">Device Log #1</p>
                                             <p><span class="text-primary">DEVICE_ID:</span> LogiTrack-99</p>
                                             <p><span class="text-primary">BATTERY:</span> 89%</p>
                                             <p><span class="text-primary">COORDINATES:</span> 24.71° N, 46.67° E</p>
                                             <p><span class="text-emerald-400">STATUS: Online</span></p>
                                         </div>
                                         <div class="bg-stone-900 p-6 rounded-xl border border-stone-800 space-y-2">
                                             <p class="text-stone-500 uppercase font-black text-[10px] tracking-wider">Device Log #2</p>
                                             <p><span class="text-primary">DEVICE_ID:</span> ThermoSens-04</p>
                                             <p><span class="text-primary">TEMPERATURE:</span> 22.4°C</p>
                                             <p><span class="text-primary">PING:</span> 12ms</p>
                                             <p><span class="text-emerald-400">STATUS: Online</span></p>
                                         </div>
                                     </div>
                                 </div>`;
                               }
                               return "";
                             })()}

                             <div class="grid md:grid-cols-2 gap-10 reveal-on-scroll">
                                 ${
                                   service.features
                                     ? service.features
                                         .map((f, i) => {
                                           const color =
                                             this.palette[
                                               i % this.palette.length
                                             ]
                                           return `
                                         <div class="${color.bg} p-12 rounded-xl border ${color.border} group hover:border-primary transition-colors">
                                             <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center ${color.text} mb-8 shadow-md group-hover:scale-110 transition-transform">
                                                 <i class="fa ${f.icon} text-2xl"></i>
                                             </div>
                                             <h5 class="text-3xl font-black mb-4 tracking-tighter  uppercase">${f.title[this.state.lang]}</h5>
                                             <p class="text-stone-400 font-bold leading-relaxed uppercase text-xs tracking-widest">${f.description[this.state.lang]}</p>
                                         </div>
                                     `
                                         })
                                         .join('')
                                     : ''
                                }
                            </div>

                            <div class="bg-dark p-16 lg:p-32 rounded-xl text-white space-y-12 relative overflow-hidden reveal-on-scroll">
                                <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
                                <h3 class="text-5xl lg:text-7xl font-black tracking-tighter uppercase  leading-none">Why Choose <span class="text-primary">Loops</span>?</h3>
                                <ul class="space-y-10">
                                    ${
                                      service.benefits
                                        ? service.benefits
                                            .map(
                                              b => `
                                        <li class="flex items-start gap-8 text-2xl font-black  uppercase tracking-tighter">
                                            <i class="fa fa-bolt text-primary mt-2 text-3xl"></i>
                                            <span>${b[this.state.lang]}</span>
                                        </li>
                                    `
                                            )
                                            .join('')
                                        : ''
                                    }
                                </ul>
                                <div class="pt-16 border-t border-stone-800 flex flex-col md:flex-row items-center gap-10">
                                    <a href="/contact" class="bg-solar-gradient text-white px-16 py-8 rounded-xl font-black text-2xl hover:scale-105 transition-transform shadow-2xl w-full md:w-auto text-center uppercase tracking-widest">
                                        Hire Our Talent
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-1 space-y-16 animate-fade-in" style="animation-delay: 0.3s">
                            <div class="bg-stone-50 p-12 rounded-xl border border-stone-100 sticky top-32">
                                <h4 class="text-3xl font-black mb-12 tracking-tighter uppercase border-b-8 border-primary/10 pb-6 ">Capabilities</h4>
                                <div class="space-y-8">
                                    ${otherServices
                                      .map(
                                        s => `
                                        <a href="/services/${s.id}" class="flex items-center gap-6 p-6 rounded-xl hover:bg-white transition-all group ${s.id === serviceId ? 'bg-white pointer-events-none opacity-50' : ''}">
                                            <div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                <i class="fa ${s.icon}"></i>
                                            </div>
                                            <span class="font-black text-sm uppercase tracking-[0.1em] group-hover:text-primary transition-colors">${s.title[this.state.lang]}</span>
                                        </a>
                                    `
                                      )
                                      .join('')}
                                </div>

                                <div class="mt-20 pt-12 border-t-4 border-stone-200 border-dashed">
                                    <h4 class="text-xs font-black text-stone-400 uppercase tracking-[0.4em] mb-10">Modern Stack</h4>
                                    <div class="flex flex-wrap gap-4">
                                        ${
                                          service.technologies
                                            ? service.technologies
                                                .map(
                                                  t => `
                                            <span class="bg-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-stone-100 shadow-sm hover:border-primary transition-colors">${t.name || t}</span>
                                        `
                                                )
                                                .join('')
                                            : ''
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  },

  getPortfolioHTML () {
    return `
            <div class="py-32 px-4 bg-light min-h-screen">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-32 space-y-8 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.5em] text-xs">Proven Global Results</h2>
                        <h2 class="text-7xl lg:text-9xl font-black text-dark tracking-tighter uppercase  leading-none">The <span class="text-gradient">Legacy.</span></h2>
                        <p class="text-stone-500 text-2xl font-bold leading-relaxed max-w-2xl mx-auto">${this.t('portfolio.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-20" id="projects-grid"></div>
                </div>
            </div>
        `
  },

  renderProjects () {
    const grid = document.getElementById('projects-grid')
    if (!grid) return

    grid.innerHTML = this.state.projects
      .map(
        (p, idx) => `
            <div class="group cursor-pointer reveal-on-scroll" style="transition-delay: ${idx * 0.15}s">
                <div class="relative overflow-hidden rounded-xl shadow-2xl mb-12 border-[25px] border-white ring-1 ring-stone-100 aspect-video">
                    <img src="${p.img}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000">
                    <div class="absolute inset-0 bg-solar-gradient/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-16">
                        <div class="text-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                            <p class="text-white font-black uppercase text-xs tracking-[0.5em] mb-8">${p.type[this.state.lang]}</p>
                            <h4 class="text-white font-black text-6xl  tracking-tighter uppercase mb-10">Case Study</h4>
                            <div class="w-20 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-primary shadow-2xl">
                                <i class="fa fa-arrow-right text-3xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-16 text-center">
                    <h4 class="text-5xl font-black text-dark mb-6 tracking-tighter uppercase  group-hover:text-primary transition-colors underline decoration-8 decoration-primary/10 underline-offset-8">${p.title}</h4>
                    <p class="text-stone-400 text-xl font-bold leading-relaxed max-w-xl mx-auto">${p.description[this.state.lang]}</p>
                </div>
            </div>
        `
      )
      .join('')
  },

  getAboutHTML () {
    return `
            <div class="py-32 px-4 bg-white">
                <div class="max-w-7xl mx-auto space-y-40">
                    <div class="grid lg:grid-cols-2 gap-32 items-center">
                        <div class="space-y-12 reveal-on-scroll">
                            <h2 class="text-8xl lg:text-[140px] font-black text-dark tracking-tighter uppercase leading-[0.75] ">
                                Our <span class="text-gradient">Core.</span>
                            </h2>
                            <div class="space-y-10 text-2xl text-stone-500 leading-relaxed font-bold">
                                <p>${this.t('about.text1')}</p>
                                <div class="relative p-12 bg-dark rounded-xl text-white">
                                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-3xl"></div>
                                    <p class="relative z-10  text-3xl leading-tight">"${this.t('about.text2')}"</p>
                                </div>
                                <p>${this.t('about.text3')}</p>
                            </div>
                        </div>
                        <div class="relative group">
                            <div class="absolute -inset-10 bg-solar-gradient blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="Loops Tech" class="relative z-10 rounded-xl shadow-2xl border-[20px] border-white">
                            <div class="absolute -bottom-16 -left-16 bg-solar-gradient text-white p-16 rounded-xl shadow-2xl animate-float">
                                <p class="text-7xl font-black mb-2">${this.t('about.quality_audit')}</p>
                                <p class="text-xs font-black uppercase tracking-[0.5em] opacity-80">${this.t('about.quality_audit_text')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div class="bg-dark p-20 lg:p-40 rounded-xl text-white relative overflow-hidden reveal-on-scroll">
                        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
                        <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]"></div>
                        
                        <h3 class="text-6xl lg:text-8xl font-black mb-32 text-center uppercase tracking-tighter  relative z-10 leading-none">The <span class="text-primary">Answers.</span></h3>
                        
                        <div class="grid md:grid-cols-2 gap-24 relative z-10">
                            ${[1, 2, 3, 4]
                              .map(
                                i => `
                                <div class="space-y-8 group border-l-4 border-stone-800 hover:border-primary pl-12 transition-colors">
                                    <h5 class="text-3xl font-black text-white uppercase tracking-tighter  leading-none group-hover:text-primary transition-colors">
                                        ${this.t(`about.faq_q${i}`)}
                                    </h5>
                                    <p class="text-stone-500 text-xl font-bold leading-relaxed max-w-lg">${this.t(`about.faq_a${i}`)}</p>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
  },

  getContactHTML () {
    return `
            <div class="py-32 px-4 bg-warm-gradient min-h-screen flex items-center">
                <div class="max-w-7xl mx-auto w-full">
                    <div class="text-center mb-32 space-y-8 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.5em] text-xs">Direct Connection</h2>
                        <h2 class="text-8xl lg:text-[150px] font-black text-dark tracking-tighter uppercase leading-[0.8] ">Start <span class="text-gradient">Now.</span></h2>
                        <p class="text-stone-400 font-black uppercase tracking-[0.5em] text-xs">${this.t('contact.subtitle')}</p>
                    </div>
                    
                    <div class="grid lg:grid-cols-3 gap-20 items-start">
                        <div class="lg:col-span-2 bg-white p-16 lg:p-24 rounded-xl shadow-2xl border border-stone-50 reveal-on-scroll">
                            <form id="contact-form" class="space-y-16">
                                <div class="grid md:grid-cols-2 gap-12">
                                    <div class="space-y-6">
                                        <label class="text-xs font-black uppercase text-stone-400 ml-8 tracking-[0.5em]">${this.t('contact.label_name')}</label>
                                        <input type="text" name="name" required class="w-full bg-stone-50 p-8 rounded-xl outline-none focus:ring-8 focus:ring-primary/10 border-4 border-transparent focus:border-primary transition-all font-black text-xl" placeholder="${this.t('contact.placeholder_name')}">
                                    </div>
                                    <div class="space-y-6">
                                        <label class="text-xs font-black uppercase text-stone-400 ml-8 tracking-[0.5em]">${this.t('contact.label_email')}</label>
                                        <input type="email" name="email" required class="w-full bg-stone-50 p-8 rounded-xl outline-none focus:ring-8 focus:ring-primary/10 border-4 border-transparent focus:border-primary transition-all font-black text-xl" placeholder="${this.t('contact.placeholder_email')}">
                                    </div>
                                </div>
                                <div class="space-y-6">
                                    <label class="text-xs font-black uppercase text-stone-400 ml-8 tracking-[0.5em]">${this.t('contact.label_project_type')}</label>
                                    <div class="relative">
                                        <select name="service" class="w-full bg-stone-50 p-8 rounded-xl outline-none focus:ring-8 focus:ring-primary/10 border-4 border-transparent focus:border-primary transition-all font-black text-xl appearance-none">
                                            <option>Custom Web Application</option>
                                            <option>Mobile App (Android/iOS)</option>
                                            <option>Generative AI Agent</option>
                                            <option>Hospital/Hotel ERP</option>
                                            <option>Ecommerce / POS System</option>
                                        </select>
                                        <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <i class="fa fa-chevron-down text-primary text-xl"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-6">
                                    <label class="text-xs font-black uppercase text-stone-400 ml-8 tracking-[0.5em]">${this.t('contact.label_message')}</label>
                                    <textarea name="message" rows="5" required class="w-full bg-stone-50 p-8 rounded-xl outline-none focus:ring-8 focus:ring-primary/10 border-4 border-transparent focus:border-primary transition-all font-black text-xl" placeholder="${this.t('contact.placeholder_message')}"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-solar-gradient text-white p-10 rounded-xl font-black text-3xl shadow-[0_40px_80px_-20px_rgba(234,88,12,0.4)] hover:-translate-y-2 transition-all uppercase tracking-[0.2em] ">
                                    ${this.t('contact.btn_send')}
                                </button>
                            </form>
                        </div>

                        <div class="space-y-12 reveal-on-scroll" style="transition-delay: 0.3s">
                            <div class="bg-dark text-white p-20 rounded-xl space-y-16 relative overflow-hidden border border-stone-800">
                                <div class="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-20"></div>
                                <div class="relative z-10 space-y-16">
                                    <div>
                                        <h5 class="text-primary font-black uppercase text-xs tracking-[0.5em] mb-10">${this.t('contact.hq')}</h5>
                                        <div class="space-y-10">
                                            <div>
                                                <p class="text-2xl font-black text-white mb-4 tracking-tighter uppercase ">${this.t('contact.office_riyadh')}</p>
                                                <p class="text-stone-400 font-bold leading-relaxed mb-6">6943 Ibn Aous Road, Riyadh, KSA</p>
                                                <a href="tel:+966597441504" class="text-3xl font-black text-primary hover:text-white transition-colors tracking-tighter">+966 59 744 1504</a>
                                            </div>
                                            <div class="pt-10 border-t border-stone-800">
                                                <p class="text-2xl font-black text-white mb-4 tracking-tighter uppercase ">${this.t('contact.office_lahore')}</p>
                                                <p class="text-stone-400 font-bold leading-relaxed mb-6">73 3 D1 Green Town, Lahore, PK</p>
                                                <a href="tel:+923124277939" class="text-3xl font-black text-primary hover:text-white transition-colors tracking-tighter">+92 312 4277939</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="pt-16 border-t border-stone-800">
                                        <p class="text-xs font-black text-stone-500 uppercase tracking-[0.5em] mb-6">${this.t('contact.direct_email')}</p>
                                        <a href="mailto:info@loopstech.com" class="text-4xl font-black text-white hover:text-primary transition-colors tracking-tighter underline decoration-primary decoration-8">info@loopstech.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  },

  renderFooter () {
    const footer = document.querySelector('footer')
    if (!footer) return

    const langPrefix = this.state.lang === 'en' ? '' : `/${this.state.lang}`

    footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
                    <div class="space-y-10">
                        <img src="/img/loopstech-logo.png" alt="Loops Technologies" class="h-14 w-auto brightness-0 invert hover:rotate-3 transition-transform">
                        <p class="text-xl leading-relaxed font-bold text-stone-500">${this.t('footer.desc')}</p>
                        <div class="flex gap-6">
                            ${[
                              'facebook-f',
                              'linkedin-in',
                              'instagram',
                              'twitter'
                            ]
                              .map(
                                icon => `
                                <a href="#" class="w-14 h-14 rounded-lg bg-stone-900 flex items-center justify-center text-white hover:bg-primary hover:-translate-y-2 transition-all shadow-xl border border-stone-800">
                                    <i class="fab fa-${icon} text-xl"></i>
                                </a>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-white font-black mb-12 uppercase text-xs tracking-[0.6em] ">${this.t('footer.expertise_title')}</h4>
                        <ul class="space-y-8 text-sm font-black uppercase tracking-[0.2em]">
                            <li><a href="${langPrefix}/services/web-apps" class="hover:text-primary transition-all">Web Applications</a></li>
                            <li><a href="${langPrefix}/services/mobile-apps" class="hover:text-primary transition-all">Mobile Solutions</a></li>
                            <li><a href="${langPrefix}/ai-solutions" class="hover:text-primary transition-all">AI Business Core</a></li>
                            <li><a href="${langPrefix}/services/erp-crm" class="hover:text-primary transition-all">ERP & CRM</a></li>
                        </ul>
                    </div>
                    <div class="lg:col-span-2 space-y-12">
                        <h4 class="text-white font-black uppercase text-xs tracking-[0.6em] mb-12 ">${this.t('footer.work_with_us_title')}</h4>
                        <p class="text-4xl lg:text-5xl text-stone-200  font-black leading-[1.1] tracking-tighter uppercase">${this.t('footer.quote')}</p>
                        <div class="flex flex-col sm:flex-row items-center gap-12 pt-8">
                            <a href="${langPrefix}/contact" class="bg-white text-dark px-14 py-6 rounded-xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-primary hover:text-white transition-all w-full sm:w-auto text-center">${this.t('footer.btn_contact')}</a>
                            <span class="text-xs font-black text-primary uppercase tracking-[0.5em] flex items-center gap-4"><i class="fa fa-certificate text-3xl text-primary animate-spin-slow"></i> ${this.t('footer.audit_badge')}</span>
                        </div>
                    </div>
                </div>
                <div class="pt-16 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center text-[11px] font-black uppercase tracking-[0.6em] gap-10">
                    <p class="text-stone-600">${this.t('footer.copyright')}</p>
                    <div class="flex gap-16">
                        <a href="${langPrefix}/about" class="hover:text-white transition-colors">${this.t('footer.link_journey')}</a>
                        <a href="${langPrefix}/contact" class="hover:text-white transition-colors">${this.t('footer.link_start')}</a>
                    </div>
                </div>
            </div>
        `
  }
}

window.addEventListener('DOMContentLoaded', () => App.init())
