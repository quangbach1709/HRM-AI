import { SystemConfig, SystemConfigFormData, SearchSystemConfigDto } from '@/types/system-config';
import { PageResponse } from '@/types/pagination';

const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000'}/api/v1/hr`;

const getAuthToken = (): string | null => {
    return localStorage.getItem('hrm_token');
};

const getHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
        throw new Error(error.error || error.message || 'Có lỗi xảy ra');
    }
    return response.json();
};

export const systemConfigApi = {
    search: async (params: SearchSystemConfigDto): Promise<PageResponse<SystemConfig>> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<SystemConfig>>(response);
    },

    getAll: async (): Promise<SystemConfig[]> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/all`, {
            headers: getHeaders(),
        });
        return handleResponse<SystemConfig[]>(response);
    },

    getById: async (id: string): Promise<SystemConfig> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<SystemConfig>(response);
    },

    getByKey: async (configKey: string): Promise<SystemConfig> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/key/${configKey}`, {
            headers: getHeaders(),
        });
        return handleResponse<SystemConfig>(response);
    },

    create: async (data: SystemConfigFormData): Promise<SystemConfig> => {
        const response = await fetch(`${API_BASE_URL}/system-configs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<SystemConfig>(response);
    },

    update: async (id: string, data: SystemConfigFormData): Promise<SystemConfig> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<SystemConfig>(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/system-configs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
            throw new Error(error.error || error.message || 'Có lỗi xảy ra');
        }
    },
};
