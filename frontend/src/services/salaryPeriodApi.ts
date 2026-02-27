import { SalaryPeriod, SalaryPeriodFormData, SearchSalaryPeriodDto } from '@/types/salaryPeriod';
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

export const salaryPeriodApi = {
    // Search & Pagination
    search: async (params: SearchSalaryPeriodDto): Promise<PageResponse<SalaryPeriod>> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<SalaryPeriod>>(response);
    },

    getAllList: async (): Promise<SalaryPeriod[]> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/all`, {
            headers: getHeaders(),
        });
        return handleResponse<SalaryPeriod[]>(response);
    },

    // CRUD
    getById: async (id: string): Promise<SalaryPeriod> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<SalaryPeriod>(response);
    },

    create: async (data: SalaryPeriodFormData): Promise<SalaryPeriod> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<SalaryPeriod>(response);
    },

    update: async (id: string, data: SalaryPeriodFormData): Promise<SalaryPeriod> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<SalaryPeriod>(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
            throw new Error(error.error || error.message || 'Có lỗi xảy ra');
        }
    },

    // Export
    export: async (params: SearchSalaryPeriodDto): Promise<SalaryPeriod[]> => {
        const response = await fetch(`${API_BASE_URL}/salary-periods/export`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<SalaryPeriod[]>(response);
    },
};
