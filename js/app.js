const App = {
    state: {
        lang: localStorage.getItem('lang') || 'en',
        route: window.location.pathname.replace('/', '') || 'home',
        translations: {},
        services: [],
        projects: [],
        pages: [],
        isTransitioning: false
    },

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.setupRevealObserver();
        this.render();
        this.updateHTMLLangAttributes();
        this.updateLanguageSwitcherUI();
    },

    async loadData() {
        try {
            const [i18n, services, projects, pages] = await Promise.all([
                fetch(`/data/i18n/${this.state.lang}.json`).then(res => res.json()),
                fetch('/data/services.json').then(res => res.json()),
                fetch('/data/projects.json').then(res => res.json()),
                fetch('/data/pages.json').then(res => res.json())
            ]);

            this.state.translations = i18n;
            this.state.services = services;
            this.state.projects = projects;
            this.state.pages = pages;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    setupEventListeners() {
        window.addEventListener('popstate', () => {
            const newRoute = window.location.pathname.replace('/', '') || 'home';
            this.navigateTo(newRoute);
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link && !link.getAttribute('target')) {
                const href = link.getAttribute('href');
                if (href.startsWith('/') && !href.includes(':')) {
                    e.preventDefault();
                    const newRoute = href.replace('/', '') || 'home';
                    if (newRoute !== this.state.route) {
                        this.navigateTo(newRoute);
                    }
                }
            }
            if (e.target.closest('#mobile-menu-btn')) {
                document.getElementById('mobile-menu').classList.remove('hidden');
                document.getElementById('mobile-menu').classList.add('flex');
            }
            if (e.target.closest('#close-menu') || e.target.closest('#mobile-menu a')) {
                document.getElementById('mobile-menu').classList.add('hidden');
                document.getElementById('mobile-menu').classList.remove('flex');
            }
        });
    },

    setupRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        // This needs to be called after content is rendered
        this.observeElements = () => {
            document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
        };
    },

    async navigateTo(route) {
        if (this.state.isTransitioning) return;
        this.state.isTransitioning = true;

        const layer = document.getElementById('app-transition-layer');
        layer.classList.remove('finished');
        layer.classList.add('active');

        setTimeout(async () => {
            this.state.route = route;
            window.history.pushState({}, '', '/' + (route === 'home' ? '' : route));
            this.render();
            window.scrollTo(0, 0);

            setTimeout(() => {
                layer.classList.remove('active');
                layer.classList.add('finished');
                this.state.isTransitioning = false;
            }, 300);
        }, 600);
    },

    async setLanguage(lang) {
        this.state.lang = lang;
        localStorage.setItem('lang', lang);
        await this.loadData();
        this.updateHTMLLangAttributes();
        this.updateLanguageSwitcherUI();
        this.render();
    },

    updateHTMLLangAttributes() {
        document.documentElement.lang = this.state.lang;
        document.documentElement.dir = this.state.lang === 'ar' ? 'rtl' : 'ltr';
        if (this.state.lang === 'ar') {
            document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
        } else {
            document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        }
    },

    updateLanguageSwitcherUI() {
        ['en', 'ar', 'ro'].forEach(l => {
            const btn = document.getElementById(`lang-${l}`);
            if (btn) {
                if (l === this.state.lang) {
                    btn.classList.add('bg-primary', 'text-white', 'shadow-md');
                    btn.classList.remove('hover:bg-white');
                } else {
                    btn.classList.remove('bg-primary', 'text-white', 'shadow-md');
                    btn.classList.add('hover:bg-white');
                }
            }
        });
    },

    t(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.state.translations) || path;
    },

    render() {
        this.updateSEO();
        this.renderNavigation();
        this.renderContent();
        this.renderFooter();
        this.updateActiveNavLink();
        if (this.observeElements) this.observeElements();
    },

    updateSEO() {
        const isServiceDetail = this.state.route.startsWith('services/');
        if (isServiceDetail) {
            const serviceId = this.state.route.split('/')[1];
            const service = this.state.services.find(s => s.id === serviceId);
            if (service) {
                document.title = `${service.title[this.state.lang]} | Loops Technologies`;
                const description = document.querySelector('meta[name="description"]');
                if (description) description.setAttribute('content', service.description[this.state.lang]);
                return;
            }
        }

        const page = this.state.pages.find(p => p.id === this.state.route) || this.state.pages[0];
        document.title = `${this.t('nav.' + page.nav_key)} | Loops Technologies`;
        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', this.t('hero.subtitle'));
    },

    renderNavigation() {
        const navContainer = document.getElementById('nav-links');
        const mobileNavContainer = document.getElementById('mobile-nav-links');
        
        const linksHTML = this.state.pages.filter(p => p.show_in_nav).map(page => `
            <a href="/${page.id}" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">
                ${this.t('nav.' + page.nav_key)}
            </a>
        `).join('');

        const mobileLinksHTML = this.state.pages.filter(p => p.show_in_nav).map(page => `
            <a href="/${page.id}" class="text-3xl font-extrabold text-slate-900 hover:text-primary transition-colors">${this.t('nav.' + page.nav_key)}</a>
        `).join('');

        if (navContainer) navContainer.innerHTML = linksHTML;
        if (mobileNavContainer) mobileNavContainer.innerHTML = mobileLinksHTML;

        const liveChatBtn = document.getElementById('live-chat-text');
        if (liveChatBtn) liveChatBtn.innerText = this.t('nav.live_chat');
    },

    updateActiveNavLink() {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href').replace('/', '') || 'home';
            if (href === this.state.route || (this.state.route.startsWith('services') && href === 'services')) {
                link.classList.add('text-primary', 'after:w-full');
                link.classList.remove('text-slate-600');
            } else {
                link.classList.remove('text-primary', 'after:w-full');
                link.classList.add('text-slate-600');
            }
        });
    },

    renderContent() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        if (this.state.route.startsWith('services/')) {
            const serviceId = this.state.route.split('/')[1];
            appContainer.innerHTML = this.getServiceDetailHTML(serviceId);
            return;
        }

        switch (this.state.route) {
            case 'home':
                appContainer.innerHTML = this.getHomeHTML();
                this.renderHomeServices();
                break;
            case 'services':
                appContainer.innerHTML = this.getServicesListHTML();
                this.renderFullServices();
                break;
            case 'projects':
                appContainer.innerHTML = this.getPortfolioHTML();
                this.renderProjects();
                break;
            case 'ai-solutions':
                appContainer.innerHTML = this.getServicesListHTML(true);
                this.renderFullServices(true);
                break;
            case 'about':
                appContainer.innerHTML = this.getAboutHTML();
                break;
            case 'contact':
                appContainer.innerHTML = this.getContactHTML();
                break;
            default:
                appContainer.innerHTML = this.getHomeHTML();
                this.renderHomeServices();
        }
    },

    getHomeHTML() {
        return `
            <!-- Hero -->
            <section class="py-20 lg:py-36 px-4 bg-soft-gradient overflow-hidden">
                <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-10 relative z-10 animate-slide-up">
                        <div class="inline-flex items-center gap-3 bg-indigo-100 text-primary px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                            <span class="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                            ${this.t('hero.badge')}
                        </div>
                        <h1 class="text-6xl lg:text-8xl font-black text-dark leading-[1.1] tracking-tighter">
                            ${this.t('hero.title')}
                        </h1>
                        <p class="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                            ${this.t('hero.subtitle')}
                        </p>
                        <div class="flex flex-col sm:flex-row gap-6">
                            <a href="/contact" class="bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
                                ${this.t('hero.btn_audit')} <i class="fa fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                            </a>
                            <a href="/services" class="bg-white border-2 border-slate-200 text-dark px-12 py-5 rounded-2xl font-black text-lg hover:border-primary hover:text-primary transition-all text-center">
                                ${this.t('hero.btn_services')}
                            </a>
                        </div>
                    </div>
                    <div class="relative animate-reveal">
                        <div class="absolute -top-20 -right-20 w-96 h-96 bg-indigo-200 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                        <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                        <img src="img/loopstech-main-photograph.jpg" alt="Tech Excellence" class="rounded-[60px] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] relative z-10 border-[12px] border-white animate-float">
                        <div class="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl border border-slate-50 z-20 hidden md:block hover:scale-110 transition-transform cursor-default">
                            <p class="text-primary font-black text-5xl mb-1">${this.t('hero.expertise')}</p>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">${this.t('hero.expertise_text')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Homepage Services Showcase -->
            <section class="py-32 px-4 bg-white relative">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-secondary font-black uppercase tracking-[0.4em] text-xs">${this.t('home.services_badge')}</h2>
                        <h3 class="text-5xl lg:text-6xl font-black text-dark tracking-tighter">${this.t('home.services_title')}</h3>
                        <p class="text-slate-400 max-w-2xl mx-auto text-lg font-medium">${this.t('home.services_subtitle')}</p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10" id="home-services-grid"></div>

                    <div class="text-center mt-20 reveal-on-scroll">
                        <a href="/services" class="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-sm hover:gap-5 transition-all group">
                            <span class="border-b-4 border-indigo-100 group-hover:border-primary transition-colors pb-1">${this.t('home.services_all')}</span>
                            <i class="fa fa-chevron-right text-xs"></i>
                        </a>
                    </div>
                </div>
            </section>

            <!-- Local Trust / Stats -->
            <section class="py-32 bg-dark text-white relative overflow-hidden">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-20 text-center relative z-10">
                    <div class="reveal-on-scroll" style="transition-delay: 0.1s">
                        <h4 class="text-7xl font-black mb-4 text-primary tracking-tighter">${this.t('home.stats_projects')}</h4>
                        <p class="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">${this.t('home.stats_projects_text')}</p>
                    </div>
                    <div class="reveal-on-scroll" style="transition-delay: 0.2s">
                        <h4 class="text-7xl font-black mb-4 text-secondary tracking-tighter">${this.t('home.stats_riyadh')}</h4>
                        <p class="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">${this.t('home.stats_riyadh_text')}</p>
                    </div>
                    <div class="reveal-on-scroll" style="transition-delay: 0.3s">
                        <h4 class="text-7xl font-black mb-4 text-primary tracking-tighter">${this.t('home.stats_lahore')}</h4>
                        <p class="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">${this.t('home.stats_lahore_text')}</p>
                    </div>
                </div>
            </section>

            <!-- Industry Specialized Solutions -->
            <section class="py-32 px-4 bg-light">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.4em] text-xs">${this.t('home.specialized_badge')}</h2>
                        <h3 class="text-5xl font-black text-dark tracking-tighter">${this.t('home.specialized_title')}</h3>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${[
                            { icon: 'fa-hospital', title: 'Hospitals', desc: 'Full patient management and pharmacy systems built for large clinics.' },
                            { icon: 'fa-cash-register', title: 'POS Systems', desc: 'Fast, secure checkout systems for retail and restaurant chains.' },
                            { icon: 'fa-truck-fast', title: 'Rider Apps', desc: 'Complete logistics and delivery tracking for rider-based fleets.' },
                            { icon: 'fa-bed', title: 'Hotel ERP', desc: 'Booking engines and housekeeping management for hotels.' }
                        ].map((item, idx) => `
                            <div class="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 card-hover reveal-on-scroll" style="transition-delay: ${idx * 0.1}s">
                                <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary mb-8">
                                    <i class="fa ${item.icon} text-2xl"></i>
                                </div>
                                <h5 class="text-2xl font-black mb-4 tracking-tighter">${item.title}</h5>
                                <p class="text-slate-500 leading-relaxed font-medium">${item.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    },

    renderHomeServices() {
        const grid = document.getElementById('home-services-grid');
        if (!grid) return;
        
        grid.innerHTML = this.state.services.slice(0, 6).map((s, idx) => `
            <div class="p-12 rounded-[50px] border border-slate-100 bg-white card-hover group text-left reveal-on-scroll" style="transition-delay: ${idx * 0.1}s">
                <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <i class="fa ${s.icon} text-2xl"></i>
                </div>
                <h4 class="text-2xl font-black mb-4 uppercase tracking-tighter group-hover:text-primary transition-colors">${s.title[this.state.lang]}</h4>
                <p class="text-slate-400 text-sm leading-relaxed mb-8 font-medium">${s.description[this.state.lang]}</p>
                <a href="/services/${s.id}" class="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:gap-4 transition-all">
                    Learn More <i class="fa fa-arrow-right"></i>
                </a>
            </div>
        `).join('');
    },

    getServicesListHTML(isAIOnly = false) {
        return `
            <div class="py-32 px-4 bg-light">
                <div class="max-w-7xl mx-auto">
                    <div class="max-w-3xl mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.4em] text-xs">Our Expertise</h2>
                        <h2 class="text-6xl font-black text-dark tracking-tighter uppercase leading-none">${isAIOnly ? 'AI Support <span class="text-primary">Agents.</span>' : this.t('services.title')}</h2>
                        <p class="text-slate-500 text-xl font-medium leading-relaxed">${this.t('services.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10" id="full-services-grid"></div>
                </div>
            </div>
        `;
    },

    renderFullServices(isAIOnly = false) {
        const grid = document.getElementById('full-services-grid');
        if (!grid) return;

        let list = this.state.services;
        if (isAIOnly) {
            list = list.filter(s => s.id.includes('ai'));
        }

        grid.innerHTML = list.map((s, idx) => `
            <div class="p-12 rounded-[60px] border border-slate-100 bg-white card-hover group reveal-on-scroll" style="transition-delay: ${idx * 0.05}s">
                <div class="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <i class="fa ${s.icon} text-3xl"></i>
                </div>
                <h4 class="text-3xl font-black mb-6 uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">${s.title[this.state.lang]}</h4>
                <p class="text-slate-400 text-lg leading-relaxed mb-10 font-medium">${s.description[this.state.lang]}</p>
                <a href="/services/${s.id}" class="bg-indigo-50 text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all inline-block shadow-sm">
                    ${this.t('services.inquire_now')}
                </a>
            </div>
        `).join('');
    },

    getServiceDetailHTML(serviceId) {
        const service = this.state.services.find(s => s.id === serviceId);
        if (!service) return this.getHomeHTML();

        const otherServices = this.state.services.filter(s => s.id !== serviceId).slice(0, 6);

        return `
            <div class="py-20 lg:py-32 bg-white">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="grid lg:grid-cols-3 gap-16">
                        <!-- Main Content -->
                        <div class="lg:col-span-2 space-y-16 animate-fade-in">
                            <!-- Hero Section -->
                            <div class="space-y-8">
                                <a href="/services" class="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:-translate-x-2 transition-transform">
                                    <i class="fa fa-chevron-left"></i> All Services
                                </a>
                                <h1 class="text-6xl lg:text-7xl font-black text-dark tracking-tighter leading-none uppercase">
                                    ${service.title[this.state.lang]}
                                </h1>
                                <p class="text-2xl text-slate-400 font-medium leading-relaxed italic">
                                    "${service.description[this.state.lang]}"
                                </p>
                            </div>

                            <img src="${service.graphic || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}" class="w-full h-[500px] object-cover rounded-[60px] shadow-2xl reveal-on-scroll" alt="${service.title.en}">

                            <div class="prose prose-xl max-w-none text-slate-600 font-medium leading-[1.8] reveal-on-scroll">
                                ${service.longDescription ? service.longDescription[this.state.lang].split('\n').map(p => `<p class="mb-8">${p}</p>`).join('') : '<p>Detailed description coming soon...</p>'}
                            </div>

                            <!-- Features Grid -->
                            <div class="grid md:grid-cols-2 gap-8 reveal-on-scroll">
                                ${service.features ? service.features.map(f => `
                                    <div class="bg-light p-10 rounded-[40px] border border-slate-100 group hover:border-primary transition-colors">
                                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                            <i class="fa ${f.icon} text-xl"></i>
                                        </div>
                                        <h5 class="text-2xl font-black mb-4 tracking-tighter">${f.title[this.state.lang]}</h5>
                                        <p class="text-slate-400 font-medium leading-relaxed">${f.description[this.state.lang]}</p>
                                    </div>
                                `).join('') : ''}
                            </div>

                            <!-- Benefits & CTA -->
                            <div class="bg-primary p-12 lg:p-20 rounded-[60px] text-white space-y-10 reveal-on-scroll">
                                <h3 class="text-4xl font-black tracking-tighter uppercase italic">Why Choose Us for This?</h3>
                                <ul class="space-y-6">
                                    ${service.benefits ? service.benefits.map(b => `
                                        <li class="flex items-start gap-4 text-xl font-medium">
                                            <i class="fa fa-check-circle text-secondary mt-1 text-2xl"></i>
                                            <span>${b[this.state.lang]}</span>
                                        </li>
                                    `).join('') : ''}
                                </ul>
                                <div class="pt-10 border-t border-indigo-400/30 flex flex-col md:flex-row items-center gap-8">
                                    <a href="/contact" class="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl w-full md:w-auto text-center">
                                        Book Free Consultation
                                    </a>
                                    <p class="text-indigo-100 font-bold uppercase tracking-widest text-xs">No obligations . Honest expert advice</p>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="lg:col-span-1 space-y-12 animate-fade-in" style="animation-delay: 0.2s">
                            <!-- Sidebar List -->
                            <div class="bg-light p-10 rounded-[50px] border border-slate-100 sticky top-32">
                                <h4 class="text-2xl font-black mb-10 tracking-tighter uppercase border-b-4 border-indigo-100 pb-4">Other Services</h4>
                                <div class="space-y-6">
                                    ${otherServices.map(s => `
                                        <a href="/services/${s.id}" class="flex items-center gap-5 p-4 rounded-3xl hover:bg-white transition-all group ${s.id === serviceId ? 'bg-white pointer-events-none opacity-50' : ''}">
                                            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                <i class="fa ${s.icon}"></i>
                                            </div>
                                            <span class="font-black text-sm uppercase tracking-tighter group-hover:text-primary transition-colors">${s.title[this.state.lang]}</span>
                                        </a>
                                    `).join('')}
                                </div>

                                <!-- Tech Stack -->
                                <div class="mt-16 pt-10 border-t border-slate-200">
                                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Tech Stack</h4>
                                    <div class="flex flex-wrap gap-3">
                                        ${service.technologies ? service.technologies.map(t => `
                                            <span class="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">${t}</span>
                                        `).join('') : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getPortfolioHTML() {
        return `
            <div class="py-32 px-4 bg-light">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.4em] text-xs">Proven Results</h2>
                        <h2 class="text-6xl font-black text-dark tracking-tighter uppercase italic leading-none">${this.t('portfolio.title')}</h2>
                        <p class="text-slate-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">${this.t('portfolio.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12" id="projects-grid"></div>
                </div>
            </div>
        `;
    },

    renderProjects() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        grid.innerHTML = this.state.projects.map((p, idx) => `
            <div class="group cursor-pointer reveal-on-scroll" style="transition-delay: ${idx * 0.1}s">
                <div class="relative overflow-hidden rounded-[60px] shadow-2xl mb-10 border-[12px] border-white ring-1 ring-slate-100">
                    <img src="${p.img}" alt="${p.title}" class="w-full h-96 object-cover group-hover:scale-110 transition-all duration-1000">
                    <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-12">
                        <div>
                            <p class="text-secondary font-black uppercase text-xs tracking-[0.3em] mb-4">${p.type[this.state.lang]}</p>
                            <h4 class="text-white font-black text-4xl italic tracking-tighter uppercase">Case Study <i class="fa fa-arrow-right ml-2 text-xl"></i></h4>
                        </div>
                    </div>
                </div>
                <div class="px-8 text-center">
                    <h4 class="text-3xl font-black text-dark mb-4 tracking-tighter uppercase underline decoration-indigo-100 decoration-8 underline-offset-4 group-hover:decoration-primary transition-all">${p.title}</h4>
                    <p class="text-slate-400 text-lg leading-relaxed font-medium">${p.description[this.state.lang]}</p>
                </div>
            </div>
        `).join('');
    },

    getAboutHTML() {
        return `
            <div class="py-32 px-4 bg-white">
                <div class="max-w-7xl mx-auto space-y-32">
                    <div class="grid lg:grid-cols-2 gap-24 items-center">
                        <div class="space-y-10 reveal-on-scroll">
                            <h2 class="text-7xl font-black text-dark tracking-tighter uppercase leading-none italic">
                                Our <span class="text-primary underline decoration-indigo-100 decoration-[16px] underline-offset-[12px]">Journey.</span>
                            </h2>
                            <div class="space-y-8 text-xl text-slate-500 leading-relaxed font-medium">
                                <p>${this.t('about.text1')}</p>
                                <p class="border-l-8 border-primary pl-8 py-4 bg-indigo-50/50 rounded-r-3xl italic text-dark text-2xl">${this.t('about.text2')}</p>
                                <p>${this.t('about.text3')}</p>
                            </div>
                        </div>
                        <div class="relative animate-reveal">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="About Loops Tech" class="rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] grayscale hover:grayscale-0 transition-all duration-1000">
                            <div class="absolute -bottom-12 -left-12 bg-dark text-white p-12 rounded-[40px] shadow-2xl animate-float">
                                <p class="text-6xl font-black text-primary mb-2">${this.t('about.quality_audit')}</p>
                                <p class="text-xs font-black uppercase tracking-[0.4em] opacity-60">${this.t('about.quality_audit_text')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div class="bg-primary p-16 lg:p-32 rounded-[80px] text-white relative overflow-hidden reveal-on-scroll">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                        <h3 class="text-5xl font-black mb-20 text-center uppercase tracking-tighter italic relative z-10">Common Questions</h3>
                        <div class="grid md:grid-cols-2 gap-16 relative z-10">
                            ${[1, 2, 3, 4].map(i => `
                                <div class="space-y-4 group">
                                    <h5 class="text-2xl font-black text-white uppercase tracking-tighter flex gap-4 items-center">
                                        <span class="text-indigo-300 opacity-30 text-4xl italic">0${i}</span>
                                        ${this.t(`about.faq_q${i}`)}
                                    </h5>
                                    <p class="text-indigo-100 text-lg font-medium leading-relaxed pl-14">${this.t(`about.faq_a${i}`)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getContactHTML() {
        return `
            <div class="py-32 px-4 bg-light min-h-[90vh] flex items-center">
                <div class="max-w-7xl mx-auto w-full">
                    <div class="text-center mb-24 space-y-6 reveal-on-scroll">
                        <h2 class="text-primary font-black uppercase tracking-[0.4em] text-xs">Get In Touch</h2>
                        <h2 class="text-7xl font-black text-dark tracking-tighter uppercase leading-none italic">Let's <span class="text-primary">Talk.</span></h2>
                        <p class="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">${this.t('contact.subtitle')}</p>
                    </div>
                    
                    <div class="grid lg:grid-cols-3 gap-12 items-start">
                        <div class="lg:col-span-2 bg-white p-12 md:p-20 rounded-[60px] shadow-2xl border border-slate-100 reveal-on-scroll">
                            <form id="contact-form" class="space-y-12">
                                <div class="grid md:grid-cols-2 gap-10">
                                    <div class="space-y-4">
                                        <label class="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.4em]">${this.t('contact.label_name')}</label>
                                        <input type="text" name="name" required class="w-full bg-light p-6 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 border-2 border-transparent focus:border-primary transition-all font-bold" placeholder="${this.t('contact.placeholder_name')}">
                                    </div>
                                    <div class="space-y-4">
                                        <label class="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.4em]">${this.t('contact.label_email')}</label>
                                        <input type="email" name="email" required class="w-full bg-light p-6 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 border-2 border-transparent focus:border-primary transition-all font-bold" placeholder="${this.t('contact.placeholder_email')}">
                                    </div>
                                </div>
                                <div class="space-y-4">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.4em]">${this.t('contact.label_project_type')}</label>
                                    <select name="service" class="w-full bg-light p-6 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 border-2 border-transparent focus:border-primary transition-all font-bold appearance-none">
                                        <option>Custom Web Application</option>
                                        <option>Mobile App (Android/iOS)</option>
                                        <option>Generative AI Agent</option>
                                        <option>Hospital/Hotel ERP</option>
                                        <option>Ecommerce / POS System</option>
                                    </select>
                                </div>
                                <div class="space-y-4">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.4em]">${this.t('contact.label_message')}</label>
                                    <textarea name="message" rows="5" required class="w-full bg-light p-6 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 border-2 border-transparent focus:border-primary transition-all font-bold" placeholder="${this.t('contact.placeholder_message')}"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-primary text-white p-8 rounded-[40px] font-black text-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all uppercase tracking-[0.3em] active:scale-95">
                                    ${this.t('contact.btn_send')}
                                </button>
                            </form>
                        </div>

                        <div class="space-y-10 reveal-on-scroll" style="transition-delay: 0.2s">
                            <div class="bg-dark text-white p-16 rounded-[60px] space-y-12 relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                                <div class="relative z-10 space-y-12">
                                    <div>
                                        <h5 class="text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-6">${this.t('contact.hq')}</h5>
                                        <p class="text-xl font-black text-white mb-4 tracking-tighter">${this.t('contact.office_riyadh')}</p>
                                        <p class="text-sm text-slate-400 leading-relaxed mb-6 font-medium">6943 Ibn Aous Road, Al Nadheem, Riyadh, KSA</p>
                                        <a href="tel:+966597441504" class="text-2xl font-black hover:text-primary transition-colors">+966 59 744 1504</a>
                                    </div>
                                    <div class="pt-12 border-t border-slate-800">
                                        <p class="text-xl font-black text-white mb-4 tracking-tighter">${this.t('contact.office_lahore')}</p>
                                        <p class="text-sm text-slate-400 leading-relaxed mb-6 font-medium">73 3 D1 Green Town, Lahore, Pakistan</p>
                                        <a href="tel:+923124277939" class="text-2xl font-black hover:text-primary transition-colors">+92 312 4277939</a>
                                    </div>
                                    <div class="pt-12 border-t border-slate-800">
                                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">${this.t('contact.direct_email')}</p>
                                        <a href="mailto:info@loopstech.com" class="text-2xl font-black text-primary hover:text-white transition-colors">info@loopstech.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
                    <div class="space-y-8">
                        <img src="img/loopstech-logo.png" alt="Loops Technologies" class="h-10 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity">
                        <p class="text-lg leading-relaxed font-medium">${this.t('footer.desc')}</p>
                        <div class="flex gap-6">
                            ${['facebook-f', 'linkedin-in', 'instagram', 'twitter'].map(icon => `
                                <a href="#" class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white hover:bg-primary hover:-translate-y-1 transition-all shadow-lg">
                                    <i class="fab fa-${icon}"></i>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-white font-black mb-10 uppercase text-[10px] tracking-[0.5em]">${this.t('footer.expertise_title')}</h4>
                        <ul class="space-y-6 text-sm font-bold uppercase tracking-widest">
                            <li><a href="/services/web-apps" class="hover:text-primary transition-all">Custom Web Apps</a></li>
                            <li><a href="/services/mobile-apps" class="hover:text-primary transition-all">Mobile App Design</a></li>
                            <li><a href="/ai-solutions" class="hover:text-primary transition-all">AI Business Agents</a></li>
                            <li><a href="/services/erp-crm" class="hover:text-primary transition-all">ERP Solutions</a></li>
                        </ul>
                    </div>
                    <div class="lg:col-span-2 space-y-10">
                        <h4 class="text-white font-black uppercase text-[10px] tracking-[0.5em] mb-10">${this.t('footer.work_with_us_title')}</h4>
                        <p class="text-2xl text-slate-300 italic font-medium leading-relaxed">${this.t('footer.quote')}</p>
                        <div class="flex flex-col sm:flex-row items-center gap-10">
                            <a href="/contact" class="bg-white text-dark px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-primary hover:text-white transition-all w-full sm:w-auto text-center">${this.t('footer.btn_contact')}</a>
                            <span class="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-3"><i class="fa fa-check-circle text-xl text-secondary"></i> ${this.t('footer.audit_badge')}</span>
                        </div>
                    </div>
                </div>
                <div class="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] gap-8">
                    <p>${this.t('footer.copyright')}</p>
                    <div class="flex gap-12">
                        <a href="/about" class="hover:text-white transition-colors">${this.t('footer.link_journey')}</a>
                        <a href="/contact" class="hover:text-white transition-colors">${this.t('footer.link_start')}</a>
                    </div>
                </div>
            </div>
        `;
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
