import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let accessTokenRef = { current: null };
let onRefreshFail = () => {};

export const setAccessTokenRef = (getter) => { accessTokenRef = getter; };
export const setOnRefreshFail = (fn) => { onRefreshFail = fn; };

API.interceptors.request.use((config) => {
    const token = accessTokenRef.current;
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise = null;

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;
            try {
                if (!refreshPromise) {
                    refreshPromise = axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                }
                const res = await refreshPromise;
                refreshPromise = null;
                const newToken = res.data.accessToken;
                accessTokenRef.current = newToken;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                window.dispatchEvent(new CustomEvent('access-token-refreshed', { detail: newToken }));
                return API(originalRequest);
            } catch (refreshErr) {
                refreshPromise = null;
                onRefreshFail();
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(err);
    }
);

export default API;