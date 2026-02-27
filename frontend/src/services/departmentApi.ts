import { Department, DepartmentFormData, SearchDepartmentDto, PageResponse } from '@/types/department';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('hrm_token');
};

// Helper function to create headers with auth
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

// Helper function to handle response
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
        throw new Error(error.error || error.message || 'Có lỗi xảy ra');
    }
    return response.json();
};

export const departmentApi = {
    /**
     * API MỚI - Tìm kiếm với đầy đủ filter và sort
     * POST /api/departments/search
     */
    search: async (params: SearchDepartmentDto): Promise<PageResponse<Department>> => {
        const response = await fetch(`${API_BASE_URL}/departments/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<Department>>(response);
    },

    /**
     * Lấy tất cả departments (cho dropdown, select)
     * GET /api/departments/all
     */
    getAll: async (): Promise<Department[]> => {
        const response = await fetch(`${API_BASE_URL}/departments/all`, {
            headers: getHeaders(),
        });
        return handleResponse<Department[]>(response);
    },

    /**
     * Lấy departments dạng cây
     * GET /api/departments/tree
     */
    getTree: async (): Promise<Department[]> => {
        const response = await fetch(`${API_BASE_URL}/departments/tree`, {
            headers: getHeaders(),
        });
        return handleResponse<Department[]>(response);
    },

    /**
     * Lấy chi tiết theo ID
     * GET /api/departments/{id}
     */
    getById: async (id: string): Promise<Department> => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<Department>(response);
    },

    /**
     * Thêm mới
     * POST /api/departments
     */
    create: async (data: DepartmentFormData): Promise<Department> => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Department>(response);
    },

    /**
     * Cập nhật
     * PUT /api/departments/{id}
     */
    update: async (id: string, data: DepartmentFormData): Promise<Department> => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<Department>(response);
    },

    /**
     * Xóa (soft delete)
     * DELETE /api/departments/{id}
     */
    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
            throw new Error(error.error || error.message || 'Có lỗi xảy ra');
        }
    },
};
