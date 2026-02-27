import { SalaryTemplateItem, SalaryTemplateItemFormData, SearchSalaryTemplateItemDto } from '@/types/salaryTemplateItem';
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

export const salaryTemplateItemApi = {
    // Search & Pagination
    search: async (params: SearchSalaryTemplateItemDto): Promise<PageResponse<SalaryTemplateItem>> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<SalaryTemplateItem>>(response);
    },

    getAllList: async (): Promise<SalaryTemplateItem[]> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/all`, {
            headers: getHeaders(),
        });
        return handleResponse<SalaryTemplateItem[]>(response);
    },

    getByTemplateId: async (templateId: string): Promise<SalaryTemplateItem[]> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/by-template/${templateId}`, {
            headers: getHeaders(),
        });
        return handleResponse<SalaryTemplateItem[]>(response);
    },

    // CRUD
    getById: async (id: string): Promise<SalaryTemplateItem> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<SalaryTemplateItem>(response);
    },

    create: async (data: SalaryTemplateItemFormData): Promise<SalaryTemplateItem> => {
        // Need to map salaryTemplateId to salaryTemplate object structure for backend? 
        // Backend DTO expects `salaryTemplate: { id: ... }` usually or `salaryTemplateId`.
        // Let's check SalaryTemplateItemDto. It has `private SalaryTemplateDto salaryTemplate;`.
        // So we need to send structure: { ..., salaryTemplate: { id: "..." } }

        const payload = {
            ...data,
            salaryTemplate: { id: data.salaryTemplateId }
        };

        const response = await fetch(`${API_BASE_URL}/salary-template-items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse<SalaryTemplateItem>(response);
    },

    update: async (id: string, data: SalaryTemplateItemFormData): Promise<SalaryTemplateItem> => {
        const payload = {
            ...data,
            salaryTemplate: { id: data.salaryTemplateId }
        };

        const response = await fetch(`${API_BASE_URL}/salary-template-items/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse<SalaryTemplateItem>(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
            throw new Error(error.error || error.message || 'Có lỗi xảy ra');
        }
    },

    // Export
    export: async (params: SearchSalaryTemplateItemDto): Promise<SalaryTemplateItem[]> => {
        const response = await fetch(`${API_BASE_URL}/salary-template-items/export`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<SalaryTemplateItem[]>(response);
    },
};
