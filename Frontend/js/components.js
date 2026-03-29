// ─── Noctis Reserve — Shared UI Components ─────────────────────────────────

const UI = (() => {
    // ─── Toast Notification ───────────────────────────────────────────
    let _toastTimer = null;
    function toast(message, type = 'info') {
        let el = document.getElementById('global-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'global-toast';
            el.className = 'toast toast-hidden';
            document.body.appendChild(el);
        }
        const icons = { info: 'info', success: 'check_circle', error: 'error', warning: 'warning' };
        const colors = { info: '#8B5CFF', success: '#34d399', error: '#f87171', warning: '#fbbf24' };
        el.innerHTML = `
            <div class="flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl" style="background:rgba(11,16,32,0.9);backdrop-filter:blur(24px);border:1px solid rgba(139,92,255,0.15)">
                <span class="material-symbols-outlined" style="color:${colors[type]}">${icons[type]}</span>
                <span class="text-sm font-medium" style="color:#EAEAF7">${message}</span>
            </div>`;
        el.className = 'toast toast-visible';
        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => { el.className = 'toast toast-hidden'; }, 4000);
    }

    // ─── Confirmation Modal ───────────────────────────────────────────
    function confirm(title, message, confirmText = 'Confirm', confirmClass = '') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
                    <h3 class="font-headline text-xl font-bold mb-2" style="color:#EAEAF7">${title}</h3>
                    <p class="text-sm mb-8" style="color:#A9A9C8">${message}</p>
                    <div class="flex gap-3 justify-end">
                        <button id="modal-cancel" class="nr-btn nr-btn-surface px-6 py-2.5 text-sm">Cancel</button>
                        <button id="modal-confirm" class="${confirmClass || 'nr-btn nr-btn-primary'} px-6 py-2.5 text-sm font-bold rounded-xl">${confirmText}</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('active'));

            const close = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };
            overlay.querySelector('#modal-cancel').onclick = () => close(false);
            overlay.querySelector('#modal-confirm').onclick = () => close(true);
            overlay.onclick = (e) => { if (e.target === overlay) close(false); };
        });
    }

    // ─── Loading Skeleton ─────────────────────────────────────────────
    function skeleton(height = '1rem', width = '100%') {
        return `<div class="skeleton" style="height:${height};width:${width}"></div>`;
    }

    function skeletonCard() {
        return `<div class="nr-card p-6 space-y-4">
            ${skeleton('0.75rem', '40%')}${skeleton('1.5rem', '60%')}${skeleton('0.75rem', '80%')}
        </div>`;
    }

    // ─── Status Badge ─────────────────────────────────────────────────
    function statusBadge(status) {
        const s = (status || '').toLowerCase().replace('_', '');
        const map = {
            booked: { cls: 'status-booked', label: 'Booked' },
            cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
            completed: { cls: 'status-completed', label: 'Completed' },
            noshow: { cls: 'status-noshow', label: 'No Show' },
            no_show: { cls: 'status-noshow', label: 'No Show' }
        };
        const info = map[s] || { cls: 'status-booked', label: status };
        return `<span class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${info.cls}">${info.label}</span>`;
    }

    // ─── Top Navigation Bar ───────────────────────────────────────────
    function topNav(activePage = '') {
        const user = Auth.getUser();
        const isAuth = Auth.isAuthenticated();
        const isAdm = Auth.isAdmin();

        const navLinks = isAdm ? [
            { label: 'Dashboard', href: '#/admin', id: 'admin' },
            { label: 'Schedule', href: '#/admin/schedule', id: 'admin/schedule' },
            { label: 'Logs', href: '#/admin/logs', id: 'admin/logs' },
        ] : isAuth ? [
            { label: 'Dashboard', href: '#/dashboard', id: 'dashboard' },
            { label: 'Book Now', href: '#/booking', id: 'booking' },
            { label: 'My Appointments', href: '#/appointments', id: 'appointments' },
        ] : [
            { label: 'Home', href: '#/', id: '' },
            { label: 'Book Now', href: '#/booking', id: 'booking' },
        ];

        return `
        <header class="fixed top-0 w-full z-50" style="background:rgba(5,8,22,0.82);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border-bottom:1px solid rgba(139,92,255,0.06)">
            <div class="flex justify-between items-center h-[72px] px-6 md:px-10 w-full max-w-7xl mx-auto">
                <div class="flex items-center gap-10">
                    <a href="#/" class="flex items-center gap-3">
                        <img src="assets/sword_logo.png" alt="Noctis Reserve Logo" class="nr-brand-logo" style="mix-blend-mode: screen;">
                        <span class="text-xl font-extrabold tracking-tight font-headline" style="color:#EAEAF7">Noctis Reserve</span>
                    </a>
                    <nav class="hidden md:flex items-center gap-8">
                        ${navLinks.map(l => `
                            <a href="${l.href}" class="transition-colors font-headline font-semibold tracking-tight text-[15px]" style="color:${activePage === l.id ? '#EAEAF7' : '#A9A9C8'}" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='${activePage === l.id ? '#EAEAF7' : '#A9A9C8'}'">${l.label}</a>
                        `).join('')}
                    </nav>
                </div>
                <div class="flex items-center gap-5">
                    ${isAuth ? `
                        <span class="hidden md:block text-[15px] font-medium" style="color:#A9A9C8">${user?.fullName || ''}</span>
                        <button onclick="Auth.logout()" class="transition-colors p-2.5 rounded-lg" style="color:#A9A9C8" onmouseover="this.style.color='#8B5CFF'" onmouseout="this.style.color='#A9A9C8'" title="Logout">
                            <span class="material-symbols-outlined text-[22px]">logout</span>
                        </button>
                    ` : `
                        <a href="#/login" class="cta-glow px-6 py-2.5 rounded-xl text-[15px] font-bold">Sign In</a>
                    `}
                </div>
            </div>
        </header>`;
    }

    // ─── Admin Sidebar ────────────────────────────────────────────────
    function adminSidebar(activePage = 'overview') {
        const items = [
            { icon: 'dashboard', label: 'Overview', href: '#/admin', id: 'overview' },
            { icon: 'calendar_today', label: 'Schedule', href: '#/admin/schedule', id: 'schedule' },
            { icon: 'insert_chart', label: 'Logs', href: '#/admin/logs', id: 'logs' },
        ];
        return `
        <aside class="hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 flex-col p-4 gap-2 pt-20 shadow-2xl" style="background:rgba(5,8,22,0.92);backdrop-filter:blur(24px);border-right:1px solid rgba(139,92,255,0.06)">
            <div class="px-4 py-6">
                <div class="flex items-center gap-2.5 mb-1">
                    <div class="w-6 h-6 rounded-md flex items-center justify-center" style="background:linear-gradient(135deg,#5B2EFF,#8B5CFF)"><span class="material-symbols-outlined text-white text-xs" style="font-variation-settings:'FILL' 1">dark_mode</span></div>
                    <h2 class="text-base font-black font-headline" style="color:#EAEAF7">Noctis Admin</h2>
                </div>
                <p class="text-xs font-medium pl-8" style="color:#6B6B8D">Control Center</p>
            </div>
            <div class="flex flex-col gap-1 flex-1">
                ${items.map(i => `
                    <a href="${i.href}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline text-sm font-medium" style="${activePage === i.id ? 'background:rgba(91,46,255,0.12);color:#EAEAF7;border:1px solid rgba(139,92,255,0.1)' : 'color:#A9A9C8;border:1px solid transparent'}" onmouseover="if('${activePage}'!=='${i.id}'){this.style.color='#EAEAF7';this.style.background='rgba(139,92,255,0.08)'}" onmouseout="if('${activePage}'!=='${i.id}'){this.style.color='#A9A9C8';this.style.background='transparent'}">
                        <span class="material-symbols-outlined"${activePage === i.id ? ' style="font-variation-settings:\'FILL\' 1;color:#8B5CFF"' : ''}>${i.icon}</span>
                        <span>${i.label}</span>
                    </a>
                `).join('')}
            </div>
            <div class="mt-auto pt-4 flex flex-col gap-1" style="border-top:1px solid rgba(139,92,255,0.06)">
                <a href="#/booking" class="cta-glow flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all btn-press">
                    <span class="material-symbols-outlined">add</span><span>New Booking</span>
                </a>
                <button onclick="Auth.logout()" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline text-sm font-medium w-full text-left" style="color:#A9A9C8" onmouseover="this.style.color='#EAEAF7'" onmouseout="this.style.color='#A9A9C8'">
                    <span class="material-symbols-outlined">logout</span><span>Logout</span>
                </button>
            </div>
        </aside>`;
    }

    // ─── Loading Spinner ──────────────────────────────────────────────
    function spinner(size = '2rem') {
        return `<div class="flex items-center justify-center py-12"><div class="w-8 h-8 rounded-full animate-spin" style="border:2px solid rgba(139,92,255,0.15);border-top-color:#8B5CFF"></div></div>`;
    }

    // ─── Empty State ──────────────────────────────────────────────────
    function emptyState(icon, title, message, actionLabel, actionHref) {
        return `
        <div class="flex flex-col items-center justify-center py-24 px-8 text-center rounded-xl" style="background:rgba(11,16,32,0.4);border:2px dashed rgba(139,92,255,0.1)">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mb-6" style="background:rgba(91,46,255,0.08)">
                <span class="material-symbols-outlined text-4xl" style="color:#6B6B8D">${icon}</span>
            </div>
            <h3 class="text-xl font-bold font-headline mb-2" style="color:#EAEAF7">${title}</h3>
            <p class="max-w-xs mb-8" style="color:#A9A9C8">${message}</p>
            ${actionLabel ? `<a href="${actionHref}" class="cta-glow px-8 py-3 rounded-xl font-bold btn-press">${actionLabel}</a>` : ''}
        </div>`;
    }

    // ─── Format Helpers ───────────────────────────────────────────────
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${m} ${ampm}`;
    }

    function formatDateTime(dtStr) {
        if (!dtStr) return '';
        const d = new Date(dtStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    }

    function dayOfWeekShort(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    }

    function dayNumber(dateStr) {
        return new Date(dateStr + 'T00:00:00').getDate();
    }

    return { toast, confirm, skeleton, skeletonCard, statusBadge, topNav, adminSidebar, spinner, emptyState, formatDate, formatTime, formatDateTime, dayOfWeekShort, dayNumber };
})();
