import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,        // 15s timeout — rural connectivity
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────
api.interceptors.request.use((config) => {
    // Attach Accept-Language for server-side i18n
    const lang = config.headers['Accept-Language'] || 'en';
    config.headers['Accept-Language'] = lang;
    return config;
});

// ─── Response Interceptor (Token Refresh) ────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) =>
                    failedQueue.push({ resolve, reject })
                ).then((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                const { data } = await api.post('/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: newRefresh } = data.data;
                await SecureStore.setItemAsync('accessToken', accessToken);
                await SecureStore.setItemAsync('refreshToken', newRefresh);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Force logout handled by auth store listener
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
