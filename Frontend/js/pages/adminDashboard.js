// ─── Admin Dashboard ────────────────────────────────────────────────────────
// Consumes: AdminDashboardAPI.getOverview, getActivity, getAnalytics
//
// Backend DTO shapes (camelCase from ASP.NET Core):
//   DashboardOverviewDto: { totalBookings: StatCardDto, cancelledAppointments: StatCardDto, occupancyRate: StatCardDto, activeConfigs: StatCardDto, todayStats: TodayStatsDto }
//   StatCardDto: { label, value, trend, trendDirection }
//   TodayStatsDto: { todayBookings, openSlots, totalCapacity }
//   DashboardActivityDto: { recentActivity: ActivityItemDto[] }
//   ActivityItemDto: { id, userName, userEmail, userAvatar, description, bookingCode, status, statusLabel, timestamp }
//   DashboardAnalyticsDto: { bookingTrends: MonthlyTrendDto[], peakHours: PeakHoursDto }
//   MonthlyTrendDto: { month, bookings }

const AdminDashboardPage = (() => {
    function render() {
        return `
        ${UI.topNav('admin')}
        ${UI.adminSidebar('overview')}
        <main class="lg:ml-64 pt-24 px-6 pb-12 min-h-screen page-shell">
            <div class="max-w-7xl mx-auto space-y-8 relative z-10">
                <header class="flex justify-between items-end">
                    <div class="space-y-1">
                        <p class="font-medium tracking-widest text-[10px] uppercase" style="color:#8B5CFF">Control Center</p>
                        <h1 class="text-4xl font-extrabold font-headline tracking-tight" style="color:#EAEAF7">Dashboard Overview</h1>
                    </div>
                    <div class="flex gap-3">
                        <a href="#/admin/schedule" class="nr-btn nr-btn-surface px-6 py-2.5 text-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">settings_suggest</span> Schedule
                        </a>
                        <a href="#/booking" class="cta-glow px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 btn-press">
                            <span class="material-symbols-outlined text-sm">bolt</span> New Reservation
                        </a>
                    </div>
                </header>
                <div id="admin-stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${[1,2,3,4].map(() => UI.skeletonCard()).join('')}</div>
                <div id="admin-main" class="grid grid-cols-12 gap-6">${UI.spinner()}</div>
            </div>
        </main>`;
    }

    async function init() {
        try {
            const [overview, activity, analytics] = await Promise.all([
                API.AdminDashboard.getOverview(),
                API.AdminDashboard.getActivity().catch(() => null),
                API.AdminDashboard.getAnalytics().catch(() => null)
            ]);

            const statsEl = document.getElementById('admin-stats');
            const statCards = [
                { dto: overview.totalBookings, icon: 'book_online' },
                { dto: overview.cancelledAppointments, icon: 'cancel' },
                { dto: overview.occupancyRate, icon: 'pie_chart' },
                { dto: overview.activeConfigs, icon: 'settings_suggest' }
            ];

            statsEl.innerHTML = statCards.map(c => {
                const d = c.dto;
                if (!d) return '';
                const isUp = d.trendDirection === 'up';
                return `
                <div class="nr-stat group">
                    <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-5xl" style="color:#8B5CFF">${c.icon}</span>
                    </div>
                    <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color:#A9A9C8">${d.label}</p>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-3xl font-bold font-headline" style="color:#EAEAF7">${d.value}</h3>
                        ${d.trend ? `<span class="text-xs font-bold" style="color:${isUp ? '#34d399' : '#f87171'}">${d.trend}</span>` : ''}
                    </div>
                    <div class="mt-4 h-1 w-full rounded-full overflow-hidden" style="background:rgba(139,92,255,0.08)">
                        <div class="h-full rounded-full" style="width:60%;background:linear-gradient(90deg,#5B2EFF,#8B5CFF)"></div>
                    </div>
                </div>`;
            }).join('');

            if (overview.todayStats) {
                const ts = overview.todayStats;
                statsEl.innerHTML += `
                <div class="col-span-full grid grid-cols-3 gap-6">
                    <div class="nr-stat text-center"><p class="text-xs uppercase mb-1" style="color:#A9A9C8">Today</p><p class="text-2xl font-bold" style="color:#EAEAF7">${ts.todayBookings}</p></div>
                    <div class="nr-stat text-center"><p class="text-xs uppercase mb-1" style="color:#A9A9C8">Open Slots</p><p class="text-2xl font-bold" style="color:#EAEAF7">${ts.openSlots}</p></div>
                    <div class="nr-stat text-center"><p class="text-xs uppercase mb-1" style="color:#A9A9C8">Total Capacity</p><p class="text-2xl font-bold" style="color:#EAEAF7">${ts.totalCapacity}</p></div>
                </div>`;
            }

            const mainEl = document.getElementById('admin-main');
            const trends = analytics?.bookingTrends || [];
            const activityItems = activity?.recentActivity || [];

            mainEl.innerHTML = `
                <!-- Chart -->
                <div class="col-span-12 lg:col-span-8 nr-card p-8">
                    <div class="flex justify-between items-center mb-8">
                        <div><h2 class="text-xl font-bold font-headline" style="color:#EAEAF7">Booking Trends</h2><p class="text-sm" style="color:#A9A9C8">Monthly activity</p></div>
                        <div class="flex items-center gap-4 text-xs font-medium">
                            <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full" style="background:#8B5CFF"></div> Bookings</span>
                        </div>
                    </div>
                    <div class="h-64 flex items-end justify-between gap-3 px-2">
                        ${trends.length ? trends.map(t => {
                            const maxVal = Math.max(...trends.map(x => x.bookings || 0), 1);
                            const pct = Math.round(((t.bookings || 0) / maxVal) * 100);
                            return `<div class="w-full rounded-t-lg transition-all relative group cursor-pointer" style="height:${Math.max(5, pct)}%;background:rgba(139,92,255,0.15)" onmouseover="this.style.background='rgba(139,92,255,0.35)'" onmouseout="this.style.background='rgba(139,92,255,0.15)'">
                                <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap" style="background:rgba(11,16,32,0.9);border:1px solid rgba(139,92,255,0.15);color:#EAEAF7">${t.month}: ${t.bookings}</div>
                            </div>`;
                        }).join('') : '<p class="text-sm w-full text-center self-center" style="color:#A9A9C8">No trend data available</p>'}
                    </div>
                    ${trends.length ? `<div class="flex justify-between mt-4 px-2 text-[10px] font-bold uppercase" style="color:#6B6B8D">${trends.map(t => `<span>${t.month}</span>`).join('')}</div>` : ''}
                </div>

                <!-- Operations -->
                <div class="col-span-12 lg:col-span-4 space-y-6">
                    <div class="nr-card p-6">
                        <h3 class="text-lg font-bold font-headline mb-4" style="color:#EAEAF7">Operations</h3>
                        <div class="space-y-3">
                            <a href="#/admin/schedule" class="w-full text-left p-4 rounded-xl flex items-center justify-between group transition-all" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)" onmouseover="this.style.borderColor='rgba(139,92,255,0.2)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg" style="background:rgba(91,46,255,0.1);color:#8B5CFF"><span class="material-symbols-outlined">dataset</span></div>
                                    <div><p class="text-sm font-bold" style="color:#EAEAF7">Configure Schedule</p><p class="text-[10px]" style="color:#6B6B8D">Manage shifts & capacity</p></div>
                                </div>
                                <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform" style="color:#A9A9C8">chevron_right</span>
                            </a>
                            <a href="#/admin/logs" class="w-full text-left p-4 rounded-xl flex items-center justify-between group transition-all" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)" onmouseover="this.style.borderColor='rgba(139,92,255,0.2)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg" style="background:rgba(184,164,255,0.1);color:#b8a4ff"><span class="material-symbols-outlined">rule</span></div>
                                    <div><p class="text-sm font-bold" style="color:#EAEAF7">Audit Logs</p><p class="text-[10px]" style="color:#6B6B8D">View all activity</p></div>
                                </div>
                                <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform" style="color:#A9A9C8">chevron_right</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Activity Log -->
                <div class="col-span-12 nr-card p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold font-headline" style="color:#EAEAF7">Recent Activity</h3>
                        <a href="#/admin/logs" class="nr-tag nr-tag-purple transition-colors" onmouseover="this.style.background='rgba(91,46,255,0.25)'" onmouseout="this.style.background='rgba(91,46,255,0.15)'">View All</a>
                    </div>
                    ${activityItems.length ? `<div class="space-y-4">${activityItems.slice(0, 5).map(a => `
                        <div class="flex items-center justify-between py-3" style="border-bottom:1px solid rgba(139,92,255,0.06)">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(91,46,255,0.08)">
                                    <span class="material-symbols-outlined" style="color:#8B5CFF">person</span>
                                </div>
                                <div>
                                    <p class="text-sm font-bold" style="color:#EAEAF7">${a.userName || 'System'}</p>
                                    <p class="text-[10px]" style="color:#6B6B8D">${a.description || ''} ${a.bookingCode ? '• ' + a.bookingCode : ''}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                ${a.statusLabel ? `<p class="text-[10px] font-bold uppercase tracking-widest" style="color:${a.status === 'Booked' ? '#34d399' : a.status === 'Cancelled' ? '#f87171' : '#A9A9C8'}">${a.statusLabel}</p>` : ''}
                                <p class="text-[10px]" style="color:#6B6B8D">${UI.formatDateTime(a.timestamp)}</p>
                            </div>
                        </div>
                    `).join('')}</div>` : `<p class="text-sm" style="color:#A9A9C8">No recent activity.</p>`}
                </div>`;
        } catch (err) {
            document.getElementById('admin-stats').innerHTML = `<div class="col-span-4 text-center py-12"><p style="color:#f87171">${err.message}</p></div>`;
            document.getElementById('admin-main').innerHTML = '';
        }
    }

    return { render, init };
})();
