import axios from 'axios';

// Single source of truth for API base URL.
const envApiUrl = import.meta.env.VITE_API_URL;

const stripQuotes = (s) => (s ?? '').toString().replace(/^['"]|['"]$/g, '');

const normalizedBaseUrl = stripQuotes(envApiUrl).trim().replace(/\/$/, '');

const api = axios.create({
    baseURL: normalizedBaseUrl,
    timeout: 25000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach JWT token and print debug logs
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log(`[API REQUEST] Method: ${(config.method || 'GET').toUpperCase()} - URL: ${fullUrl}`);
        console.log(`[API REQUEST PAYLOAD]`, config.data || 'No payload');
        return config;
    },
    (error) => {
        console.error(`[API REQUEST ERROR]`, error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to print response status and body logs
api.interceptors.response.use(
    (res) => {
        const fullUrl = `${res.config?.baseURL || ''}${res.config?.url || ''}`;
        console.log(`[API RESPONSE SUCCESS] STATUS: ${res.status} - URL: ${fullUrl}`);
        console.log(`[API RESPONSE BODY]`, res.data);
        return res;
    },
    (err) => {
        const fullUrl = `${err.config?.baseURL || ''}${err.config?.url || ''}`;
        console.error(`[API RESPONSE ERROR] STATUS: ${err.response?.status || 'network/timeout'} - URL: ${fullUrl}`);
        console.error(`[API RESPONSE ERROR BODY]`, err.response?.data || err.message);
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
        // Typical causes: connection timed out, firewall block, or unreachable server host
        return `Network error: cannot reach API at ${normalizedBaseUrl}. Please check your connection and confirm the backend is reachable.`;
    }
    return fallback;
};
