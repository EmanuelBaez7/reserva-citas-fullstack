// ─── Reservation Logs ───────────────────────────────────────────────────────
// Consumes: AdminLogsAPI.getLogs, getLogDetail
//
// Backend DTO shapes (camelCase from ASP.NET Core + JsonStringEnumConverter):
//   PagedResult<AuditLogDto>: { items, totalCount, page, pageSize, totalPages }
//   AuditLogDto: { id, userName, userEmail, userAvatar, action (STRING), entityType, entityId, details, statusLabel, logRef, timestamp }
//   AuditAction enum values (serialized as strings): "Created", "Cancelled", "Completed", "NoShow", "Modified", "Login", "Register", "ScheduleChange", "SettingsChange"
//   AdminLogsController query: page, pageSize, from, to, action (AuditAction?), profileId, search

const ReservationLogsPage = (() => {
    let _page = 1;
    let _pageSize = 20;
    let _search = '';
    let _action = '';
    let _totalPages = 1;

    function render() {
        return `
        ${UI.topNav('admin/logs')}
        ${UI.adminSidebar('logs')}
        <main class="lg:ml-64 pt-24 px-6 pb-12 min-h-screen page-shell">
            <div class="max-w-7xl mx-auto relative z-10">
                <header class="mb-10">
                    <p class="text-xs font-bold uppercase tracking-[0.2em] mb-2" style="color:#8B5CFF">Audit Trail</p>
                    <h1 class="font-headline text-3xl font-extrabold tracking-tight mb-2" style="color:#EAEAF7">Reservation Activity Logs</h1>
                    <p style="color:#A9A9C8">Real-time audit trail and interaction monitoring.</p>
                </header>
                <!-- Filters -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <div class="lg:col-span-2 p-1.5 rounded-xl" style="background:rgba(11,16,32,0.6);border:1px solid rgba(139,92,255,0.06)">
                        <div class="flex items-center flex-1 px-4 gap-3 rounded-lg h-12" style="background:rgba(3,5,16,0.8)">
                            <span class="material-symbols-outlined" style="color:#6B6B8D">search</span>
                            <input id="log-search" type="text" placeholder="Search by name, action or ID..." class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:opacity-50 outline-none" style="color:#EAEAF7" value="${_search}">
                        </div>
                    </div>
                    <div class="p-1.5 rounded-xl" style="background:rgba(11,16,32,0.6);border:1px solid rgba(139,92,255,0.06)">
                        <select id="log-action-filter" class="nr-input h-full" style="padding:0.5rem 2.5rem 0.5rem 1rem">
                            <option value="">All Actions</option>
                            <option value="Created" ${_action==='Created'?'selected':''}>Created</option>
                            <option value="Cancelled" ${_action==='Cancelled'?'selected':''}>Cancelled</option>
                            <option value="Completed" ${_action==='Completed'?'selected':''}>Completed</option>
                            <option value="NoShow" ${_action==='NoShow'?'selected':''}>NoShow</option>
                            <option value="Modified" ${_action==='Modified'?'selected':''}>Modified</option>
                            <option value="Login" ${_action==='Login'?'selected':''}>Login</option>
                            <option value="Register" ${_action==='Register'?'selected':''}>Register</option>
                            <option value="ScheduleChange" ${_action==='ScheduleChange'?'selected':''}>ScheduleChange</option>
                            <option value="SettingsChange" ${_action==='SettingsChange'?'selected':''}>SettingsChange</option>
                        </select>
                    </div>
                    <div class="p-1.5 rounded-xl flex items-center justify-center" style="background:rgba(11,16,32,0.6);border:1px solid rgba(139,92,255,0.06)">
                        <button onclick="ReservationLogsPage._applyFilters()" class="nr-btn nr-btn-surface h-full w-full flex items-center justify-center gap-2 px-4 text-sm">
                            <span class="material-symbols-outlined text-sm">filter_list</span> Apply
                        </button>
                    </div>
                </div>
                <!-- Table -->
                <div id="logs-table" class="nr-card overflow-hidden">${UI.spinner()}</div>
            </div>
        </main>`;
    }

    async function init() {
        _page = 1; _search = ''; _action = '';
        await _load();
        document.getElementById('log-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') _applyFilters();
        });
    }

    async function _load() {
        const container = document.getElementById('logs-table');
        if (container) container.innerHTML = `<div class="p-8">${UI.spinner()}</div>`;
        try {
            const result = await API.AdminLogs.getLogs({
                page: _page, pageSize: _pageSize, search: _search || undefined,
                action: _action || undefined
            });
            const items = result.items || [];
            const total = result.totalCount || 0;
            _totalPages = result.totalPages || Math.ceil(total / _pageSize) || 1;
            _renderTable(items, total);
        } catch (err) {
            if (container) container.innerHTML = `<div class="p-8 text-center" style="color:#f87171">${err.message}</div>`;
        }
    }

    function _renderTable(items, total) {
        const container = document.getElementById('logs-table');

        const actionColorMap = {
            'Created': '#b8a4ff',
            'Cancelled': '#f87171',
            'Completed': '#34d399',
            'NoShow': '#fbbf24',
            'Modified': '#8B5CFF',
            'Login': '#A9A9C8',
            'Register': '#60a5fa',
            'ScheduleChange': '#818cf8',
            'SettingsChange': '#6B6B8D'
        };

        container.innerHTML = `
        <div class="overflow-x-auto no-scrollbar">
            <table class="nr-table">
                <thead><tr>
                    <th>User</th><th>Action</th><th>Details</th><th>Ref</th><th>Timestamp</th>
                </tr></thead>
                <tbody>
                    ${items.length ? items.map(log => {
                        const actionColor = actionColorMap[log.action] || '#A9A9C8';
                        return `
                        <tr class="cursor-pointer">
                            <td>
                                <div>
                                    <p class="text-sm font-bold" style="color:#EAEAF7">${log.userName || 'System'}</p>
                                    <p class="text-[10px]" style="color:#6B6B8D">${log.userEmail || ''}</p>
                                </div>
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full" style="background:${actionColor}"></div>
                                    <span class="text-sm font-semibold" style="color:${actionColor}">${log.action || '—'}</span>
                                </div>
                            </td>
                            <td>
                                <p class="text-sm truncate max-w-xs" style="color:#A9A9C8">${log.details || '—'}</p>
                                ${log.statusLabel ? `<p class="text-[10px] mt-0.5" style="color:#6B6B8D">${log.statusLabel}</p>` : ''}
                            </td>
                            <td>
                                <p class="text-xs font-mono" style="color:#6B6B8D">${log.logRef || '—'}</p>
                            </td>
                            <td>
                                <p class="text-sm" style="color:#A9A9C8">${UI.formatDateTime(log.timestamp)}</p>
                            </td>
                        </tr>`;
                    }).join('') : `<tr><td colspan="5" class="text-center py-12" style="color:#A9A9C8">No logs found.</td></tr>`}
                </tbody>
            </table>
        </div>
        <!-- Pagination -->
        <div class="px-6 py-4 flex items-center justify-between" style="border-top:1px solid rgba(139,92,255,0.06);background:rgba(11,16,32,0.3)">
            <span class="text-xs font-medium" style="color:#A9A9C8">Page ${_page} of ${_totalPages} (${total} entries)</span>
            <div class="flex items-center gap-2">
                <button onclick="ReservationLogsPage._prevPage()" ${_page <= 1 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg ${_page <= 1 ? 'opacity-30' : ''} transition-colors btn-press" style="background:rgba(139,92,255,0.06)" ${_page > 1 ? `onmouseover="this.style.background='rgba(139,92,255,0.15)'" onmouseout="this.style.background='rgba(139,92,255,0.06)'"` : ''}>
                    <span class="material-symbols-outlined text-sm" style="color:#EAEAF7">chevron_left</span>
                </button>
                ${[...Array(Math.min(5, _totalPages))].map((_, i) => {
                    const p = i + 1;
                    return `<button onclick="ReservationLogsPage._goToPage(${p})" class="px-3 h-8 flex items-center justify-center rounded-lg text-xs transition-colors btn-press" style="${p === _page ? 'background:linear-gradient(135deg,#5B2EFF,#8B5CFF);color:#fff;font-weight:700' : 'color:#A9A9C8'}" ${p !== _page ? `onmouseover="this.style.background='rgba(139,92,255,0.1)'" onmouseout="this.style.background='transparent'"` : ''}>${p}</button>`;
                }).join('')}
                ${_totalPages > 5 ? '<span style="color:#6B6B8D" class="px-1">...</span>' : ''}
                <button onclick="ReservationLogsPage._nextPage()" ${_page >= _totalPages ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg ${_page >= _totalPages ? 'opacity-30' : ''} transition-colors btn-press" style="background:rgba(139,92,255,0.06)" ${_page < _totalPages ? `onmouseover="this.style.background='rgba(139,92,255,0.15)'" onmouseout="this.style.background='rgba(139,92,255,0.06)'"` : ''}>
                    <span class="material-symbols-outlined text-sm" style="color:#EAEAF7">chevron_right</span>
                </button>
            </div>
        </div>`;
    }

    function _applyFilters() {
        _search = document.getElementById('log-search')?.value || '';
        _action = document.getElementById('log-action-filter')?.value || '';
        _page = 1;
        _load();
    }

    function _prevPage() { if (_page > 1) { _page--; _load(); } }
    function _nextPage() { if (_page < _totalPages) { _page++; _load(); } }
    function _goToPage(p) { _page = p; _load(); }

    return { render, init, _applyFilters, _prevPage, _nextPage, _goToPage };
})();
