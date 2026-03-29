// ─── Obsidian Architect — SPA Router ────────────────────────────────────────
// Hash-based routing with auth guards and role protection.

const Router = (() => {
    const routes = [];
    let _mountEl = null;
    let _currentCleanup = null;

    // ─── Route Registration ───────────────────────────────────────────

    function register(path, { render, init, guard }) {
        routes.push({ path, render, init, guard });
    }

    // ─── Navigation ───────────────────────────────────────────────────

    function navigate(path) {
        window.location.hash = '#' + path;
    }

    function getCurrentPath() {
        return window.location.hash.slice(1) || '/';
    }

    // ─── Route Matching ───────────────────────────────────────────────

    function _matchRoute(path) {
        for (const route of routes) {
            const params = _extractParams(route.path, path);
            if (params !== null) {
                return { ...route, params };
            }
        }
        return null;
    }

    function _extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }

    // ─── Route Resolution ─────────────────────────────────────────────

    async function _resolve() {
        const path = getCurrentPath();
        const match = _matchRoute(path);

        if (!match) {
            _mountEl.innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <h1 class="text-6xl font-headline font-black text-on-surface mb-4">404</h1>
                        <p class="text-on-surface-variant mb-8">Page not found</p>
                        <a href="#/" class="px-8 py-3 bg-gradient-to-br from-primary to-secondary text-on-primary font-bold rounded-lg">Go Home</a>
                    </div>
                </div>`;
            return;
        }

        // Run guard
        if (match.guard) {
            const allowed = match.guard();
            if (!allowed) return; // Guard handles redirect
        }

        // Cleanup previous page
        if (_currentCleanup && typeof _currentCleanup === 'function') {
            _currentCleanup();
        }

        // Render page
        _mountEl.innerHTML = match.render(match.params);

        // Initialize page logic
        if (match.init) {
            _currentCleanup = await match.init(match.params);
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // ─── Guards ───────────────────────────────────────────────────────

    function requireAuth() {
        if (!Auth.isAuthenticated()) {
            navigate('/login');
            return false;
        }
        return true;
    }

    function requireAdmin() {
        if (!Auth.isAuthenticated()) {
            navigate('/login');
            return false;
        }
        if (!Auth.isAdmin()) {
            navigate('/dashboard');
            return false;
        }
        return true;
    }

    function requireGuest() {
        if (Auth.isAuthenticated()) {
            navigate(Auth.getHomePath());
            return false;
        }
        return true;
    }

    // ─── Initialization ───────────────────────────────────────────────

    function start(mountSelector) {
        _mountEl = document.querySelector(mountSelector);
        window.addEventListener('hashchange', _resolve);

        // If no hash, set default
        if (!window.location.hash) {
            window.location.hash = '#/';
        }

        _resolve();
    }

    return { register, navigate, getCurrentPath, start, requireAuth, requireAdmin, requireGuest };
})();
