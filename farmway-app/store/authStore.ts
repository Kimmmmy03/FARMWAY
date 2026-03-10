import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';
import '../i18n';
import i18n from 'i18next';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'FARMER' | 'BUYER' | 'ADMIN';
    is_verified_seller: boolean;
    preferred_lang: string;
    avatar_s3_key?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isHydrated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
    setLanguage: (lang: string) => void;
}

interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role: 'FARMER' | 'BUYER';
    phone?: string;
    preferred_lang?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isLoading: false,
    isHydrated: false,

    hydrate: async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const userRaw = await SecureStore.getItemAsync('user');
            if (token && userRaw) {
                const user = JSON.parse(userRaw);
                set({ user, accessToken: token });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                i18n.changeLanguage(user.preferred_lang || 'en');
            }
        } catch (e) {
            console.warn('Hydration error:', e);
        } finally {
            set({ isHydrated: true });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const { user, accessToken, refreshToken } = data.data;
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            i18n.changeLanguage(user.preferred_lang || 'en');
            set({ user, accessToken });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/register', data);
            const { user, accessToken, refreshToken } = res.data.data;
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            set({ user, accessToken });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null });
    },

    setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        const user = get().user;
        if (user) {
            const updated = { ...user, preferred_lang: lang };
            set({ user: updated });
            SecureStore.setItemAsync('user', JSON.stringify(updated));
            api.patch('/auth/me', { preferred_lang: lang }).catch(() => { });
        }
    },
}));
