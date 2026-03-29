// ─── Landing Page — Noctis Reserve ────────────────────────────────────────
// Premium dark, violet-glow, cinematic landing with scroll-reveal animations.
// No API calls. Pure presentation + CTAs linking to real routes.

const LandingPage = (() => {
    let _observer = null;

    function render() {
        return `
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!--  NAVIGATION (Landing-specific transparent header)                  -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <header class="fixed top-0 w-full z-50" style="background:rgba(5,8,22,0.55);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border-bottom:1px solid rgba(139,92,255,0.06)">
            <div class="flex justify-between items-center h-[72px] px-6 md:px-10 w-full max-w-7xl mx-auto">
                <div class="flex items-center gap-3.5">
                    <img src="assets/sword_logo.png" alt="Noctis Reserve Logo" class="nr-brand-logo" style="mix-blend-mode: screen;">
                    <span class="font-headline font-extrabold text-xl tracking-tight" style="color:#EAEAF7">Noctis Reserve</span>
                </div>
                <nav class="hidden md:flex items-center gap-8">
                    <a href="#features" class="text-[15px] font-semibold font-headline transition-colors" style="color:#A9A9C8" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='#A9A9C8'">Features</a>
                    <a href="#how-it-works" class="text-[15px] font-semibold font-headline transition-colors" style="color:#A9A9C8" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='#A9A9C8'">How It Works</a>
                    <a href="https://github.com/EmanuelBaez7" target="_blank" rel="noopener" class="text-[15px] font-semibold font-headline transition-colors flex items-center gap-2" style="color:#A9A9C8" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='#A9A9C8'">
                        <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/emanuel-b%C3%A1ez-a06984351/" target="_blank" rel="noopener" class="text-[15px] font-semibold font-headline transition-colors flex items-center gap-2" style="color:#A9A9C8" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='#A9A9C8'">
                        <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>
                </nav>
                <div class="flex items-center gap-4">
                    ${Auth.isAuthenticated() ? `
                        <a href="#${Auth.getHomePath()}" class="px-6 py-2.5 rounded-xl text-[15px] font-semibold transition-all" style="background:rgba(139,92,255,0.12);color:#8B5CFF;border:1px solid rgba(139,92,255,0.2)" onmouseover="this.style.background='rgba(139,92,255,0.2)'" onmouseout="this.style.background='rgba(139,92,255,0.12)'">Dashboard</a>
                    ` : `
                        <a href="#/login" class="hidden md:block px-5 py-2.5 text-[15px] font-semibold font-headline transition-colors" style="color:#A9A9C8" onmouseover="this.style.color='#EAEAF7'" onmouseout="this.style.color='#A9A9C8'">Sign In</a>
                        <a href="#/booking" class="cta-glow px-6 py-2.5 rounded-xl text-[15px] font-bold">Get Started</a>
                    `}
                </div>
            </div>
        </header>

        <main style="background:#050816;color:#EAEAF7">
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!--  HERO SECTION                                                  -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                <!-- Animated Background Orbs -->
                <div class="orb orb-1"></div>
                <div class="orb orb-2"></div>
                <div class="orb orb-3"></div>
                <!-- Dot Grid Overlay -->
                <div class="absolute inset-0 dot-grid opacity-40 pointer-events-none"></div>
                <!-- Radial Vignette -->
                <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 70% 50% at 50% 40%,transparent 40%,#050816 100%)"></div>

                <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <!-- Badge -->
                    <div class="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10" style="background:rgba(91,46,255,0.08);border:1px solid rgba(139,92,255,0.15);animation:fadeInUp 0.8s ease-out both">
                        <span class="relative flex h-2 w-2"><span class="absolute inset-0 rounded-full animate-ping" style="background:#8B5CFF;opacity:0.6"></span><span class="relative block h-2 w-2 rounded-full" style="background:#8B5CFF"></span></span>
                        <span class="text-xs font-semibold uppercase tracking-[0.2em]" style="color:#A9A9C8">Precision Scheduling Engine</span>
                    </div>

                    <!-- Headline -->
                    <h1 class="font-headline font-extrabold tracking-tight leading-[1.05] mb-8" style="font-size:clamp(2.5rem,6vw,5rem);animation:fadeInUp 0.9s 0.15s ease-out both">
                        Where time meets<br>
                        <span class="text-gradient">architectural precision.</span>
                    </h1>

                    <!-- Subheadline -->
                    <p class="text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed" style="color:#A9A9C8;animation:fadeInUp 1s 0.3s ease-out both">
                        A premium scheduling platform for professionals who demand elegance, clarity, and absolute control over every appointment.
                    </p>

                    <!-- CTA Row -->
                    <div class="flex flex-col sm:flex-row gap-5 justify-center items-center" style="animation:fadeInUp 1.1s 0.45s ease-out both">
                        <a href="#/booking" class="cta-glow px-10 py-4 rounded-xl font-bold text-base flex items-center gap-3">
                            Book an Appointment
                            <span class="material-symbols-outlined text-lg">arrow_forward</span>
                        </a>
                        <a href="#/login" class="px-10 py-4 rounded-xl font-semibold text-base flex items-center gap-3 transition-all" style="background:rgba(255,255,255,0.04);border:1px solid rgba(139,92,255,0.15);color:#A9A9C8" onmouseover="this.style.borderColor='rgba(139,92,255,0.35)';this.style.color='#EAEAF7'" onmouseout="this.style.borderColor='rgba(139,92,255,0.15)';this.style.color='#A9A9C8'">
                            Sign In
                            <span class="material-symbols-outlined text-lg">login</span>
                        </a>
                    </div>

                    <!-- Metrics Row -->
                    <div class="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20" style="animation:fadeInUp 1.2s 0.6s ease-out both">
                        <div class="text-center">
                            <p class="text-3xl md:text-4xl font-headline font-extrabold text-gradient">30s</p>
                            <p class="text-xs mt-1 uppercase tracking-widest" style="color:#6B6B8D">Avg Booking</p>
                        </div>
                        <div class="text-center" style="border-left:1px solid rgba(139,92,255,0.15);border-right:1px solid rgba(139,92,255,0.15)">
                            <p class="text-3xl md:text-4xl font-headline font-extrabold text-gradient">99.9%</p>
                            <p class="text-xs mt-1 uppercase tracking-widest" style="color:#6B6B8D">Uptime</p>
                        </div>
                        <div class="text-center">
                            <p class="text-3xl md:text-4xl font-headline font-extrabold text-gradient">256b</p>
                            <p class="text-xs mt-1 uppercase tracking-widest" style="color:#6B6B8D">Encryption</p>
                        </div>
                    </div>
                </div>

                <!-- Scroll Indicator -->
                <div class="absolute bottom-8 left-1/2 -translate-x-1/2" style="animation:float 3s ease-in-out infinite">
                    <div class="w-6 h-10 rounded-full flex items-start justify-center pt-2" style="border:1.5px solid rgba(139,92,255,0.25)">
                        <div class="w-1.5 h-3 rounded-full" style="background:#8B5CFF;animation:glowPulse 2s ease-in-out infinite"></div>
                    </div>
                </div>
            </section>

            <!-- Section Divider -->
            <div class="section-divider"></div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!--  FEATURES SECTION                                              -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <section id="features" class="py-32 md:py-40 relative overflow-hidden">
                <div class="max-w-7xl mx-auto px-6">
                    <!-- Section Header -->
                    <div class="text-center mb-20 reveal">
                        <p class="text-xs font-bold uppercase tracking-[0.3em] mb-4" style="color:#8B5CFF">Why Noctis Reserve</p>
                        <h2 class="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Engineered for precision.</h2>
                        <p class="text-lg max-w-xl mx-auto" style="color:#A9A9C8">Every feature designed with architectural intent — no clutter, no compromise.</p>
                    </div>

                    <!-- Feature Cards Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${[
                            { icon: 'bolt', title: 'Lightning Booking', desc: 'Date, shift, slot — confirmed in under 30 seconds. No friction, no waiting.', delay: '100' },
                            { icon: 'security', title: 'JWT Authentication', desc: 'Enterprise-grade token-based security. Role-based access for users and administrators.', delay: '200' },
                            { icon: 'dashboard_customize', title: 'Admin Control', desc: 'Full schedule management: configure days, shifts, capacity, and slot generation.', delay: '300' },
                            { icon: 'analytics', title: 'Real-Time Analytics', desc: 'Live dashboard with booking trends, occupancy rates, and operational insights.', delay: '400' },
                            { icon: 'event_available', title: 'Smart Scheduling', desc: 'Dynamic slot generation with buffer times, capacity limits, and shift orchestration.', delay: '500' },
                            { icon: 'shield', title: 'Audit Trail', desc: 'Complete reservation logs with action tracking, search, and filterable history.', delay: '600' }
                        ].map(f => `
                        <div class="glow-card rounded-2xl p-8 reveal-scale delay-${f.delay}">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style="background:linear-gradient(135deg,rgba(91,46,255,0.2),rgba(139,92,255,0.08))">
                                <span class="material-symbols-outlined text-xl" style="color:#8B5CFF">${f.icon}</span>
                            </div>
                            <h3 class="font-headline text-lg font-bold mb-3">${f.title}</h3>
                            <p class="text-sm leading-relaxed" style="color:#A9A9C8">${f.desc}</p>
                        </div>`).join('')}
                    </div>
                </div>
            </section>

            <!-- Section Divider -->
            <div class="section-divider"></div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!--  HOW IT WORKS                                                  -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <section id="how-it-works" class="py-32 md:py-40 relative" style="background:linear-gradient(180deg,#050816 0%,#0B1020 50%,#050816 100%)">
                <div class="max-w-5xl mx-auto px-6">
                    <div class="text-center mb-20 reveal">
                        <p class="text-xs font-bold uppercase tracking-[0.3em] mb-4" style="color:#8B5CFF">The Flow</p>
                        <h2 class="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Three steps. Zero friction.</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        ${[
                            { num: '01', icon: 'calendar_month', title: 'Select a Date', desc: 'Browse the interactive calendar with real-time availability indicators.', dir: 'reveal-left', delay: '100' },
                            { num: '02', icon: 'schedule', title: 'Choose Your Shift', desc: 'Morning, afternoon, or evening — pick the time block that fits your rhythm.', dir: 'reveal', delay: '300' },
                            { num: '03', icon: 'verified', title: 'Confirm Instantly', desc: 'Review your selection and lock in your appointment with a single tap.', dir: 'reveal-right', delay: '500' }
                        ].map(s => `
                        <div class="${s.dir} delay-${s.delay}">
                            <div class="relative">
                                <div class="glow-card rounded-2xl p-8 text-center">
                                    <!-- Step Number -->
                                    <div class="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative" style="background:linear-gradient(135deg,rgba(91,46,255,0.15),rgba(43,18,76,0.3));border:1px solid rgba(139,92,255,0.15)">
                                        <span class="font-headline text-2xl font-black text-gradient">${s.num}</span>
                                        <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style="background:#0B1020;border:1px solid rgba(139,92,255,0.2)">
                                            <span class="material-symbols-outlined text-sm" style="color:#8B5CFF">${s.icon}</span>
                                        </div>
                                    </div>
                                    <h3 class="font-headline text-xl font-bold mb-3">${s.title}</h3>
                                    <p class="text-sm leading-relaxed" style="color:#A9A9C8">${s.desc}</p>
                                </div>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
            </section>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!--  ARCHITECTURE SECTION                                          -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <section class="py-32 md:py-40 relative overflow-hidden">
                <!-- Ambient glow -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(91,46,255,0.06),transparent 70%)"></div>

                <div class="max-w-6xl mx-auto px-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <!-- Left: Text -->
                        <div class="reveal-left">
                            <p class="text-xs font-bold uppercase tracking-[0.3em] mb-4" style="color:#8B5CFF">Built Right</p>
                            <h2 class="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Full-stack precision engineering.</h2>
                            <div class="space-y-6">
                                ${[
                                    { label: 'ASP.NET Core 10', desc: 'Onion Architecture backend with clean separation of concerns' },
                                    { label: 'PostgreSQL + EF Core', desc: 'Production-grade data layer with Supabase hosting' },
                                    { label: 'JWT Authentication', desc: 'Stateless token auth with role-based route protection' },
                                    { label: 'Vanilla JS SPA', desc: 'Zero-dependency frontend with hash-based routing' }
                                ].map(item => `
                                <div class="flex items-start gap-4">
                                    <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background:#5B2EFF;box-shadow:0 0 8px rgba(91,46,255,0.5)"></div>
                                    <div>
                                        <p class="font-bold text-sm mb-0.5">${item.label}</p>
                                        <p class="text-sm" style="color:#A9A9C8">${item.desc}</p>
                                    </div>
                                </div>`).join('')}
                            </div>
                        </div>
                        <!-- Right: Visual Card -->
                        <div class="reveal-right delay-200">
                            <div class="glow-card rounded-2xl p-8 relative overflow-hidden">
                                <div class="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(91,46,255,0.15),transparent 70%);filter:blur(40px)"></div>
                                <div class="relative z-10 space-y-5">
                                    <div class="flex items-center gap-3 mb-6">
                                        <div class="w-3 h-3 rounded-full" style="background:#f87171"></div>
                                        <div class="w-3 h-3 rounded-full" style="background:#fbbf24"></div>
                                        <div class="w-3 h-3 rounded-full" style="background:#34d399"></div>
                                        <span class="text-xs ml-2" style="color:#6B6B8D">api-routes.ts</span>
                                    </div>
                                    <div class="font-mono text-xs leading-relaxed space-y-1" style="color:#A9A9C8">
                                        <p><span style="color:#8B5CFF">GET </span><span style="color:#EAEAF7">/api/Booking/dates</span></p>
                                        <p><span style="color:#8B5CFF">GET </span><span style="color:#EAEAF7">/api/Booking/dates/{date}/shifts</span></p>
                                        <p><span style="color:#8B5CFF">GET </span><span style="color:#EAEAF7">/api/Booking/slots</span></p>
                                        <p><span style="color:#5B2EFF">POST</span> <span style="color:#EAEAF7">/api/Booking/appointments</span></p>
                                        <p><span style="color:#5B2EFF">POST</span> <span style="color:#EAEAF7">/api/Auth/login</span></p>
                                        <p><span style="color:#5B2EFF">POST</span> <span style="color:#EAEAF7">/api/Auth/register</span></p>
                                        <p><span style="color:#34d399">GET </span><span style="color:#EAEAF7">/api/admin/dashboard/overview</span></p>
                                        <p><span style="color:#fbbf24">PATCH</span> <span style="color:#EAEAF7">/api/admin/schedule/settings</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Section Divider -->
            <div class="section-divider"></div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!--  FINAL CTA                                                     -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <section class="py-40 md:py-48 relative overflow-hidden">
                <!-- Background ambient -->
                <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(91,46,255,0.08),transparent 70%)"></div>

                <div class="relative z-10 max-w-3xl mx-auto px-6 text-center reveal">
                    <h2 class="font-headline text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                        Ready to experience<br><span class="text-gradient">precision scheduling?</span>
                    </h2>
                    <p class="text-lg mb-14" style="color:#A9A9C8">Join the platform where every second is designed.</p>
                    <div class="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <a href="#/booking" class="cta-glow px-12 py-5 rounded-xl font-bold text-lg flex items-center gap-3">
                            Start Booking
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
                        <a href="#/login" class="px-12 py-5 rounded-xl font-semibold text-lg transition-all" style="background:rgba(255,255,255,0.04);border:1px solid rgba(139,92,255,0.15);color:#A9A9C8" onmouseover="this.style.borderColor='rgba(139,92,255,0.35)';this.style.color='#EAEAF7'" onmouseout="this.style.borderColor='rgba(139,92,255,0.15)';this.style.color='#A9A9C8'">
                            Sign In
                        </a>
                    </div>
                </div>
            </section>
        </main>

        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!--  FOOTER                                                            -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <footer class="relative py-16 px-6" style="background:#050816;border-top:1px solid rgba(139,92,255,0.06)">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <!-- Brand -->
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <img src="assets/sword_logo.png" alt="Noctis Reserve Logo" class="nr-brand-logo" style="width: 2rem; height: 2rem; mix-blend-mode: screen;">
                            <span class="font-headline font-bold tracking-tight" style="color:#EAEAF7">Noctis Reserve</span>
                        </div>
                        <p class="text-sm leading-relaxed" style="color:#6B6B8D">Premium appointment scheduling platform. Built with architectural precision.</p>
                    </div>
                    <!-- Links -->
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] mb-4" style="color:#A9A9C8">Navigation</p>
                        <div class="space-y-2">
                            <a href="#/booking" class="block text-sm creator-link">Book Appointment</a>
                            <a href="#/login" class="block text-sm creator-link">Sign In</a>
                            <a href="#features" class="block text-sm creator-link">Features</a>
                        </div>
                    </div>
                    <!-- Creator -->
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] mb-4" style="color:#A9A9C8">Creator</p>
                        <p class="text-sm mb-3" style="color:#EAEAF7">Created by <span class="font-semibold">Emanuel Baez</span></p>
                        <div class="flex items-center gap-4">
                            <a href="https://github.com/EmanuelBaez7" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm creator-link group">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/emanuel-b%C3%A1ez-a06984351/" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm creator-link group">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
                <!-- Bottom -->
                <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style="border-top:1px solid rgba(139,92,255,0.06)">
                    <p class="text-xs" style="color:#6B6B8D">© ${new Date().getFullYear()} Noctis Reserve. All rights reserved.</p>
                    <p class="text-xs" style="color:#6B6B8D">Designed & developed by <a href="https://www.linkedin.com/in/emanuel-b%C3%A1ez-a06984351/" target="_blank" rel="noopener" class="creator-link font-medium">Emanuel Baez</a></p>
                </div>
            </div>
        </footer>`;
    }

    function init() {
        // ─── Intersection Observer for scroll-reveal animations ──────
        _observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve — allows re-reveal if user scrolls back up... actually unobserve for perf
                    _observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        // Observe all reveal elements
        document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(el => {
            _observer.observe(el);
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#features"], a[href^="#how-it-works"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href').slice(1);
                const target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Cleanup function
        return () => {
            if (_observer) { _observer.disconnect(); _observer = null; }
        };
    }

    return { render, init };
})();
