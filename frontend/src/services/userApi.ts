import { User, UserFormData, SearchUserDto } from '../types/user';
import { PageResponse } from '../types/pagination';

const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000'}/api/v1/hr`;
const ENDPOINT = '/users';

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

export const userApi = {
    async search(params: SearchUserDto): Promise<PageResponse<User>> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/search`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<PageResponse<User>>(response);
    },

    async getById(id: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/${id}`, {
            headers: getHeaders(),
        });
        return handleResponse<User>(response);
    },

    async getAll(): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/all`, {
            headers: getHeaders(),
        });
        return handleResponse<User[]>(response);
    },

    async create(data: UserFormData): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<User>(response);
    },

    async update(id: string, data: UserFormData): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<User>(response);
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

    async export(params: SearchUserDto): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/export`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });
        return handleResponse<User[]>(response);
    },

    async updatePassword(data: UserFormData): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT}/update-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse<User>(response);
    },
};
