import axios from 'axios';

// Single source of truth for API base URL.
//
// How it works:
// 1) If VITE_API_URL is set -> use it (best for stable environments).
// 2) Otherwise auto-detect based on where the frontend is opened:
//    - If you open the web app on the backend PC: use http://localhost:5000/api
//    - If you open the web app from another device via LAN IP:
//      use http://<same-host>:5000/api  (example: http://192.168.137.1:5000/api)
//
// This avoids "Network Error" when Wi‑Fi IP changes between networks.
const envApiUrl = import.meta.env.VITE_API_URL;

const stripQuotes = (s) => (s ?? '').toString().replace(/^['"]|['"]$/g, '');

const computeBaseUrl = () => {
    const fromEnv = stripQuotes(envApiUrl).trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');

    // Vite runs in the browser, so window.location is available.
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://10.161.82.64:5000/api';
    }
    return `http://${host}:5000/api`;
};

const normalizedBaseUrl = computeBaseUrl();

const api = axios.create({
    baseURL: normalizedBaseUrl,
    timeout: 25000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Helpful runtime logging (does not change UI).
        if (import.meta.env.DEV) {
            console.debug('[API]', (config.method || 'GET').toUpperCase(), `${config.baseURL}${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response error logging for debugging "Network Error"
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (import.meta.env.DEV) {
            console.error('[API ERROR]', {
                message: err?.message,
                code: err?.code,
                url: err?.config?.url,
                baseURL: err?.config?.baseURL,
                status: err?.response?.status,
                data: err?.response?.data,
            });
        }
        return Promise.reject(err);
    }
);

export default api;

export const getApiErrorMessage = (err, fallback = 'Request failed') => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.data?.error) return err.response.data.error;
    if (err?.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your Wi‑Fi connection and confirm the backend is reachable.';
    }
    if (err?.code === 'ERR_NETWORK' || err?.request) {
        // Typical causes:
        // 1) wrong IP / still pointing at localhost
        // 2) Windows Firewall blocking port 5000
        // 3) phone/PC not on same Wi‑Fi
        return `Network error: cannot reach API at ${normalizedBaseUrl}. Check Wi‑Fi, firewall, and API URL.`;
    }
    return fallback;
};
