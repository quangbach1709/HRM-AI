import { Staff, StaffFormData, SearchStaffDto } from '@/types/staff';
import { PageResponse } from '@/types/pagination';

const API_BASE_URL = 'http://localhost:8080/api';

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

export const staffApi = {
    search: async (params: SearchStaffDto): Promise<PageResponse<Staff>> => {
        const response = await fetch(`${API_BASE_URL}/staff/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<Staff>>(response);
    },

    getAll: async (): Promise<Staff[]> => {
        const response = await fetch(`${API_BASE_URL}/staff/all`, {
            headers: getHeaders(),
        });
        return handleResponse<Staff[]>(response);
    },

    getCurrent: async (): Promise<Staff> => {
        const response = await fetch(`${API_BASE_URL}/staff/current`, {
            headers: getHeaders(),
        });
        return handleResponse<Staff>(response);
    },

    getById: async (id: string): Promise<Staff> => {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<Staff>(response);
    },

    create: async (data: StaffFormData): Promise<Staff> => {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Staff>(response);
    },

    update: async (id: string, data: StaffFormData): Promise<Staff> => {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Staff>(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
            throw new Error(error.error || error.message || 'Có lỗi xảy ra');
        }
    },

    export: async (params: SearchStaffDto): Promise<Staff[]> => {
        const response = await fetch(`${API_BASE_URL}/staff/export`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<Staff[]>(response);
    },
};
