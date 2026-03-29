// ─── Login & Register Page ──────────────────────────────────────────────────
// Consumes: POST /api/Auth/login, POST /api/Auth/register

const AuthPage = (() => {
    function render() {
        return `
        <div class="bg-mesh font-body min-h-screen flex items-center justify-center p-4 md:p-8 relative" style="color:#EAEAF7">
            <div class="nr-auth-atmosphere"></div>
            <main class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden shadow-2xl rounded-xl relative z-10" style="border:1px solid rgba(139,92,255,0.1)">
                <!-- Back Navigation -->
                <a href="#/" class="nr-back-btn absolute top-6 left-6 z-50" aria-label="Back to Home">
                    <span class="material-symbols-outlined text-[18px]">arrow_back</span> Back
                </a>
                
                <!-- Left: Brand Panel -->
                <section class="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden" style="background:linear-gradient(135deg,#0B1020,#1a0840);border-right:1px solid rgba(139,92,255,0.06)">
                    <div class="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[120px]" style="background:rgba(91,46,255,0.12)"></div>
                    <div class="absolute bottom-[-5%] left-[-5%] w-64 h-64 rounded-full blur-[100px]" style="background:rgba(43,18,76,0.3)"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-12">
                            <img src="assets/sword_logo.png" alt="Noctis Reserve Logo" class="nr-brand-logo-lg" style="mix-blend-mode: screen;">
                            <span class="font-headline font-bold text-2xl tracking-tight" style="color:#EAEAF7">Noctis Reserve</span>
                        </div>
                        <h1 class="font-headline text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Design the space <br>where <span class="text-gradient">time</span> aligns.
                        </h1>
                        <p class="text-lg max-w-md leading-relaxed" style="color:#A9A9C8">
                            The premier scheduling engine for professionals who demand absolute precision and architectural elegance.
                        </p>
                    </div>
                    <div class="relative z-10 grid grid-cols-2 gap-6 mt-12">
                        <div class="p-6 rounded-lg" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.1)">
                            <span class="material-symbols-outlined mb-3" style="color:#8B5CFF">bolt</span>
                            <p class="text-sm font-semibold mb-1" style="color:#EAEAF7">Lightning Fast</p>
                            <p class="text-xs" style="color:#A9A9C8">Book appointments in under 30 seconds.</p>
                        </div>
                        <div class="p-6 rounded-lg" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.1)">
                            <span class="material-symbols-outlined mb-3" style="color:#8B5CFF">security</span>
                            <p class="text-sm font-semibold mb-1" style="color:#EAEAF7">Secure Core</p>
                            <p class="text-xs" style="color:#A9A9C8">Enterprise-grade JWT authentication.</p>
                        </div>
                    </div>
                </section>

                <!-- Right: Auth Form -->
                <section class="p-8 md:p-16 flex flex-col justify-center" style="background:linear-gradient(180deg, #0B1020 0%, #0d0e28 100%)">
                    <div class="max-w-md mx-auto w-full">
                        <div class="lg:hidden flex items-center gap-3 mb-10 justify-center">
                            <img src="assets/sword_logo.png" alt="Noctis Reserve Logo" class="nr-brand-logo" style="mix-blend-mode: screen;">
                            <span class="font-headline font-extrabold text-xl tracking-tight" style="color:#EAEAF7">Noctis Reserve</span>
                        </div>

                        <!-- Tab Switcher -->
                        <div class="flex p-1.5 rounded-2xl mb-10" style="background:rgba(3,5,16,0.9);border:1px solid rgba(139,92,255,0.06)">
                            <button id="tab-login" class="flex-1 py-3 text-[15px] font-bold rounded-xl transition-all" style="background:rgba(91,46,255,0.15);color:#EAEAF7" onclick="AuthPage._switchTab('login')">Sign In</button>
                            <button id="tab-register" class="flex-1 py-3 text-[15px] font-bold rounded-xl transition-all" style="color:#A9A9C8" onclick="AuthPage._switchTab('register')">Create Account</button>
                        </div>

                        <!-- Login Form -->
                        <div id="form-login">
                            <div class="mb-10">
                                <h2 class="font-headline text-3xl font-extrabold mb-2 tracking-tight" style="color:#EAEAF7">Welcome Back</h2>
                                <p class="text-[15px]" style="color:#A9A9C8">Enter your credentials to access your workspace.</p>
                            </div>
                            <form id="login-form" class="space-y-7" onsubmit="return false">
                                <div class="nr-field-group">
                                    <label class="nr-field-label" for="login-email">Email Address</label>
                                    <input class="nr-input" id="login-email" placeholder="name@company.com" type="email" required autocomplete="email">
                                    <div id="login-email-error" class="nr-field-error hidden"></div>
                                </div>
                                <div class="nr-field-group">
                                    <label class="nr-field-label" for="login-password">Password</label>
                                    <div class="relative">
                                        <input class="nr-input pr-14" id="login-password" placeholder="••••••••" type="password" required autocomplete="current-password">
                                        <button type="button" onclick="AuthPage._togglePassword('login-password')" class="nr-password-toggle">
                                            <span class="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                    </div>
                                    <div id="login-password-error" class="nr-field-error hidden"></div>
                                </div>
                                <div id="login-error" class="hidden rounded-xl p-4 text-sm" style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.12);color:#f87171"></div>
                                <button id="login-submit" type="submit" class="cta-glow w-full font-bold py-4 rounded-2xl btn-press flex items-center justify-center gap-2 text-base mt-2">
                                    <span id="login-btn-text">Sign In to Workspace</span>
                                    <span id="login-btn-spinner" class="hidden w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                </button>
                            </form>
                        </div>

                        <!-- Register Form -->
                        <div id="form-register" class="hidden">
                            <div class="mb-10">
                                <h2 class="font-headline text-3xl font-extrabold mb-2 tracking-tight" style="color:#EAEAF7">Create Account</h2>
                                <p class="text-[15px]" style="color:#A9A9C8">Join the precision scheduling platform.</p>
                            </div>
                            <form id="register-form" class="space-y-6" onsubmit="return false">
                                <div class="nr-field-group">
                                    <label class="nr-field-label" for="reg-name">Full Name</label>
                                    <input class="nr-input" id="reg-name" placeholder="Alexander Vance" type="text" required>
                                    <div id="reg-name-error" class="nr-field-error hidden"></div>
                                </div>
                                <div class="nr-field-group">
                                    <label class="nr-field-label" for="reg-email">Email Address</label>
                                    <input class="nr-input" id="reg-email" placeholder="name@company.com" type="email" required autocomplete="email">
                                    <div id="reg-email-error" class="nr-field-error hidden"></div>
                                </div>
                                <div class="nr-field-group">
                                    <label class="nr-field-label" for="reg-password">Password</label>
                                    <div class="relative">
                                        <input class="nr-input pr-14" id="reg-password" placeholder="Min 6 characters" type="password" required minlength="6" autocomplete="new-password">
                                        <button type="button" onclick="AuthPage._togglePassword('reg-password')" class="nr-password-toggle">
                                            <span class="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                    </div>
                                    <div id="reg-password-error" class="nr-field-error hidden"></div>
                                </div>
                                <div id="register-error" class="hidden rounded-xl p-4 text-sm" style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.12);color:#f87171"></div>
                                <button id="register-submit" type="submit" class="cta-glow w-full font-bold py-4 rounded-2xl btn-press flex items-center justify-center gap-2 text-base mt-2">
                                    <span id="register-btn-text">Create Account</span>
                                    <span id="register-btn-spinner" class="hidden w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div>`;
    }

    function init() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            let valid = true;
            if (!email || !/\S+@\S+\.\S+/.test(email)) { _showFieldError('login-email', 'Please enter a valid email address'); valid = false; } else { _clearFieldError('login-email'); }
            if (!password) { _showFieldError('login-password', 'Password is required'); valid = false; } else { _clearFieldError('login-password'); }
            if (!valid) return;
            _setLoading('login', true);
            _hideError('login-error');
            try {
                const user = await Auth.login(email, password);
                UI.toast(`Welcome back, ${user.fullName}!`, 'success');
                Router.navigate(Auth.getHomePath());
            } catch (err) {
                _showError('login-error', err.message || 'Invalid credentials');
            } finally {
                _setLoading('login', false);
            }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            let valid = true;
            if (!fullName || fullName.length < 2) { _showFieldError('reg-name', 'Please enter your full name'); valid = false; } else { _clearFieldError('reg-name'); }
            if (!email || !/\S+@\S+\.\S+/.test(email)) { _showFieldError('reg-email', 'Please enter a valid email'); valid = false; } else { _clearFieldError('reg-email'); }
            if (!password || password.length < 6) { _showFieldError('reg-password', 'Password must be at least 6 characters'); valid = false; } else { _clearFieldError('reg-password'); }
            if (!valid) return;
            _setLoading('register', true);
            _hideError('register-error');
            try {
                const user = await Auth.register(email, password, fullName);
                UI.toast(`Welcome, ${user.fullName}! Account created.`, 'success');
                Router.navigate(Auth.getHomePath());
            } catch (err) {
                _showError('register-error', err.message || 'Registration failed');
            } finally {
                _setLoading('register', false);
            }
        });
    }

    function _switchTab(tab) {
        const loginTab = document.getElementById('tab-login');
        const regTab = document.getElementById('tab-register');
        const loginForm = document.getElementById('form-login');
        const regForm = document.getElementById('form-register');
        if (tab === 'login') {
            loginTab.style.background = 'rgba(91,46,255,0.15)'; loginTab.style.color = '#EAEAF7';
            regTab.style.background = 'transparent'; regTab.style.color = '#A9A9C8';
            loginForm.classList.remove('hidden'); regForm.classList.add('hidden');
        } else {
            regTab.style.background = 'rgba(91,46,255,0.15)'; regTab.style.color = '#EAEAF7';
            loginTab.style.background = 'transparent'; loginTab.style.color = '#A9A9C8';
            regForm.classList.remove('hidden'); loginForm.classList.add('hidden');
        }
    }

    function _togglePassword(id) {
        const el = document.getElementById(id);
        el.type = el.type === 'password' ? 'text' : 'password';
    }

    function _setLoading(prefix, loading) {
        const btn = document.getElementById(`${prefix}-submit`);
        const text = document.getElementById(`${prefix}-btn-text`);
        const spinner = document.getElementById(`${prefix}-btn-spinner`);
        btn.disabled = loading;
        text.style.opacity = loading ? '0.5' : '1';
        spinner.classList.toggle('hidden', !loading);
    }

    function _showError(id, msg) { const el = document.getElementById(id); el.textContent = msg; el.classList.remove('hidden'); }
    function _hideError(id) { document.getElementById(id).classList.add('hidden'); }
    function _showFieldError(fieldId, msg) {
        document.getElementById(fieldId).classList.add('field-error');
        const errEl = document.getElementById(fieldId + '-error');
        if (errEl) { errEl.textContent = msg; errEl.classList.remove('hidden'); }
    }
    function _clearFieldError(fieldId) {
        document.getElementById(fieldId).classList.remove('field-error');
        const errEl = document.getElementById(fieldId + '-error');
        if (errEl) { errEl.classList.add('hidden'); }
    }

    return { render, init, _switchTab, _togglePassword };
})();
