// ─── User Dashboard ─────────────────────────────────────────────────────────
// Consumes: AuthAPI.me, AppointmentsAPI.getMyAppointments, BookingAPI.getDates

const UserDashboardPage = (() => {
    function render() {
        const user = Auth.getUser();
        return `
        ${UI.topNav('dashboard')}
        <main class="pt-24 px-6 pb-12 min-h-screen page-shell">
            <div class="max-w-7xl mx-auto relative z-10">
                <header class="mb-10">
                    <h1 class="text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-2" style="color:#EAEAF7">
                        ${Auth.getGreeting()}, ${user?.fullName?.split(' ')[0] || 'there'}.
                    </h1>
                    <p id="dash-subtitle" style="color:#A9A9C8">Loading your appointments...</p>
                </header>
                <div id="dash-content" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${[1,2,3,4].map(() => UI.skeletonCard()).join('')}
                </div>
            </div>
        </main>`;
    }

    async function init() {
        try {
            const [appointments, dates] = await Promise.all([
                API.Appointments.getMyAppointments(),
                API.Booking.getDates(7).catch(() => [])
            ]);

            const active = appointments.filter(a => a.status === 'Booked');
            const nextAppt = active.sort((a, b) => a.date.localeCompare(b.date))[0];
            const availableDates = dates.filter(d => d.status !== 'full' && d.status !== 'disabled');

            document.getElementById('dash-subtitle').textContent =
                active.length ? `You have ${active.length} active appointment${active.length > 1 ? 's' : ''}.` : 'No upcoming appointments.';

            document.getElementById('dash-content').innerHTML = `
                <!-- Next Appointment -->
                <div class="md:col-span-2 lg:col-span-2 p-8 rounded-xl shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[280px]" style="background:linear-gradient(135deg,rgba(43,18,76,0.4),rgba(11,16,32,0.8));border:1px solid rgba(139,92,255,0.1)">
                    <div class="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16" style="background:rgba(91,46,255,0.12)"></div>
                    ${nextAppt ? `
                    <div>
                        <div class="flex items-center gap-2 mb-6">
                            <span class="nr-tag nr-tag-purple">Upcoming Next</span>
                        </div>
                        <h3 class="text-3xl font-headline font-bold mb-2" style="color:#EAEAF7">Appointment</h3>
                        <div class="flex items-center gap-3" style="color:#A9A9C8">
                            <span class="material-symbols-outlined text-lg">schedule</span>
                            <span class="font-medium">${nextAppt.startTime} — ${nextAppt.endTime}</span>
                        </div>
                        <p class="mt-2" style="color:#A9A9C8">${UI.formatDate(nextAppt.date)} • ${nextAppt.shift}</p>
                        <p class="text-xs font-mono mt-2" style="color:#6B6B8D">${nextAppt.bookingCode}</p>
                    </div>
                    <div class="flex items-center justify-between mt-6">
                        ${UI.statusBadge(nextAppt.status)}
                        <a href="#/appointments" class="p-3 rounded-xl transition-all btn-press" style="background:rgba(139,92,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(139,92,255,0.1)" onmouseover="this.style.background='rgba(91,46,255,0.2)'" onmouseout="this.style.background='rgba(139,92,255,0.08)'">
                            <span class="material-symbols-outlined" style="color:#8B5CFF">arrow_forward</span>
                        </a>
                    </div>` : `
                    <div class="flex flex-col items-center justify-center text-center flex-1">
                        <span class="material-symbols-outlined text-4xl mb-4" style="color:#6B6B8D">event_available</span>
                        <h3 class="text-xl font-headline font-bold mb-2" style="color:#EAEAF7">No Upcoming Appointments</h3>
                        <p class="text-sm mb-4" style="color:#A9A9C8">Ready to schedule your next session?</p>
                        <a href="#/booking" class="cta-glow px-6 py-3 rounded-xl font-bold btn-press">Book Now</a>
                    </div>`}
                </div>

                <!-- Active Count -->
                <div class="nr-stat">
                    <div>
                        <div class="w-10 h-10 flex items-center justify-center rounded-lg mb-4" style="background:rgba(91,46,255,0.1);color:#8B5CFF">
                            <span class="material-symbols-outlined">event_available</span>
                        </div>
                        <h4 class="text-sm font-semibold uppercase tracking-widest mb-1" style="color:#A9A9C8">Active</h4>
                        <p class="text-2xl font-headline font-bold" style="color:#EAEAF7">${active.length} Booking${active.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <!-- Available Slots Today -->
                <div class="nr-stat">
                    <div class="flex items-center justify-between mb-4">
                        <span class="material-symbols-outlined" style="color:#8B5CFF">hourglass_empty</span>
                        <span class="nr-tag nr-tag-success">LIVE</span>
                    </div>
                    <h4 class="text-sm font-semibold uppercase tracking-widest mb-1" style="color:#A9A9C8">Open Dates</h4>
                    <p class="text-2xl font-headline font-bold" style="color:#EAEAF7">${availableDates.length} Available</p>
                </div>

                <!-- Quick Actions -->
                <div class="lg:col-span-2 nr-card p-6">
                    <h4 class="font-headline font-bold mb-6" style="color:#EAEAF7">Quick Actions</h4>
                    <div class="grid grid-cols-3 gap-4">
                        <a href="#/booking" class="flex flex-col items-center justify-center p-4 rounded-xl transition-all group btn-press" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)" onmouseover="this.style.borderColor='rgba(139,92,255,0.2)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'">
                            <span class="material-symbols-outlined mb-2 group-hover:scale-110 transition-transform" style="color:#8B5CFF">add_circle</span>
                            <span class="text-xs font-semibold" style="color:#EAEAF7">Book New</span>
                        </a>
                        <a href="#/appointments" class="flex flex-col items-center justify-center p-4 rounded-xl transition-all group btn-press" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)" onmouseover="this.style.borderColor='rgba(139,92,255,0.2)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'">
                            <span class="material-symbols-outlined mb-2 group-hover:scale-110 transition-transform" style="color:#b8a4ff">list_alt</span>
                            <span class="text-xs font-semibold" style="color:#EAEAF7">View Mine</span>
                        </a>
                        <button onclick="Auth.logout()" class="flex flex-col items-center justify-center p-4 rounded-xl transition-all group btn-press" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)" onmouseover="this.style.borderColor='rgba(139,92,255,0.2)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'">
                            <span class="material-symbols-outlined mb-2 group-hover:scale-110 transition-transform" style="color:#A9A9C8">logout</span>
                            <span class="text-xs font-semibold" style="color:#EAEAF7">Logout</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Appointments -->
                <div class="md:col-span-3 lg:col-span-2 nr-card p-8">
                    <h4 class="font-headline font-bold text-xl mb-6" style="color:#EAEAF7">Recent Appointments</h4>
                    ${appointments.length ? `<div class="space-y-4">
                        ${appointments.slice(0, 5).map((a, idx) => `
                        <div class="flex items-center justify-between py-3 ${idx > 0 ? '' : ''}" style="${idx > 0 ? 'border-top:1px solid rgba(139,92,255,0.06)' : ''}">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(91,46,255,0.08)">
                                    <span class="material-symbols-outlined" style="color:#8B5CFF">event</span>
                                </div>
                                <div>
                                    <p class="text-sm font-bold" style="color:#EAEAF7">${UI.formatDate(a.date)} • ${a.startTime}</p>
                                    <p class="text-[10px]" style="color:#6B6B8D">${a.bookingCode} • ${a.shift}</p>
                                </div>
                            </div>
                            <div class="text-right">${UI.statusBadge(a.status)}</div>
                        </div>`).join('')}
                    </div>` : `<p class="text-sm" style="color:#A9A9C8">No appointments yet.</p>`}
                </div>`;
        } catch (err) {
            document.getElementById('dash-content').innerHTML = `<div class="md:col-span-4 text-center py-12"><p style="color:#f87171">${err.message}</p></div>`;
        }
    }

    return { render, init };
})();
