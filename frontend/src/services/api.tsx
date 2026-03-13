
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// ── Gateway is now the single entry point ────────────────────────────────────
// All HR-service paths are reachable under /api/v1/hr/
// The Gateway strips the /api/v1/hr prefix before forwarding to the backend,
// so the backend continues to serve its existing /api/** endpoints unchanged.
const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000';
const API_BASE_URL = `${GATEWAY_BASE_URL}/api/v1/hr`;
// Legacy direct-to-backend (keep for reference / local override):
// const API_BASE_URL = 'http://localhost:8080/api';


const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hrm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (optional: redirect to login or clear token)
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const api = axiosInstance;

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: string;
    staffId: string;
    username: string;
    email: string;
    roles: string[];
}

// Keep existing authApi for backward compatibility if needed, 
// or refactor it to use the new axios instance.
// Refactoring to use axios instance for consistency:
export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getCurrentUser: async (token: string): Promise<AuthResponse> => {
        // We can manually set header here if strictly needed, 
        // but the interceptor handles it if token is in localStorage.
        // If getting user by passed token is required (e.g. initAuth), allow override.
        const response = await api.get<AuthResponse>('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};