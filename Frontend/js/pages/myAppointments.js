// ─── My Appointments ────────────────────────────────────────────────────────
// Consumes: AppointmentsAPI.getMyAppointments, BookingAPI.cancelAppointment

const MyAppointmentsPage = (() => {
    let _filter = '';
    let _appointments = [];

    function render() {
        return `
        ${UI.topNav('appointments')}
        <main class="pt-24 px-6 pb-12 min-h-screen page-shell">
            <div class="max-w-5xl mx-auto relative z-10">
                <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] mb-2" style="color:#8B5CFF">Your Schedule</p>
                        <h1 class="text-4xl font-headline font-extrabold tracking-tight mb-2" style="color:#EAEAF7">My Appointments</h1>
                        <p id="appts-subtitle" style="color:#A9A9C8">Loading...</p>
                    </div>
                    <a href="#/booking" class="cta-glow inline-flex gap-2 items-center px-6 py-3 rounded-xl font-bold btn-press">
                        <span class="material-symbols-outlined text-sm">add</span> New Booking
                    </a>
                </header>
                <!-- Tab Filter -->
                <div class="flex p-1 rounded-xl mb-8 max-w-lg" style="background:rgba(3,5,16,0.8)">
                    <button onclick="MyAppointmentsPage._setFilter('')" id="tab-all" class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all" style="background:rgba(91,46,255,0.15);color:#EAEAF7">All</button>
                    <button onclick="MyAppointmentsPage._setFilter('active')" id="tab-active" class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all" style="color:#A9A9C8">Active</button>
                    <button onclick="MyAppointmentsPage._setFilter('cancelled')" id="tab-cancelled" class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all" style="color:#A9A9C8">Cancelled</button>
                    <button onclick="MyAppointmentsPage._setFilter('past')" id="tab-past" class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all" style="color:#A9A9C8">Past</button>
                </div>
                <div id="appts-list">${UI.spinner()}</div>
            </div>
        </main>`;
    }

    async function init() {
        _filter = '';
        await _load();
    }

    async function _load() {
        const container = document.getElementById('appts-list');
        if (container) container.innerHTML = UI.spinner();
        try {
            _appointments = await API.Appointments.getMyAppointments(_filter || null);
            _renderList();
        } catch (err) {
            if (container) container.innerHTML = `<p class="text-center py-8" style="color:#f87171">${err.message}</p>`;
        }
    }

    function _renderList() {
        const container = document.getElementById('appts-list');
        const sub = document.getElementById('appts-subtitle');
        if (sub) sub.textContent = `${_appointments.length} appointment${_appointments.length !== 1 ? 's' : ''} found`;

        if (!_appointments.length) {
            container.innerHTML = UI.emptyState('event_busy', 'No appointments', _filter ? `No ${_filter} appointments found.` : 'You have not booked any appointments yet.', 'Book Now', '#/booking');
            return;
        }

        container.innerHTML = `<div class="space-y-4">${_appointments.map(a => `
            <div class="nr-card p-6 group hover:shadow-xl transition-shadow">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style="background:rgba(91,46,255,0.08);color:#8B5CFF">
                            <span class="text-xs font-label uppercase">${UI.dayOfWeekShort(a.date)}</span>
                            <span class="text-xl font-headline font-bold">${UI.dayNumber(a.date)}</span>
                        </div>
                        <div>
                            <h3 class="font-headline font-bold mb-1" style="color:#EAEAF7">${UI.formatDate(a.date)}</h3>
                            <div class="flex flex-wrap gap-4 text-sm mb-2" style="color:#A9A9C8">
                                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span> ${a.startTime} — ${a.endTime}</span>
                                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">wb_twilight</span> ${a.shift}</span>
                                ${a.durationMinutes ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">timer</span> ${a.durationMinutes} min</span>` : ''}
                            </div>
                            <p class="text-xs font-mono" style="color:#6B6B8D">${a.bookingCode}</p>
                            ${a.notes ? `<p class="text-xs mt-1 italic" style="color:#A9A9C8">"${a.notes}"</p>` : ''}
                            ${a.cancellationReason ? `<p class="text-xs mt-1" style="color:#f87171">Reason: ${a.cancellationReason}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        ${UI.statusBadge(a.status)}
                        ${a.status === 'Booked' ? `
                        <button onclick="MyAppointmentsPage._cancel('${a.id}')" class="p-2 rounded-lg transition-all btn-press" style="background:rgba(248,113,113,0.08);color:#f87171" onmouseover="this.style.background='rgba(248,113,113,0.15)'" onmouseout="this.style.background='rgba(248,113,113,0.08)'" title="Cancel">
                            <span class="material-symbols-outlined text-sm">event_busy</span>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `).join('')}</div>`;
    }

    async function _cancel(id) {
        const ok = await UI.confirm('Cancel Appointment', 'Are you sure you want to cancel this appointment? This action cannot be undone.', 'Yes, Cancel It', 'nr-btn px-6 py-2.5 text-sm font-bold rounded-xl" style="background:rgba(248,113,113,0.15);color:#f87171');
        if (!ok) return;
        try {
            await API.Booking.cancelAppointment(id, 'Cancelled by user');
            UI.toast('Appointment cancelled.', 'success');
            await _load();
        } catch (err) {
            UI.toast(err.message, 'error');
        }
    }

    function _setFilter(f) {
        _filter = f;
        ['all', 'active', 'cancelled', 'past'].forEach(t => {
            const el = document.getElementById(`tab-${t}`);
            if (el) {
                const isActive = (f === '' && t === 'all') || f === t;
                el.style.background = isActive ? 'rgba(91,46,255,0.15)' : 'transparent';
                el.style.color = isActive ? '#EAEAF7' : '#A9A9C8';
            }
        });
        _load();
    }

    return { render, init, _setFilter, _cancel };
})();
