<?php
// PHP logic to handle the contact form
$message_sent = false;
$error_msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['email'])) {
    $to = "info@loopstech.com";
    $name = strip_tags(trim($_POST['name']));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $service = strip_tags(trim($_POST['service']));
    $message = strip_tags(trim($_POST['message']));

    if (!empty($name) && !empty($email) && !empty($message)) {
        $subject = "New Lead: $service - From $name";
        $headers = "From: $email\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";
        
        $email_content = "Name: $name\n";
        $email_content .= "Email: $email\n";
        $email_content .= "Service: $service\n\n";
        $email_content .= "Message:\n$message\n";

        // mail($to, $subject, $email_content, $headers); // Uncomment on live server
        $message_sent = true;
    } else {
        $error_msg = "Please fill in all required fields.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Favicon Links -->
    <link rel="icon" type="image/png" href="img/loopstech-favicon.png">
    <link rel="apple-touch-icon" href="img/loopstech-favicon.png">
    
    <!-- Professional SEO Meta Tags -->
    <title>Loops Technologies . Premier Software House in Riyadh & Lahore</title>
    <meta name="description" content="Loops Technologies provides expert Web Apps, Mobile Apps, Laravel development, and AI Support Agents. Trusted IT partner in Riyadh, Saudi Arabia and Lahore, Pakistan with 8+ years of experience.">
    <meta name="keywords" content="Software house Riyadh, Web development Lahore, Laravel developer Saudi Arabia, Mobile app development Riyadh, AI agents for business, Hospital management system, POS software Riyadh, Shopify experts, WordPress developers">
    <meta name="author" content="Mukarram Hussain">
    
    <!-- Social Sharing -->
    <meta property="og:title" content="Loops Technologies . High-Impact Software Solutions">
    <meta property="og:description" content="Expert Web, Mobile, and AI solutions with local support in Riyadh and Lahore. 8 years of proven excellence.">
    <meta property="og:image" content="img/loopstech-logo.png">
    <meta property="og:url" content="https://loopstech.com">

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
                    colors: { primary: '#2563eb', dark: '#020617', accent: '#3b82f6' }
                }
            }
        }
    </script>

    <style>
        .page-section { display: none; }
        .page-section.active { display: block; }
        .nav-link.active { color: #2563eb; }
        .glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); }
        .hero-gradient { background: radial-gradient(circle at top right, #eff6ff, #ffffff); }
        .card-hover:hover { transform: translateY(-8px); transition: all 0.4s ease; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 leading-relaxed overflow-x-hidden">

    <!-- Navigation -->
    <header class="fixed top-0 w-full z-50 glass border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <a href="#" onclick="showPage('home')" class="flex items-center gap-2">
                <!-- Using Logo from reference -->
                <img src="img/loopstech-logo.png" alt="Loops Technologies" class="h-10 md:h-12 w-auto" onerror="this.src='https://via.placeholder.com/200x60?text=LOOPS+TECH'">
            </a>

            <nav class="hidden lg:flex gap-10">
                <a href="javascript:void(0)" onclick="showPage('home')" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">Home</a>
                <a href="javascript:void(0)" onclick="showPage('services')" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">Services</a>
                <a href="javascript:void(0)" onclick="showPage('projects')" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">Portfolio</a>
                <a href="javascript:void(0)" onclick="showPage('about')" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">Our Story</a>
                <a href="javascript:void(0)" onclick="showPage('contact')" class="nav-link font-bold text-sm text-slate-600 hover:text-primary transition-all">Contact</a>
            </nav>

            <div class="flex items-center gap-4">
                <a href="https://wa.me/966597441504" class="hidden md:flex bg-green-500 text-white px-5 py-2 rounded-full text-xs font-bold items-center gap-2 hover:bg-green-600 shadow-lg transition-all">
                    <i class="fab fa-whatsapp text-lg"></i> Live Chat
                </a>
                <button id="mobile-menu-btn" class="lg:hidden p-2 text-2xl"><i class="fa fa-bars"></i></button>
            </div>
        </div>
    </header>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="fixed inset-0 bg-white z-[60] p-8 hidden flex-col gap-8 text-center justify-center">
        <button id="close-menu" class="absolute top-6 right-6 text-3xl"><i class="fa fa-times"></i></button>
        <a href="javascript:void(0)" onclick="showPage('home')" class="text-4xl font-extrabold text-slate-900">Home</a>
        <a href="javascript:void(0)" onclick="showPage('services')" class="text-4xl font-extrabold text-slate-900">Services</a>
        <a href="javascript:void(0)" onclick="showPage('projects')" class="text-4xl font-extrabold text-slate-900">Portfolio</a>
        <a href="javascript:void(0)" onclick="showPage('about')" class="text-4xl font-extrabold text-slate-900">About</a>
        <a href="javascript:void(0)" onclick="showPage('contact')" class="text-4xl font-extrabold text-slate-900">Contact</a>
    </div>

    <main class="mt-20">

        <!-- PAGE: HOME -->
        <div id="home" class="page-section active animate-fade-in">
            <!-- Hero -->
            <section class="py-16 lg:py-32 px-4 hero-gradient">
                <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8 relative z-10">
                        <div class="inline-flex items-center gap-2 bg-blue-100 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span class="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Expert Developers in Riyadh & Lahore
                        </div>
                        <h1 class="text-5xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
                            Engineering <span class="text-primary">Success</span> Through Smart Code.
                        </h1>
                        <p class="text-lg text-slate-600 leading-relaxed max-w-xl">
                            With over 10 years of experience, we help businesses transform their ideas into powerful digital products. From web apps to custom ERPs, we deliver tech that scales.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-5">
                            <button onclick="showPage('contact')" class="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                Get a Free Audit <i class="fa fa-arrow-right text-sm"></i>
                            </button>
                            <button onclick="showPage('services')" class="bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:border-primary transition-all">
                                Explore Services
                            </button>
                        </div>
                    </div>
                    <div class="relative">
                        <img src="/img/loopstech-main-photograph.jpg?auto=format&fit=crop&w=800&q=80" alt="Tech Excellence" class="rounded-[40px] shadow-2xl relative z-10 border-8 border-white">
                        <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 z-20 hidden md:block">
                            <p class="text-primary font-black text-3xl">10+ Yrs</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry Expertise</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Homepage Services Showcase (Min 4 Services) -->
            <section class="py-24 px-4 bg-white border-y border-slate-100">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16 space-y-4">
                        <h2 class="text-primary font-bold uppercase tracking-widest text-sm">What We Do Best</h2>
                        <h3 class="text-4xl lg:text-5xl font-black text-slate-900">Comprehensive Tech <span class="text-primary">Solutions.</span></h3>
                        <p class="text-slate-500 max-w-2xl mx-auto">We don't just build sites. we build assets that help your business earn more and manage less.</p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8" id="home-services-grid">
                        <!-- Loaded via JS with at least 4 services -->
                    </div>

                    <div class="text-center mt-16">
                        <button onclick="showPage('services')" class="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:underline decoration-2 underline-offset-8">
                            Browse All Capabilities <i class="fa fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </section>

            <!-- Local Trust / Stats -->
            <section class="py-24 bg-slate-950 text-white">
                <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-16 text-center">
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">250+</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Projects Delivered</p>
                    </div>
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">Riyadh</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Saudi Arabia Hub</p>
                    </div>
                    <div>
                        <h4 class="text-5xl font-black mb-2 text-primary uppercase">Lahore</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Pakistan Center</p>
                    </div>
                </div>
            </section>

            <!-- Industry Specialized Solutions -->
            <section class="py-24 px-4 bg-slate-50">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-16 space-y-4">
                        <h2 class="text-primary font-bold uppercase tracking-widest text-sm">Specialized ERPs</h2>
                        <h3 class="text-4xl font-black text-slate-900">Software for Your Industry.</h3>
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
        </div>

        <!-- PAGE: SERVICES -->
        <div id="services" class="page-section py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="max-w-3xl mb-16 space-y-4">
                    <h2 class="text-5xl font-black text-slate-900 tracking-tighter uppercase">Full <span class="text-primary">Service List.</span></h2>
                    <p class="text-slate-600 text-lg">We use modern tech stacks like Laravel, PHP, WordPress, and Shopify to build high-speed solutions.</p>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="full-services-grid">
                    <!-- Loaded via JS -->
                </div>
            </div>
        </div>

        <!-- PAGE: PROJECTS -->
        <div id="projects" class="page-section py-20 px-4 bg-slate-100">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-20 space-y-4">
                    <h2 class="text-5xl font-black text-slate-900 uppercase tracking-tighter italic">Our <span class="text-primary">Legacy.</span></h2>
                    <p class="text-slate-500 font-bold">Real projects that solved real problems for our global clients.</p>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12" id="projects-grid">
                    <!-- Project cards loaded via JS -->
                </div>
            </div>
        </div>

        <!-- PAGE: ABOUT -->
        <div id="about" class="page-section py-20 px-4">
            <div class="max-w-7xl mx-auto space-y-24">
                <div class="grid lg:grid-cols-2 gap-20 items-center">
                    <div class="space-y-8">
                        <h2 class="text-5xl font-black text-slate-900 tracking-tighter uppercase italic underline decoration-primary decoration-8">Our Journey.</h2>
                        <div class="space-y-6 text-lg text-slate-600 leading-relaxed">
                            <p>Founded in 2013, Loops Technologies has always been about one thing: purely technology-driven solutions. We aren't just developers. we are partners in your growth.</p>
                            <p>Founder Mukarram Hussain has spent over 10 years perfecting the art of software engineering. His expertise in PHP, Laravel, and Modern JS frameworks is the foundation of everything we build.</p>
                            <p>Today, we operate from Riyadh and Lahore, bringing together the best talent to serve clients in the Middle East and beyond with honesty and excellence.</p>
                        </div>
                    </div>
                    <div class="relative">
                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="About Loops Tech" class="rounded-[50px] shadow-2xl">
                        <div class="absolute -bottom-8 -left-8 bg-slate-900 text-white p-10 rounded-[30px] shadow-2xl">
                            <p class="text-4xl font-black text-primary uppercase">100%</p>
                            <p class="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Quality Audit</p>
                        </div>
                    </div>
                </div>

                <!-- FAQ -->
                <div class="bg-blue-600 text-white p-12 md:p-20 rounded-[50px] shadow-2xl">
                    <h3 class="text-3xl font-black mb-12 text-center uppercase tracking-widest italic">Common Questions</h3>
                    <div class="grid md:grid-cols-2 gap-12 text-sm leading-relaxed">
                        <div class="space-y-2">
                            <h5 class="font-bold text-white uppercase tracking-wider">How do we start?</h5>
                            <p class="text-blue-100">We start with a free consultation to understand your needs, followed by a detailed quote and roadmap.</p>
                        </div>
                        <div class="space-y-2">
                            <h5 class="font-bold text-white uppercase tracking-wider">Do you support after launch?</h5>
                            <p class="text-blue-100">Yes. We provide 30 days of free technical support and affordable monthly maintenance plans.</p>
                        </div>
                        <div class="space-y-2">
                            <h5 class="font-bold text-white uppercase tracking-wider">Are the solutions custom?</h5>
                            <p class="text-blue-100">Yes. We build everything from scratch to ensure your software fits your business perfectly.</p>
                        </div>
                        <div class="space-y-2">
                            <h5 class="font-bold text-white uppercase tracking-wider">Where are you located?</h5>
                            <p class="text-blue-100">We have a core team in Riyadh, KSA and a large development center in Lahore, Pakistan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PAGE: CONTACT -->
        <div id="contact" class="page-section py-20 px-4 bg-slate-50">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 space-y-4">
                    <h2 class="text-6xl font-black text-slate-900 tracking-tighter uppercase">Let's <span class="text-primary">Talk.</span></h2>
                    <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Based in Riyadh & Lahore . Serving Worldwide.</p>
                </div>
                
                <div class="grid lg:grid-cols-3 gap-12">
                    <div class="lg:col-span-2 bg-white p-10 md:p-16 rounded-[50px] shadow-xl border border-slate-100">
                        <?php if($message_sent): ?>
                        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-2xl mb-8">
                            <p class="font-bold uppercase tracking-widest text-[10px]">Success!</p>
                            <p class="text-sm">We've received your request. Expect a reply within 24 hours.</p>
                        </div>
                        <?php endif; ?>

                        <form method="POST" action="index.php" class="space-y-8">
                            <div class="grid md:grid-cols-2 gap-8">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Full Name</label>
                                    <input type="text" name="name" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="e.g. Abdullah Hussain">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Address</label>
                                    <input type="email" name="email" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="name@company.com">
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Project Type</label>
                                <select name="service" class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none appearance-none">
                                    <option>Custom Web Application</option>
                                    <option>Mobile App (Android/iOS)</option>
                                    <option>Generative AI Agent</option>
                                    <option>Hospital/Hotel ERP</option>
                                    <option>Ecommerce / POS System</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">How can we help?</label>
                                <textarea name="message" rows="5" required class="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 border-none" placeholder="Describe your project vision..."></textarea>
                            </div>
                            <button type="submit" class="w-full bg-primary text-white p-6 rounded-[30px] font-black text-xl shadow-2xl shadow-blue-400/30 hover:bg-blue-700 transition-all uppercase tracking-widest">Send Inquiry</button>
                        </form>
                    </div>

                    <div class="space-y-8">
                        <div class="bg-slate-900 text-white p-12 rounded-[50px] space-y-10">
                            <div>
                                <h5 class="text-primary font-bold uppercase text-xs tracking-widest mb-4">Headquarters</h5>
                                <p class="text-sm font-bold text-white mb-2 uppercase tracking-wider">Riyadh Office</p>
                                <p class="text-xs text-slate-400 leading-relaxed mb-2">6943 Ibn Aous Road, Al Nadheem, Riyadh, KSA</p>
                                <p class="text-lg font-black">+966 59 744 1504</p>
                            </div>
                            <div class="pt-10 border-t border-slate-800">
                                <p class="text-sm font-bold text-white mb-2 uppercase tracking-wider">Lahore Office</p>
                                <p class="text-xs text-slate-400 leading-relaxed mb-2">73 3 D1 Green Town, Lahore, Pakistan</p>
                                <p class="text-lg font-black">+92 312 4277939</p>
                            </div>
                            <div class="pt-10 border-t border-slate-800">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Email</p>
                                <p class="text-xl font-black text-primary">info@loopstech.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 pt-20 pb-10 mt-20">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div class="space-y-6">
                <img src="img/loopstech-logo.png" alt="Loops Technologies" class="h-10 w-auto brightness-0 invert opacity-80">
                <p class="text-sm leading-relaxed">Innovative software solutions since 2013. We bridge the gap between business needs and digital execution with expert code.</p>
                <div class="flex gap-4">
                    <a href="https://www.facebook.com/Loops-Tech-121269685248381/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.linkedin.com/company/loopstech/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-linkedin-in"></i></a>
                    <a href="https://www.instagram.com/loopstechsol/" class="text-slate-400 hover:text-white transition-all"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            <div>
                <h4 class="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Expertise</h4>
                <ul class="space-y-4 text-sm">
                    <li class="hover:text-primary cursor-pointer" onclick="showPage('services')">Custom Web Apps</li>
                    <li class="hover:text-primary cursor-pointer" onclick="showPage('services')">Mobile App Design</li>
                    <li class="hover:text-primary cursor-pointer" onclick="showPage('services')">AI Business Agents</li>
                    <li class="hover:text-primary cursor-pointer" onclick="showPage('services')">ERP Solutions</li>
                </ul>
            </div>
            <div class="lg:col-span-2 space-y-6">
                <h4 class="text-white font-bold uppercase text-[10px] tracking-[0.3em]">Work With Us</h4>
                <p class="text-slate-400 italic text-sm">"Expertise is not just about writing code. it's about understanding the human behind the business."</p>
                <div class="flex items-center gap-6">
                    <button onclick="showPage('contact')" class="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">Contact Today</button>
                    <span class="text-[10px] font-bold text-primary uppercase tracking-widest"><i class="fa fa-check mr-2"></i> Free Project Audit</span>
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em]">
            <p>© 2026 LOOPS TECHNOLOGIES . All Right are reserved.</p>
            <div class="flex gap-10 mt-4 md:mt-0">
                <a href="javascript:void(0)" onclick="showPage('about')" class="hover:text-white">Our Journey</a>
                <a href="javascript:void(0)" onclick="showPage('contact')" class="hover:text-white">Start Project</a>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        const services = [
            { id: "web", title: "Web Applications", icon: "fa-laptop-code", desc: "Expert Laravel and PHP development for custom business portals, SaaS platforms, and high-performance management tools." },
            { id: "mob", title: "Mobile App Development", icon: "fa-mobile-screen-button", desc: "Native-quality apps for iOS and Android using Flutter and React Native. Seamless user experiences for your customers." },
            { id: "ai", title: "Generative AI Agents", icon: "fa-robot", desc: "Integrating smart AI agents into your business to automate support, sales, and complex data processing tasks." },
            { id: "eco", title: "Ecommerce & Shopify", icon: "fa-store", desc: "Full-scale online stores built for conversion. We specialize in custom Shopify themes and powerful WooCommerce setups." },
            { id: "erp", title: "Custom ERP & CRM", icon: "fa-database", desc: "Specialized software for Hospitals, Hotels, POS systems, and Delivery management. Tailored exactly to your workflow." },
            { id: "cms", title: "WordPress & Maintenance", icon: "fa-wordpress", desc: "Fast, professional, and secure WordPress sites for businesses that need to move quickly and rank on search engines." }
        ];

        const projects = [
            { title: "FixIt Services", type: "On-Demand Platform", img: "https://images.unsplash.com/photo-1581092911461-7d15cb38a71c?auto=format&fit=crop&w=600&q=80", desc: "Electrical and maintenance booking system." },
            { title: "MyAliShop", type: "Marketplace", img: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80", desc: "High-volume multi-vendor ecommerce store." },
            { title: "Noor News Agency", type: "Media Portal", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80", desc: "Real-time news distribution and CMS." },
            { title: "Chinar Hospital ERP", type: "Healthcare", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80", desc: "Complete clinical and patient management." },
            { title: "SMProfit FinTech", type: "Trading App", img: "https://images.unsplash.com/photo-1611974714851-eb607737421c?auto=format&fit=crop&w=600&q=80", desc: "Forex signals and auto-trading dashboard." },
            { title: "Trips & Tour Hub", type: "Travel Tech", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80", desc: "Reservation platform for tour operators." }
        ];

        function showPage(pageId) {
            $('.page-section').hide().removeClass('active');
            $('#' + pageId).fadeIn(600).addClass('active');
            $('.nav-link').removeClass('active');
            $(`[onclick="showPage('${pageId}')"]`).addClass('active');
            window.scrollTo(0,0);
            $('#mobile-menu').fadeOut();
        }

        $(document).ready(function() {
            // Render Homepage Services Showcase (At least 4)
            services.slice(0, 4).forEach(s => {
                $('#home-services-grid').append(`
                    <div class="p-10 rounded-[40px] border border-slate-100 bg-white hover:border-primary transition-all group text-left">
                        <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                            <i class="fa ${s.icon} text-xl"></i>
                        </div>
                        <h4 class="text-xl font-black mb-4 uppercase tracking-tighter">${s.title}</h4>
                        <p class="text-slate-500 text-xs leading-relaxed">${s.desc}</p>
                    </div>
                `);
            });

            // Render All Services for Full Page
            services.forEach(s => {
                $('#full-services-grid').append(`
                    <div class="p-10 rounded-[50px] border border-slate-100 bg-white hover:border-primary transition-all group">
                        <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                            <i class="fa ${s.icon} text-2xl"></i>
                        </div>
                        <h4 class="text-2xl font-black mb-4 uppercase tracking-tighter">${s.title}</h4>
                        <p class="text-slate-500 text-sm leading-relaxed mb-8">${s.desc}</p>
                        <button onclick="showPage('contact')" class="font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-primary">
                            Inquire Now <i class="fa fa-chevron-right text-[10px]"></i>
                        </button>
                    </div>
                `);
            });

            // Render Portfolio Projects
            projects.forEach(p => {
                $('#projects-grid').append(`
                    <div class="group cursor-pointer">
                        <div class="relative overflow-hidden rounded-[50px] shadow-lg mb-8 border border-slate-100">
                            <img src="${p.img}" alt="${p.title}" class="w-full h-80 object-cover group-hover:scale-110 transition-all duration-1000">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-12">
                                <div>
                                    <p class="text-primary font-bold uppercase text-[10px] tracking-widest mb-2">${p.type}</p>
                                    <h4 class="text-white font-black text-3xl italic">Case Study</h4>
                                </div>
                            </div>
                        </div>
                        <div class="px-8">
                            <h4 class="text-2xl font-black text-slate-900 mb-2 underline decoration-primary decoration-4">${p.title}</h4>
                            <p class="text-slate-500 text-sm leading-relaxed">${p.desc}</p>
                        </div>
                    </div>
                `);
            });

            // Mobile Navigation Toggle
            $('#mobile-menu-btn').click(() => $('#mobile-menu').fadeIn().css('display', 'flex'));
            $('#close-menu').click(() => $('#mobile-menu').fadeOut());
        });
    </script>
</body>
</html>