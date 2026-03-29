// ─── Schedule Configuration ─────────────────────────────────────────────────
// Consumes: AdminScheduleAPI.getOverview, createDay, updateDay, generateSlots, updateSettings
//
// Backend DTO shapes (camelCase from ASP.NET Core):
//   ScheduleOverviewDto: { settings: AppSettingsDto, days: ScheduleDayDto[], stations: ServiceStationDto[] }
//   AppSettingsDto: { id, defaultAppointmentDurationMinutes, bufferTimeMinutes, defaultStationCapacity, allowDynamicScaling }
//   UpdateSettingsRequest: { defaultAppointmentDurationMinutes?, bufferTimeMinutes?, defaultStationCapacity?, allowDynamicScaling? }
//   ScheduleDayDto: { id, date, dayOfWeek, isEnabled, morningShiftEnabled, afternoonShiftEnabled, eveningShiftEnabled, totalSlots, bookedSlots }
//   CreateScheduleDayRequest: { date, isEnabled, morningShiftEnabled, afternoonShiftEnabled, eveningShiftEnabled }
//   GenerateSlotsRequest: { startDate, endDate, durationMinutes?, capacityPerSlot? }

const ScheduleConfigPage = (() => {
    let _data = null;

    function render() {
        return `
        ${UI.topNav('admin/schedule')}
        ${UI.adminSidebar('schedule')}
        <main class="lg:ml-64 pt-24 px-6 pb-12 min-h-screen page-shell">
            <div class="max-w-6xl mx-auto relative z-10">
                <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span class="text-sm font-semibold tracking-widest uppercase" style="color:#b8a4ff">Configuration</span>
                        <h1 class="text-4xl md:text-5xl font-black font-headline tracking-tight mt-2" style="color:#EAEAF7">Schedule Engine</h1>
                        <p class="mt-2 max-w-lg" style="color:#A9A9C8">Orchestrate your operational rhythm with granular control over availability, capacity, and session flows.</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="ScheduleConfigPage._generateSlots()" class="nr-btn nr-btn-surface px-6 py-3 text-sm">Generate Slots</button>
                        <button onclick="ScheduleConfigPage._saveSettings()" id="save-settings-btn" class="cta-glow px-8 py-3 rounded-xl font-semibold btn-press text-sm">Deploy Schedule</button>
                    </div>
                </header>
                <div id="schedule-content">${UI.spinner()}</div>
            </div>
        </main>`;
    }

    async function init() {
        try {
            _data = await API.AdminSchedule.getOverview();
            _renderContent();
        } catch (err) {
            document.getElementById('schedule-content').innerHTML = `<p class="text-center py-8" style="color:#f87171">${err.message}</p>`;
        }
    }

    function _renderContent() {
        const settings = _data.settings || {};
        const days = _data.days || [];
        const stations = _data.stations || [];
        const container = document.getElementById('schedule-content');

        container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- General Settings -->
            <div class="md:col-span-7 nr-card p-8">
                <div class="flex items-center gap-3 mb-8">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(91,46,255,0.1);color:#8B5CFF"><span class="material-symbols-outlined">settings_suggest</span></div>
                    <h3 class="text-xl font-bold font-headline" style="color:#EAEAF7">General Flow</h3>
                </div>
                <div class="space-y-8">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <label class="font-semibold" style="color:#EAEAF7">Appointment Duration</label>
                            <span class="nr-tag nr-tag-purple">Standardized</span>
                        </div>
                        <select id="setting-duration" class="nr-input">
                            <option value="30" ${settings.defaultAppointmentDurationMinutes === 30 ? 'selected' : ''}>30 Minutes</option>
                            <option value="45" ${settings.defaultAppointmentDurationMinutes === 45 ? 'selected' : ''}>45 Minutes</option>
                            <option value="60" ${settings.defaultAppointmentDurationMinutes === 60 ? 'selected' : ''}>60 Minutes</option>
                            <option value="90" ${settings.defaultAppointmentDurationMinutes === 90 ? 'selected' : ''}>90 Minutes</option>
                        </select>
                        <p class="text-sm" style="color:#A9A9C8">Sets the base unit for all newly scheduled bookings.</p>
                    </div>
                    <div class="space-y-3">
                        <label class="font-semibold" style="color:#EAEAF7">Buffer Time (minutes)</label>
                        <input id="setting-buffer" type="number" min="0" max="60" value="${settings.bufferTimeMinutes || 0}" class="nr-input">
                        <p class="text-sm italic" style="color:#A9A9C8">Cool-down period between consecutive appointments.</p>
                    </div>
                </div>
            </div>
            <!-- Capacity -->
            <div class="md:col-span-5 nr-card p-8">
                <div class="flex items-center gap-3 mb-8">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(184,164,255,0.1);color:#b8a4ff"><span class="material-symbols-outlined">analytics</span></div>
                    <h3 class="text-xl font-bold font-headline" style="color:#EAEAF7">Capacity & Scaling</h3>
                </div>
                <div class="space-y-8">
                    <div class="space-y-3">
                        <label class="font-semibold" style="color:#EAEAF7">Default Station Capacity</label>
                        <input id="setting-capacity" type="number" min="1" max="100" value="${settings.defaultStationCapacity || 1}" class="nr-input text-xl font-bold" style="color:#8B5CFF">
                        <p class="text-sm" style="color:#A9A9C8">Concurrent appointments per station.</p>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label class="font-semibold" style="color:#EAEAF7">Allow Dynamic Scaling</label>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input id="setting-dynamic" type="checkbox" ${settings.allowDynamicScaling ? 'checked' : ''} class="sr-only peer">
                                <div class="w-11 h-6 rounded-full peer transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style="background:rgba(139,92,255,0.15);--tw-peer-checked-bg:#8B5CFF"></div>
                            </label>
                        </div>
                        <p class="text-sm" style="color:#A9A9C8">Automatically adjust capacity based on demand.</p>
                    </div>
                </div>
            </div>
            <!-- Service Stations -->
            ${stations.length ? `
            <div class="md:col-span-12 nr-card p-8">
                <h3 class="text-xl font-bold font-headline mb-6" style="color:#EAEAF7">Service Stations</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${stations.map(s => `
                    <div class="p-4 rounded-lg flex items-center justify-between" style="background:rgba(11,16,32,0.5);border:1px solid rgba(139,92,255,0.06)">
                        <div>
                            <p class="font-bold text-sm" style="color:#EAEAF7">${s.name}</p>
                            ${s.description ? `<p class="text-xs" style="color:#A9A9C8">${s.description}</p>` : ''}
                        </div>
                        <span class="w-3 h-3 rounded-full" style="background:${s.isActive ? '#34d399' : '#f87171'}"></span>
                    </div>`).join('')}
                </div>
            </div>` : ''}
            <!-- Schedule Days -->
            <div class="md:col-span-12 nr-card p-8">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(139,92,255,0.08)"><span class="material-symbols-outlined" style="color:#8B5CFF">calendar_month</span></div>
                        <h3 class="text-xl font-bold font-headline" style="color:#EAEAF7">Schedule Days</h3>
                    </div>
                    <button onclick="ScheduleConfigPage._addDay()" class="nr-btn nr-btn-surface px-4 py-2 text-sm">+ Add Day</button>
                </div>
                ${days.length ? `
                <div class="overflow-x-auto no-scrollbar">
                    <table class="nr-table">
                        <thead><tr>
                            <th>Date</th><th>Day</th><th>Enabled</th><th>Morning</th><th>Afternoon</th><th>Evening</th><th>Slots</th><th>Booked</th>
                        </tr></thead>
                        <tbody>
                            ${days.slice(0, 30).map(d => `
                            <tr>
                                <td class="font-medium" style="color:#EAEAF7">${UI.formatDate(d.date)}</td>
                                <td>${d.dayOfWeek || UI.dayOfWeekShort(d.date)}</td>
                                <td><span class="w-3 h-3 rounded-full inline-block" style="background:${d.isEnabled ? '#34d399' : '#f87171'}"></span></td>
                                <td><span class="w-3 h-3 rounded-full inline-block" style="background:${d.morningShiftEnabled ? '#fbbf24' : 'rgba(139,92,255,0.1)'}"></span></td>
                                <td><span class="w-3 h-3 rounded-full inline-block" style="background:${d.afternoonShiftEnabled ? '#60a5fa' : 'rgba(139,92,255,0.1)'}"></span></td>
                                <td><span class="w-3 h-3 rounded-full inline-block" style="background:${d.eveningShiftEnabled ? '#8B5CFF' : 'rgba(139,92,255,0.1)'}"></span></td>
                                <td>${d.totalSlots || 0}</td>
                                <td>${d.bookedSlots || 0}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : `<p class="text-center py-8" style="color:#A9A9C8">No schedule days configured yet. Click "Generate Slots" to create them.</p>`}
            </div>
        </div>`;
    }

    async function _saveSettings() {
        const btn = document.getElementById('save-settings-btn');
        btn.disabled = true; btn.textContent = 'Saving...';
        try {
            await API.AdminSchedule.updateSettings({
                defaultAppointmentDurationMinutes: parseInt(document.getElementById('setting-duration').value),
                bufferTimeMinutes: parseInt(document.getElementById('setting-buffer').value),
                defaultStationCapacity: parseInt(document.getElementById('setting-capacity').value),
                allowDynamicScaling: document.getElementById('setting-dynamic')?.checked || false
            });
            UI.toast('Settings deployed successfully!', 'success');
        } catch (err) {
            UI.toast(err.message, 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Deploy Schedule';
        }
    }

    async function _generateSlots() {
        const today = new Date().toISOString().split('T')[0];
        const end = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        const ok = await UI.confirm('Generate Slots', `Generate time slots from ${today} to ${end} using current settings?`, 'Generate');
        if (!ok) return;
        try {
            const result = await API.AdminSchedule.generateSlots(today, end);
            UI.toast(result.message || `Generated ${result.count} slots!`, 'success');
            _data = await API.AdminSchedule.getOverview();
            _renderContent();
        } catch (err) {
            UI.toast(err.message, 'error');
        }
    }

    async function _addDay() {
        const date = prompt('Enter date (YYYY-MM-DD):');
        if (!date) return;
        try {
            await API.AdminSchedule.createDay(date, true, true, true, false);
            UI.toast('Day added!', 'success');
            _data = await API.AdminSchedule.getOverview();
            _renderContent();
        } catch (err) { UI.toast(err.message, 'error'); }
    }

    return { render, init, _saveSettings, _generateSlots, _addDay };
})();
