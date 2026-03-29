// ─── Obsidian Architect — Auth State Manager ────────────────────────────────
// Manages JWT token, user profile, role checks, and session lifecycle.
// Listens for auth:expired events from api.js.

const Auth = (() => {
    const TOKEN_KEY = 'obsidian_token';
    const USER_KEY = 'obsidian_user';
    let _user = null;
    let _listeners = [];

    // ─── Initialize from localStorage ─────────────────────────────────
    function init() {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
            try { _user = JSON.parse(stored); } catch { _user = null; }
        }
        // Listen for token expiration from api.js
        window.addEventListener('auth:expired', () => {
            _user = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            _notify();
            Router.navigate('/login');
        });
    }

    // ─── State Getters ────────────────────────────────────────────────

    function isAuthenticated() {
        return !!localStorage.getItem(TOKEN_KEY);
    }

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        return _user;
    }

    function isAdmin() {
        return _user?.role === 'Admin';
    }

    function isUser() {
        return _user?.role === 'User';
    }

    // ─── Auth Actions ─────────────────────────────────────────────────

    async function login(email, password) {
        const response = await API.Auth.login(email, password);
        _setSession(response.token, response.user);
        return response.user;
    }

    async function register(email, password, fullName) {
        const response = await API.Auth.register(email, password, fullName);
        _setSession(response.token, response.user);
        return response.user;
    }

    function logout() {
        _user = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        _notify();
        Router.navigate('/login');
    }

    /** Hydrate user from /api/Auth/me — call on app startup if token exists */
    async function hydrate() {
        if (!isAuthenticated()) return null;
        try {
            const user = await API.Auth.me();
            _user = user;
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            _notify();
            return user;
        } catch (err) {
            // Token invalid
            _user = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            _notify();
            return null;
        }
    }

    // ─── Internal Helpers ─────────────────────────────────────────────

    function _setSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        _user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        _notify();
    }

    function _notify() {
        _listeners.forEach(fn => fn(_user));
    }

    /** Subscribe to auth state changes */
    function onChange(fn) {
        _listeners.push(fn);
        return () => { _listeners = _listeners.filter(l => l !== fn); };
    }

    /** Get redirect path based on user role */
    function getHomePath() {
        if (!_user) return '/';
        return _user.role === 'Admin' ? '/admin' : '/dashboard';
    }

    /** Get time-of-day greeting */
    function getGreeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    }

    return { init, isAuthenticated, getToken, getUser, isAdmin, isUser, login, register, logout, hydrate, onChange, getHomePath, getGreeting };
})();
