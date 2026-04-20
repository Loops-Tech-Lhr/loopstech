const App = {
    state: {
        lang: localStorage.getItem('lang') || 'en',
        route: window.location.pathname.replace('/', '') || 'home',
        translations: {},
        services: [],
        projects: [],
        pages: []
    },

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.render();
        this.updateHTMLLangAttributes();
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
            this.state.route = window.location.pathname.replace('/', '') || 'home';
            this.render();
            window.scrollTo(0, 0);
        });

        document.addEventListener('click', (e) => {
            // Handle SPA link navigation
            const link = e.target.closest('a[href^="/"]');
            if (link && !link.getAttribute('target')) {
                const href = link.getAttribute('href');
                if (href.startsWith('/') && !href.includes(':')) {
                    e.preventDefault();
                    window.history.pushState({}, '', href);
                    this.state.route = href.replace('/', '') || 'home';
                    this.render();
                    window.scrollTo(0, 0);
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

    async setLanguage(lang) {
        this.state.lang = lang;
        localStorage.setItem('lang', lang);
        await this.loadData();
        this.updateHTMLLangAttributes();
        this.render();
    },

    updateHTMLLangAttributes() {
        document.documentElement.lang = this.state.lang;
        document.documentElement.dir = this.state.lang === 'ar' ? 'rtl' : 'ltr';
        // Force font change for Arabic
        if (this.state.lang === 'ar') {
            document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
        } else {
            document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        }
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
    },

    updateSEO() {
        const page = this.state.pages.find(p => p.id === this.state.route) || this.state.pages[0];
        document.title = `${this.t('nav.' + page.nav_key)} | Loops Technologies`;
        
        // Update meta tags if they exist
        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', this.t('hero.subtitle'));
    },

    renderNavigation() {
        const navContainer = document.getElementById('nav-links');
        const mobileNavContainer = document.getElementById('mobile-nav-links');
        
        const linksHTML = this.state.pages.map(page => `
            <a href="/${page.id}" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">${this.t('nav.' + page.nav_key)}</a>
        `).join('');

        const mobileLinksHTML = this.state.pages.map(page => `
            <a href="/${page.id}" class="text-4xl font-extrabold text-slate-900">${this.t('nav.' + page.nav_key)}</a>
        `).join('');

        if (navContainer) navContainer.innerHTML = linksHTML;
        if (mobileNavContainer) mobileNavContainer.innerHTML = mobileLinksHTML;

        // Update static UI in nav
        const liveChatBtn = document.getElementById('live-chat-text');
        if (liveChatBtn) liveChatBtn.innerText = this.t('nav.live_chat');
    },

    updateActiveNavLink() {
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === `/${this.state.route}`) {
                link.classList.add('text-primary');
                link.classList.remove('text-slate-600');
            } else {
                link.classList.remove('text-primary');
                link.classList.add('text-slate-600');
            }
        });
    },

    renderContent() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        switch (this.state.route) {
            case 'home':
                appContainer.innerHTML = this.getHomeHTML();
                this.renderHomeServices();
                break;
            case 'services':
                appContainer.innerHTML = this.getServicesHTML();
                this.renderFullServices();
                break;
            case 'portfolio':
                appContainer.innerHTML = this.getPortfolioHTML();
                this.renderProjects();
                break;
            case 'ai-solutions':
                appContainer.innerHTML = this.getServicesHTML();
                this.renderFullServices(true); // true means show only AI services
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
            <section class="py-16 lg:py-32 px-4 bg-radial-gradient">
                <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8 relative z-10">
                        <div class="inline-flex items-center gap-2 bg-blue-100 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span class="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                            ${this.t('hero.badge')}
                        </div>
                        <h1 class="text-5xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
                            ${this.t('hero.title')}
                        </h1>
                        <p class="text-lg text-slate-600 leading-relaxed max-w-xl">
                            ${this.t('hero.subtitle')}
                        </p>
                        <div class="flex flex-col sm:flex-row gap-5">
                            <a href="/contact" class="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                ${this.t('hero.btn_audit')} <i class="fa fa-arrow-right text-sm"></i>
                            </a>
                            <a href="/services" class="bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:border-primary transition-all text-center">
                                ${this.t('hero.btn_services')}
                            </a>
                        </div>
                    </div>
                    <div class="relative">
                        <img src="img/loopstech-main-photograph.jpg" alt="Tech Excellence" class="rounded-[40px] shadow-2xl relative z-10 border-8 border-white">
                        <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 z-20 hidden md:block">
                            <p class="text-primary font-black text-3xl">${this.t('hero.expertise')}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${this.t('hero.expertise_text')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Homepage Services Showcase -->
            <section class="py-24 px-4 bg-white border-y border-slate-100">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16 space-y-4">
                        <h2 class="text-primary font-bold uppercase tracking-widest text-sm">${this.t('home.services_badge')}</h2>
                        <h3 class="text-4xl lg:text-5xl font-black text-slate-900">${this.t('home.services_title')}</h3>
                        <p class="text-slate-500 max-w-2xl mx-auto">${this.t('home.services_subtitle')}</p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="home-services-grid"></div>

                    <div class="text-center mt-16">
                        <a href="/services" class="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:underline decoration-2 underline-offset-8">
                            ${this.t('home.services_all')} <i class="fa fa-chevron-right text-xs"></i>
                        </a>
                    </div>
                </div>
            </section>

            <!-- Local Trust / Stats -->
            <section class="py-24 bg-slate-950 text-white">
                <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-16 text-center">
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">${this.t('home.stats_projects')}</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">${this.t('home.stats_projects_text')}</p>
                    </div>
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">${this.t('home.stats_riyadh')}</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">${this.t('home.stats_riyadh_text')}</p>
                    </div>
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">${this.t('home.stats_lahore')}</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">${this.t('home.stats_lahore_text')}</p>
                    </div>
                </div>
            </section>

            <!-- Industry Specialized Solutions -->
            <section class="py-24 px-4 bg-slate-50">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16 space-y-4">
                        <h2 class="text-primary font-bold uppercase tracking-widest text-sm">${this.t('home.specialized_badge')}</h2>
                        <h3 class="text-4xl font-black text-slate-900">${this.t('home.specialized_title')}</h3>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 card-hover">
                            <i class="fa fa-hospital text-3xl text-primary mb-6"></i>
                            <h5 class="text-xl font-bold mb-3">Hospitals</h5>
                            <p class="text-sm text-slate-500 leading-relaxed">Full patient management and pharmacy systems built for large clinics.</p>
                        </div>
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 card-hover">
                            <i class="fa fa-cash-register text-3xl text-primary mb-6"></i>
                            <h5 class="text-xl font-bold mb-3">POS Systems</h5>
                            <p class="text-sm text-slate-500 leading-relaxed">Fast, secure checkout systems for retail and restaurant chains.</p>
                        </div>
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 card-hover">
                            <i class="fa fa-truck-fast text-3xl text-primary mb-6"></i>
                            <h5 class="text-xl font-bold mb-3">Rider Apps</h5>
                            <p class="text-sm text-slate-500 leading-relaxed">Complete logistics and delivery tracking for rider-based fleets.</p>
                        </div>
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 card-hover">
                            <i class="fa fa-bed text-3xl text-primary mb-6"></i>
                            <h5 class="text-xl font-bold mb-3">Hotel ERP</h5>
                            <p class="text-sm text-slate-500 leading-relaxed">Booking engines and housekeeping management for hotels.</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    renderHomeServices() {
        const grid = document.getElementById('home-services-grid');
        if (!grid) return;
        
        grid.innerHTML = this.state.services.slice(0, 6).map(s => `
            <div class="p-10 rounded-[40px] border border-slate-100 bg-white hover:border-primary transition-all group text-left">
                <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                    <i class="fa ${s.icon} text-xl"></i>
                </div>
                <h4 class="text-xl font-black mb-4 uppercase tracking-tighter">${s.title[this.state.lang]}</h4>
                <p class="text-slate-500 text-xs leading-relaxed">${s.description[this.state.lang]}</p>
            </div>
        `).join('');
    },

    getServicesHTML() {
        return `
            <div class="py-20 px-4">
                <div class="max-w-7xl mx-auto">
                    <div class="max-w-3xl mb-16 space-y-4">
                        <h2 class="text-5xl font-black text-slate-900 tracking-tighter uppercase">${this.t('services.title')}</h2>
                        <p class="text-slate-600 text-lg">${this.t('services.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="full-services-grid"></div>
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

        grid.innerHTML = list.map(s => `
            <div class="p-10 rounded-[50px] border border-slate-100 bg-white hover:border-primary transition-all group">
                <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                    <i class="fa ${s.icon} text-2xl"></i>
                </div>
                <h4 class="text-2xl font-black mb-4 uppercase tracking-tighter">${s.title[this.state.lang]}</h4>
                <p class="text-slate-500 text-sm leading-relaxed mb-8">${s.description[this.state.lang]}</p>
                <a href="/contact" class="font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-primary">
                    ${this.t('services.inquire_now')} <i class="fa fa-chevron-right text-[10px]"></i>
                </a>
            </div>
        `).join('');
    },

    getPortfolioHTML() {
        return `
            <div class="py-20 px-4 bg-slate-100">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-20 space-y-4">
                        <h2 class="text-5xl font-black text-slate-900 uppercase tracking-tighter italic">${this.t('portfolio.title')}</h2>
                        <p class="text-slate-500 font-bold">${this.t('portfolio.subtitle')}</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12" id="projects-grid"></div>
                </div>
            </div>
        `;
    },

    renderProjects() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        grid.innerHTML = this.state.projects.map(p => `
            <div class="group cursor-pointer">
                <div class="relative overflow-hidden rounded-[50px] shadow-lg mb-8 border border-slate-100">
                    <img src="${p.img}" alt="${p.title}" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-1000">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-12">
                        <div>
                            <p class="text-primary font-bold uppercase text-[10px] tracking-widest mb-2">${p.type[this.state.lang]}</p>
                            <h4 class="text-white font-black text-3xl italic">${this.t('portfolio.case_study')}</h4>
                        </div>
                    </div>
                </div>
                <div class="px-8">
                    <h4 class="text-2xl font-black text-slate-900 mb-2 underline decoration-primary decoration-4">${p.title}</h4>
                    <p class="text-slate-500 text-sm leading-relaxed">${p.description[this.state.lang]}</p>
                </div>
            </div>
        `).join('');
    },

    getAboutHTML() {
        return `
            <div class="py-20 px-4">
                <div class="max-w-7xl mx-auto space-y-24">
                    <div class="grid lg:grid-cols-2 gap-20 items-center">
                        <div class="space-y-8">
                            <h2 class="text-5xl font-black text-slate-900 tracking-tighter uppercase italic underline decoration-primary decoration-8">${this.t('about.title')}</h2>
                            <div class="space-y-6 text-lg text-slate-600 leading-relaxed">
                                <p>${this.t('about.text1')}</p>
                                <p>${this.t('about.text2')}</p>
                                <p>${this.t('about.text3')}</p>
                            </div>
                        </div>
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="About Loops Tech" class="rounded-[50px] shadow-2xl">
                            <div class="absolute -bottom-8 -left-8 bg-slate-900 text-white p-10 rounded-[30px] shadow-2xl">
                                <p class="text-4xl font-black text-primary uppercase">${this.t('about.quality_audit')}</p>
                                <p class="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">${this.t('about.quality_audit_text')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div class="bg-blue-600 text-white p-12 md:p-20 rounded-[50px] shadow-2xl">
                        <h3 class="text-3xl font-black mb-12 text-center uppercase tracking-widest italic">${this.t('about.faq_title')}</h3>
                        <div class="grid md:grid-cols-2 gap-12 text-sm leading-relaxed">
                            <div class="space-y-2">
                                <h5 class="font-bold text-white uppercase tracking-wider">${this.t('about.faq_q1')}</h5>
                                <p class="text-blue-100">${this.t('about.faq_a1')}</p>
                            </div>
                            <div class="space-y-2">
                                <h5 class="font-bold text-white uppercase tracking-wider">${this.t('about.faq_q2')}</h5>
                                <p class="text-blue-100">${this.t('about.faq_a2')}</p>
                            </div>
                            <div class="space-y-2">
                                <h5 class="font-bold text-white uppercase tracking-wider">${this.t('about.faq_q3')}</h5>
                                <p class="text-blue-100">${this.t('about.faq_a3')}</p>
                            </div>
                            <div class="space-y-2">
                                <h5 class="font-bold text-white uppercase tracking-wider">${this.t('about.faq_q4')}</h5>
                                <p class="text-blue-100">${this.t('about.faq_a4')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getContactHTML() {
        return `
            <div class="py-20 px-4 bg-slate-50">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16 space-y-4">
                        <h2 class="text-6xl font-black text-slate-900 tracking-tighter uppercase">${this.t('contact.title')}</h2>
                        <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">${this.t('contact.subtitle')}</p>
                    </div>
                    
                    <div class="grid lg:grid-cols-3 gap-12">
                        <div class="lg:col-span-2 bg-white p-10 md:p-16 rounded-[50px] shadow-xl border border-slate-100">
                            <form id="contact-form" class="space-y-8">
                                <div class="grid md:grid-cols-2 gap-8">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">${this.t('contact.label_name')}</label>
                                        <input type="text" name="name" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="${this.t('contact.placeholder_name')}">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">${this.t('contact.label_email')}</label>
                                        <input type="email" name="email" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="${this.t('contact.placeholder_email')}">
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">${this.t('contact.label_project_type')}</label>
                                    <select name="service" class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none appearance-none">
                                        <option>Custom Web Application</option>
                                        <option>Mobile App (Android/iOS)</option>
                                        <option>Generative AI Agent</option>
                                        <option>Hospital/Hotel ERP</option>
                                        <option>Ecommerce / POS System</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">${this.t('contact.label_message')}</label>
                                    <textarea name="message" rows="5" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="${this.t('contact.placeholder_message')}"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-primary text-white p-6 rounded-[30px] font-black text-xl shadow-2xl shadow-blue-400/30 hover:bg-blue-700 transition-all uppercase tracking-widest">${this.t('contact.btn_send')}</button>
                            </form>
                        </div>

                        <div class="space-y-8">
                            <div class="bg-slate-900 text-white p-12 rounded-[50px] space-y-10">
                                <div>
                                    <h5 class="text-primary font-bold uppercase text-xs tracking-widest mb-4">${this.t('contact.hq')}</h5>
                                    <p class="text-sm font-bold text-white mb-2 uppercase tracking-wider">${this.t('contact.office_riyadh')}</p>
                                    <p class="text-xs text-slate-400 leading-relaxed mb-2">6943 Ibn Aous Road, Al Nadheem, Riyadh, KSA</p>
                                    <p class="text-lg font-black">+966 59 744 1504</p>
                                </div>
                                <div class="pt-10 border-t border-slate-800">
                                    <p class="text-sm font-bold text-white mb-2 uppercase tracking-wider">${this.t('contact.office_lahore')}</p>
                                    <p class="text-xs text-slate-400 leading-relaxed mb-2">73 3 D1 Green Town, Lahore, Pakistan</p>
                                    <p class="text-lg font-black">+92 312 4277939</p>
                                </div>
                                <div class="pt-10 border-t border-slate-800">
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">${this.t('contact.direct_email')}</p>
                                    <p class="text-xl font-black text-primary">info@loopstech.com</p>
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
            <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                <div class="space-y-6">
                    <img src="img/loopstech-logo.png" alt="Loops Technologies" class="h-10 w-auto brightness-0 invert opacity-80">
                    <p class="text-sm leading-relaxed">${this.t('footer.desc')}</p>
                    <div class="flex gap-4">
                        <a href="https://www.facebook.com/Loops-Tech-121269685248381/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.linkedin.com/company/loopstech/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-linkedin-in"></i></a>
                        <a href="https://www.instagram.com/loopstechsol/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">${this.t('footer.expertise_title')}</h4>
                    <ul class="space-y-4 text-sm">
                        <li><a href="/services" class="hover:text-primary transition-all">Custom Web Apps</a></li>
                        <li><a href="/services" class="hover:text-primary transition-all">Mobile App Design</a></li>
                        <li><a href="/services" class="hover:text-primary transition-all">AI Business Agents</a></li>
                        <li><a href="/services" class="hover:text-primary transition-all">ERP Solutions</a></li>
                    </ul>
                </div>
                <div class="lg:col-span-2 space-y-6">
                    <h4 class="text-white font-bold uppercase text-[10px] tracking-[0.3em]">${this.t('footer.work_with_us_title')}</h4>
                    <p class="text-slate-400 italic text-sm">${this.t('footer.quote')}</p>
                    <div class="flex items-center gap-6">
                        <a href="/contact" class="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">${this.t('footer.btn_contact')}</a>
                        <span class="text-[10px] font-bold text-primary uppercase tracking-widest"><i class="fa fa-check mr-2"></i> ${this.t('footer.audit_badge')}</span>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em]">
                <p>${this.t('footer.copyright')}</p>
                <div class="flex gap-10 mt-4 md:mt-0">
                    <a href="/about" class="hover:text-white">${this.t('footer.link_journey')}</a>
                    <a href="/contact" class="hover:text-white">${this.t('footer.link_start')}</a>
                </div>
            </div>
        `;
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
