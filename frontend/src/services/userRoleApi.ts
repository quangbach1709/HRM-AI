import { UserRole, SearchUserRoleDto } from '../types/role'; // Recycling types from role.ts
import { PageResponse } from '../types/pagination';

const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000'}/api/v1/hr`;
const ENDPOINT = '/user-roles';

const getAuthToken = (): string | null => {
    return localStorage.getItem('hrm_token');
};

const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
        throw new Error(error.message || error.error || 'Request failed');
    }
    return response.json();
};

export const userRoleApi = {
    async search(params: SearchUserRoleDto): Promise<PageResponse<UserRole>> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<UserRole>>(response);
    },

    async create(data: SearchUserRoleDto): Promise<UserRole> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<UserRole>(response);
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error deleting' }));
            throw new Error(error.message || 'Delete failed');
        }
    },
};
