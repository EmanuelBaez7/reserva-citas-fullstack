// ─── Obsidian Architect — API Service Layer ────────────────────────────────
// Source of truth: ASP.NET Core backend controllers & DTOs
// Base URL configurable for different environments

const API_BASE = 'http://localhost:5252';

// ─── Core Fetch Wrapper ─────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    const token = localStorage.getItem('obsidian_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('obsidian_token');
            localStorage.removeItem('obsidian_user');
            window.dispatchEvent(new CustomEvent('auth:expired'));
            throw { status: 401, code: 'UNAUTHORIZED', message: 'Session expired. Please log in again.' };
        }

        if (response.status === 403) {
            throw { status: 403, code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' };
        }

        if (response.status === 404) {
            throw { status: 404, code: 'NOT_FOUND', message: 'The requested resource was not found.' };
        }

        if (!response.ok) {
            let errorBody;
            try { errorBody = await response.json(); } catch { errorBody = null; }
            throw {
                status: response.status,
                code: errorBody?.code || 'API_ERROR',
                message: errorBody?.message || errorBody?.title || `Request failed (${response.status})`,
                details: errorBody?.details || errorBody?.errors || null
            };
        }

        // 204 No Content
        if (response.status === 204) return null;

        return await response.json();
    } catch (err) {
        if (err.status) throw err; // Already formatted
        // Network error
        throw { status: 0, code: 'NETWORK_ERROR', message: 'Unable to connect to the server. Please check your connection.' };
    }
}

// ─── Auth Endpoints ─────────────────────────────────────────────────────────
// Controller: AuthController — Route: api/Auth

const AuthAPI = {
    /** POST /api/Auth/register → AuthResponse { token, user } */
    register(email, password, fullName) {
        return apiFetch('/api/Auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName })
        });
    },

    /** POST /api/Auth/login → AuthResponse { token, user } */
    login(email, password) {
        return apiFetch('/api/Auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    /** GET /api/Auth/me → UserProfileDto */
    me() {
        return apiFetch('/api/Auth/me');
    }
};

// ─── Booking Endpoints ──────────────────────────────────────────────────────
// Controller: BookingController — Route: api/Booking

const BookingAPI = {
    /** GET /api/Booking/dates?daysAhead → BookingDateDto[] */
    getDates(daysAhead = 30) {
        return apiFetch(`/api/Booking/dates?daysAhead=${daysAhead}`);
    },

    /** GET /api/Booking/dates/{date}/shifts → ShiftDto[] */
    getShifts(date) {
        return apiFetch(`/api/Booking/dates/${date}/shifts`);
    },

    /** GET /api/Booking/slots?date&shift → TimeSlotDto[] */
    getSlots(date, shift) {
        return apiFetch(`/api/Booking/slots?date=${date}&shift=${shift}`);
    },

    /** POST /api/Booking/appointments → AppointmentDto */
    createAppointment(timeSlotId, date, notes = null) {
        return apiFetch('/api/Booking/appointments', {
            method: 'POST',
            body: JSON.stringify({ timeSlotId, date, notes })
        });
    },

    /** POST /api/Booking/appointments/{id}/cancel → AppointmentDto */
    cancelAppointment(id, reason = null) {
        return apiFetch(`/api/Booking/appointments/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }
};

// ─── Appointments Endpoints ─────────────────────────────────────────────────
// Controller: AppointmentsController — Route: api/Appointments

const AppointmentsAPI = {
    /** GET /api/Appointments/my?filter → AppointmentDto[] */
    getMyAppointments(filter = null) {
        const q = filter ? `?filter=${encodeURIComponent(filter)}` : '';
        return apiFetch(`/api/Appointments/my${q}`);
    },

    /** GET /api/Appointments/my/{id} → AppointmentDetailDto */
    getAppointmentDetail(id) {
        return apiFetch(`/api/Appointments/my/${id}`);
    }
};

// ─── Admin Dashboard Endpoints ──────────────────────────────────────────────
// Controller: AdminDashboardController — Route: api/admin/dashboard

const AdminDashboardAPI = {
    /** GET /api/admin/dashboard/overview → DashboardOverviewDto */
    getOverview() {
        return apiFetch('/api/admin/dashboard/overview');
    },

    /** GET /api/admin/dashboard/activity → DashboardActivityDto */
    getActivity() {
        return apiFetch('/api/admin/dashboard/activity');
    },

    /** GET /api/admin/dashboard/analytics → DashboardAnalyticsDto */
    getAnalytics() {
        return apiFetch('/api/admin/dashboard/analytics');
    }
};

// ─── Admin Schedule Endpoints ───────────────────────────────────────────────
// Controller: AdminScheduleController — Route: api/admin/schedule

const AdminScheduleAPI = {
    /** GET /api/admin/schedule → ScheduleOverviewDto */
    getOverview() {
        return apiFetch('/api/admin/schedule');
    },

    /** POST /api/admin/schedule/days → ScheduleDayDto */
    createDay(date, isEnabled, morningShiftEnabled, afternoonShiftEnabled, eveningShiftEnabled) {
        return apiFetch('/api/admin/schedule/days', {
            method: 'POST',
            body: JSON.stringify({ date, isEnabled, morningShiftEnabled, afternoonShiftEnabled, eveningShiftEnabled })
        });
    },

    /** PATCH /api/admin/schedule/days/{id} → ScheduleDayDto */
    updateDay(id, updates) {
        return apiFetch(`/api/admin/schedule/days/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    },

    /** POST /api/admin/schedule/slots/generate → { message, count } */
    generateSlots(startDate, endDate, durationMinutes = null, capacityPerSlot = null) {
        return apiFetch('/api/admin/schedule/slots/generate', {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate, durationMinutes, capacityPerSlot })
        });
    },

    /** PATCH /api/admin/schedule/slots/{id} → TimeSlotDto */
    updateSlot(id, updates) {
        return apiFetch(`/api/admin/schedule/slots/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    },

    /** PATCH /api/admin/schedule/settings → AppSettingsDto */
    updateSettings(updates) {
        return apiFetch('/api/admin/schedule/settings', {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }
};

// ─── Admin Logs Endpoints ───────────────────────────────────────────────────
// Controller: AdminLogsController — Route: api/admin/logs

const AdminLogsAPI = {
    /** GET /api/admin/logs?page&pageSize&from&to&action&profileId&search → PagedResult<AuditLogDto> */
    getLogs({ page = 1, pageSize = 20, from, to, action, profileId, search } = {}) {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('pageSize', pageSize);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (action !== undefined && action !== null && action !== '') params.set('action', action);
        if (profileId) params.set('profileId', profileId);
        if (search) params.set('search', search);
        return apiFetch(`/api/admin/logs?${params.toString()}`);
    },

    /** GET /api/admin/logs/{id} → AuditLogDetailDto */
    getLogDetail(id) {
        return apiFetch(`/api/admin/logs/${id}`);
    }
};

// ─── Export ─────────────────────────────────────────────────────────────────

window.API = {
    Auth: AuthAPI,
    Booking: BookingAPI,
    Appointments: AppointmentsAPI,
    AdminDashboard: AdminDashboardAPI,
    AdminSchedule: AdminScheduleAPI,
    AdminLogs: AdminLogsAPI
};
