// ─── Booking Flow ───────────────────────────────────────────────────────────
// Full multi-step: Date → Shift → Slot → Review → Confirm
// Consumes: BookingAPI.getDates, getShifts, getSlots, createAppointment

const BookingPage = (() => {
    let _state = { step: 1, dates: [], shifts: [], slots: [], selectedDate: null, selectedShift: null, selectedSlot: null, notes: '', loading: false };

    function render() {
        return `
        ${UI.topNav('booking')}
        <main class="max-w-6xl mx-auto px-6 py-12 md:py-20 pt-24 page-shell">
            <div class="relative z-10">
            <header class="mb-12">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] mb-2" style="color:#8B5CFF">Reservation</p>
                        <h1 class="font-headline text-4xl font-extrabold tracking-tight mb-2" style="color:#EAEAF7">Book Appointment</h1>
                        <p id="step-label" class="font-label tracking-wide" style="color:#A9A9C8">Step 1 of 4: Select Date</p>
                    </div>
                    <a href="#${Auth.isAuthenticated() ? Auth.getHomePath() : '/'}" class="p-3 rounded-full transition-all btn-press" style="background:rgba(139,92,255,0.08);color:#EAEAF7;border:1px solid rgba(139,92,255,0.1)" onmouseover="this.style.background='rgba(139,92,255,0.15)'" onmouseout="this.style.background='rgba(139,92,255,0.08)'">
                        <span class="material-symbols-outlined">close</span>
                    </a>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex-1 h-1.5 rounded-full relative overflow-hidden" style="background:rgba(139,92,255,0.1)"><div id="prog-1" class="absolute inset-0 w-full transition-all" style="background:linear-gradient(90deg,#5B2EFF,#8B5CFF)"></div></div>
                    <div class="flex-1 h-1.5 rounded-full relative overflow-hidden" style="background:rgba(139,92,255,0.1)"><div id="prog-2" class="absolute inset-0 w-0 transition-all" style="background:linear-gradient(90deg,#5B2EFF,#8B5CFF)"></div></div>
                    <div class="flex-1 h-1.5 rounded-full relative overflow-hidden" style="background:rgba(139,92,255,0.1)"><div id="prog-3" class="absolute inset-0 w-0 transition-all" style="background:linear-gradient(90deg,#5B2EFF,#8B5CFF)"></div></div>
                    <div class="flex-1 h-1.5 rounded-full relative overflow-hidden" style="background:rgba(139,92,255,0.1)"><div id="prog-4" class="absolute inset-0 w-0 transition-all" style="background:linear-gradient(90deg,#5B2EFF,#8B5CFF)"></div></div>
                </div>
            </header>
            <div id="booking-content">${UI.spinner()}</div>
            </div>
        </main>`;
    }

    async function init() {
        _state = { step: 1, dates: [], shifts: [], slots: [], selectedDate: null, selectedShift: null, selectedSlot: null, notes: '', loading: false };
        await _loadDates();
    }

    async function _loadDates() {
        const container = document.getElementById('booking-content');
        try {
            _state.dates = await API.Booking.getDates(30);
            _renderStep1();
        } catch (err) {
            container.innerHTML = `<div class="text-center py-16"><p class="mb-4" style="color:#f87171">${err.message}</p><button onclick="BookingPage._retry()" class="nr-btn nr-btn-surface px-6 py-3">Retry</button></div>`;
        }
    }

    function _renderStep1() {
        _updateProgress(1);
        const container = document.getElementById('booking-content');
        const dates = _state.dates;
        if (!dates.length) {
            container.innerHTML = UI.emptyState('calendar_month', 'No dates available', 'There are no available booking dates at this time. Please check back later.', 'Go Home', '#/');
            return;
        }
        container.innerHTML = `
        <section class="space-y-4">
            <div class="flex justify-between items-center"><h2 class="font-headline text-xl font-bold" style="color:#EAEAF7">Select Date</h2></div>
            <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
                ${dates.map((d, i) => {
                    const disabled = d.status === 'full' || d.status === 'disabled';
                    const limited = d.status === 'limited';
                    return `<button ${disabled ? 'disabled' : ''} onclick="BookingPage._selectDate(${i})"
                        class="flex flex-col items-center p-4 rounded-lg transition-all group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}" style="${disabled ? 'background:rgba(11,16,32,0.3)' : 'background:rgba(11,16,32,0.6);border:1px solid rgba(139,92,255,0.08)'}" ${!disabled ? `onmouseover="this.style.borderColor='rgba(139,92,255,0.3)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.08)'"` : ''}>
                        <span class="text-xs font-label" style="color:#A9A9C8">${UI.dayOfWeekShort(d.date)}</span>
                        <span class="text-2xl font-headline font-bold" style="color:#EAEAF7">${UI.dayNumber(d.date)}</span>
                        <span class="text-[10px] mt-2 font-label uppercase" style="color:${disabled ? '#f87171' : limited ? '#fbbf24' : '#A9A9C8'}">
                            ${disabled ? (d.status === 'full' ? 'Full' : 'Disabled') : limited ? 'Limited' : d.availableSlots + ' Slots'}
                        </span>
                    </button>`;
                }).join('')}
            </div>
        </section>`;
    }

    async function _selectDate(idx) {
        _state.selectedDate = _state.dates[idx];
        _state.selectedShift = null; _state.selectedSlot = null;
        _updateProgress(2);
        const container = document.getElementById('booking-content');
        container.innerHTML = UI.spinner();
        try {
            _state.shifts = await API.Booking.getShifts(_state.selectedDate.date);
            _renderStep2();
        } catch (err) {
            container.innerHTML = `<p class="text-center py-8" style="color:#f87171">${err.message}</p>`;
        }
    }

    function _renderStep2() {
        _updateProgress(2);
        const container = document.getElementById('booking-content');
        const enabledShifts = _state.shifts.filter(s => s.isEnabled);
        if (!enabledShifts.length) {
            container.innerHTML = `<div class="text-center py-12"><p class="mb-4" style="color:#A9A9C8">No shifts available for ${UI.formatDate(_state.selectedDate.date)}</p><button onclick="BookingPage._backToStep1()" class="nr-btn nr-btn-surface px-6 py-3">Back</button></div>`;
            return;
        }
        container.innerHTML = `
        <div class="mb-4"><button onclick="BookingPage._backToStep1()" class="text-sm font-bold flex items-center gap-1 transition-colors" style="color:#8B5CFF" onmouseover="this.style.color='#EAEAF7'" onmouseout="this.style.color='#8B5CFF'"><span class="material-symbols-outlined text-sm">arrow_back</span> Back to dates</button></div>
        <div class="nr-card p-8">
            <h2 class="font-headline text-xl font-bold mb-2" style="color:#EAEAF7">Select Shift — ${UI.formatDate(_state.selectedDate.date)}</h2>
            <p class="text-sm mb-8" style="color:#A9A9C8">Choose a time block</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                ${enabledShifts.map((s, i) => `
                    <button onclick="BookingPage._selectShift(${i})" class="p-6 rounded-xl text-left btn-press transition-all" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.08)" onmouseover="this.style.borderColor='rgba(139,92,255,0.3)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.08)'">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="material-symbols-outlined" style="color:${s.type === 'Morning' ? '#fbbf24' : s.type === 'Afternoon' ? '#60a5fa' : '#8B5CFF'}">${s.type === 'Morning' ? 'light_mode' : s.type === 'Afternoon' ? 'wb_twilight' : 'dark_mode'}</span>
                            <span class="font-bold" style="color:#EAEAF7">${s.name || s.type}</span>
                        </div>
                        <p class="text-xs" style="color:#A9A9C8">${s.startTime} — ${s.endTime}</p>
                        <p class="text-xs mt-2" style="color:${s.availableSlots <= 2 ? '#fbbf24' : '#A9A9C8'}">${s.availableSlots} slots available</p>
                    </button>
                `).join('')}
            </div>
        </div>`;
    }

    async function _selectShift(idx) {
        const enabledShifts = _state.shifts.filter(s => s.isEnabled);
        _state.selectedShift = enabledShifts[idx];
        _state.selectedSlot = null;
        const container = document.getElementById('booking-content');
        container.innerHTML = UI.spinner();
        try {
            _state.slots = await API.Booking.getSlots(_state.selectedDate.date, _state.selectedShift.type);
            _renderStep3();
        } catch (err) {
            container.innerHTML = `<p class="text-center py-8" style="color:#f87171">${err.message}</p>`;
        }
    }

    function _renderStep3() {
        _updateProgress(3);
        const container = document.getElementById('booking-content');
        const slots = _state.slots;
        container.innerHTML = `
        <div class="mb-4"><button onclick="BookingPage._renderStep2()" class="text-sm font-bold flex items-center gap-1 transition-colors" style="color:#8B5CFF" onmouseover="this.style.color='#EAEAF7'" onmouseout="this.style.color='#8B5CFF'"><span class="material-symbols-outlined text-sm">arrow_back</span> Back to shifts</button></div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-8 nr-card p-8">
                <h2 class="font-headline text-xl font-bold mb-2" style="color:#EAEAF7">Select Time — ${_state.selectedShift.name || _state.selectedShift.type}</h2>
                <p class="text-sm mb-8" style="color:#A9A9C8">${UI.formatDate(_state.selectedDate.date)}</p>
                ${slots.length ? `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${slots.map((s, i) => {
                        const disabled = !s.isBookable;
                        const limited = s.status === 'Limited';
                        return `<button ${disabled ? 'disabled' : ''} onclick="BookingPage._selectSlot(${i})"
                            class="group flex flex-col items-start p-4 rounded-lg transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : ''}" style="${disabled ? 'background:rgba(3,5,16,0.5)' : 'background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)'}" ${!disabled ? `onmouseover="this.style.borderColor='rgba(139,92,255,0.3)'" onmouseout="this.style.borderColor='rgba(139,92,255,0.06)'"` : ''}>
                            <span class="text-lg font-headline font-bold" style="color:#EAEAF7">${s.startTime}</span>
                            <span class="text-[10px] font-label uppercase tracking-widest mt-1" style="color:${disabled ? '#f87171' : limited ? '#fbbf24' : '#A9A9C8'}">
                                ${disabled ? (s.status === 'Full' ? 'Full' : 'Blocked') : limited ? s.remaining + ' Left' : 'Available'}
                            </span>
                            ${!disabled && s.remaining ? `<span class="text-[9px] mt-1" style="color:#6B6B8D">${s.remaining}/${s.capacity} seats</span>` : ''}
                        </button>`;
                    }).join('')}
                </div>` : UI.emptyState('schedule', 'No slots', 'No time slots available for this shift.', '', '')}
            </div>
            <aside class="lg:col-span-4">
                <div class="nr-card p-6">
                    <h3 class="font-headline text-lg font-bold mb-6" style="color:#EAEAF7">Booking Summary</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-xl" style="color:#8B5CFF">calendar_month</span><span class="text-sm font-label" style="color:#A9A9C8">Date</span></div>
                            <span class="text-sm font-bold font-headline" style="color:#EAEAF7">${UI.formatDate(_state.selectedDate.date)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-xl" style="color:#8B5CFF">schedule</span><span class="text-sm font-label" style="color:#A9A9C8">Shift</span></div>
                            <span class="text-sm font-bold font-headline" style="color:#EAEAF7">${_state.selectedShift.name || _state.selectedShift.type}</span>
                        </div>
                        <div id="summary-time" class="flex justify-between items-center opacity-30">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-xl" style="color:#8B5CFF">access_time</span><span class="text-sm font-label" style="color:#A9A9C8">Time</span></div>
                            <span class="text-sm font-bold font-headline" style="color:#EAEAF7">—</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>`;
    }

    function _selectSlot(idx) {
        _state.selectedSlot = _state.slots[idx];
        _renderStep4();
    }

    function _renderStep4() {
        _updateProgress(4);
        const container = document.getElementById('booking-content');
        const d = _state.selectedDate;
        const sh = _state.selectedShift;
        const sl = _state.selectedSlot;

        if (!Auth.isAuthenticated()) {
            container.innerHTML = `
            <div class="max-w-lg mx-auto text-center py-16">
                <span class="material-symbols-outlined text-6xl mb-6" style="color:#8B5CFF">lock</span>
                <h2 class="font-headline text-2xl font-bold mb-4" style="color:#EAEAF7">Sign In Required</h2>
                <p class="mb-8" style="color:#A9A9C8">You need to be signed in to confirm your booking.</p>
                <a href="#/login" class="cta-glow px-8 py-4 rounded-xl font-bold btn-press inline-block">Sign In</a>
            </div>`;
            return;
        }

        container.innerHTML = `
        <div class="mb-4"><button onclick="BookingPage._renderStep3()" class="text-sm font-bold flex items-center gap-1 transition-colors" style="color:#8B5CFF" onmouseover="this.style.color='#EAEAF7'" onmouseout="this.style.color='#8B5CFF'"><span class="material-symbols-outlined text-sm">arrow_back</span> Back to slots</button></div>
        <div class="max-w-2xl mx-auto">
            <div class="nr-card p-8">
                <h2 class="font-headline text-2xl font-bold mb-8" style="color:#EAEAF7">Confirm Your Booking</h2>
                <div class="space-y-6 mb-8">
                    <div class="flex justify-between items-center py-3" style="border-bottom:1px solid rgba(139,92,255,0.06)">
                        <span style="color:#A9A9C8">Date</span><span class="font-bold" style="color:#EAEAF7">${UI.formatDate(d.date)}</span>
                    </div>
                    <div class="flex justify-between items-center py-3" style="border-bottom:1px solid rgba(139,92,255,0.06)">
                        <span style="color:#A9A9C8">Shift</span><span class="font-bold" style="color:#EAEAF7">${sh.name || sh.type}</span>
                    </div>
                    <div class="flex justify-between items-center py-3" style="border-bottom:1px solid rgba(139,92,255,0.06)">
                        <span style="color:#A9A9C8">Time</span><span class="font-bold" style="color:#EAEAF7">${sl.startTime} — ${sl.endTime}</span>
                    </div>
                    ${sl.stationName ? `<div class="flex justify-between items-center py-3" style="border-bottom:1px solid rgba(139,92,255,0.06)"><span style="color:#A9A9C8">Station</span><span class="font-bold" style="color:#EAEAF7">${sl.stationName}</span></div>` : ''}
                    <div class="flex justify-between items-center py-3">
                        <span style="color:#A9A9C8">Remaining Capacity</span>
                        <span class="font-bold" style="color:${sl.remaining <= 2 ? '#fbbf24' : '#EAEAF7'}">${sl.remaining} / ${sl.capacity}</span>
                    </div>
                </div>
                <div class="mb-8">
                    <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:#6B6B8D">Notes (optional)</label>
                    <textarea id="booking-notes" rows="3" class="nr-input" placeholder="Any special requirements..."></textarea>
                </div>
                <div id="booking-error" class="hidden rounded-lg p-4 text-sm mb-4" style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.15);color:#f87171"></div>
                <button id="confirm-booking-btn" onclick="BookingPage._confirmBooking()" class="cta-glow w-full py-4 rounded-xl font-headline font-extrabold tracking-tight btn-press flex items-center justify-center gap-2">
                    <span id="confirm-text">Confirm Appointment</span>
                    <span id="confirm-spinner" class="hidden w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </button>
            </div>
        </div>`;
    }

    async function _confirmBooking() {
        if (_state.loading) return;
        _state.loading = true;
        const btn = document.getElementById('confirm-booking-btn');
        const text = document.getElementById('confirm-text');
        const spinner = document.getElementById('confirm-spinner');
        btn.disabled = true; text.style.opacity = '0.5'; spinner.classList.remove('hidden');
        document.getElementById('booking-error')?.classList.add('hidden');

        try {
            const notes = document.getElementById('booking-notes')?.value || null;
            const result = await API.Booking.createAppointment(_state.selectedSlot.id, _state.selectedDate.date, notes);
            const container = document.getElementById('booking-content');
            container.innerHTML = `
            <div class="max-w-lg mx-auto text-center py-16">
                <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style="background:rgba(52,211,153,0.08)">
                    <span class="material-symbols-outlined text-5xl" style="color:#34d399">check_circle</span>
                </div>
                <h2 class="font-headline text-3xl font-bold mb-4" style="color:#EAEAF7">Booking Confirmed!</h2>
                <p class="mb-2" style="color:#A9A9C8">Your appointment has been scheduled.</p>
                <p class="text-sm font-mono mb-8" style="color:#8B5CFF">Booking Code: ${result.bookingCode}</p>
                <div class="nr-card p-6 mb-8 text-left max-w-sm mx-auto space-y-3">
                    <div class="flex justify-between"><span class="text-sm" style="color:#A9A9C8">Date</span><span class="font-bold text-sm" style="color:#EAEAF7">${UI.formatDate(result.date)}</span></div>
                    <div class="flex justify-between"><span class="text-sm" style="color:#A9A9C8">Time</span><span class="font-bold text-sm" style="color:#EAEAF7">${result.startTime} — ${result.endTime}</span></div>
                    <div class="flex justify-between"><span class="text-sm" style="color:#A9A9C8">Status</span>${UI.statusBadge(result.status)}</div>
                </div>
                <div class="flex gap-4 justify-center">
                    <a href="#/appointments" class="cta-glow px-8 py-3 rounded-xl font-bold btn-press">View My Appointments</a>
                    <a href="#/booking" class="nr-btn nr-btn-surface px-8 py-3">Book Another</a>
                </div>
            </div>`;
            _updateProgress(4, true);
            UI.toast('Appointment booked successfully!', 'success');
        } catch (err) {
            const errEl = document.getElementById('booking-error');
            if (errEl) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
            UI.toast(err.message, 'error');
        } finally {
            _state.loading = false;
            if (btn) { btn.disabled = false; text.style.opacity = '1'; spinner.classList.add('hidden'); }
        }
    }

    function _updateProgress(step, complete = false) {
        _state.step = step;
        const labels = ['', 'Step 1 of 4: Select Date', 'Step 2 of 4: Select Shift', 'Step 3 of 4: Select Time', 'Step 4 of 4: Review & Confirm'];
        const el = document.getElementById('step-label');
        if (el) el.textContent = complete ? 'Booking Complete!' : labels[step];
        for (let i = 1; i <= 4; i++) {
            const bar = document.getElementById(`prog-${i}`);
            if (bar) bar.style.width = i < step ? '100%' : i === step ? (complete ? '100%' : '50%') : '0%';
        }
    }

    function _backToStep1() { _renderStep1(); }
    function _retry() { _loadDates(); }

    return { render, init, _selectDate, _selectShift, _selectSlot, _confirmBooking, _renderStep2, _renderStep3, _backToStep1, _retry };
})();
