import { Person, PersonFormData, SearchPersonDto } from '@/types/person';
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

export const personApi = {
  search: async (params: SearchPersonDto): Promise<PageResponse<Person>> => {
    const response = await fetch(`${API_BASE_URL}/persons/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<PageResponse<Person>>(response);
  },

  getAll: async (): Promise<Person[]> => {
    const response = await fetch(`${API_BASE_URL}/persons/all`, {
      headers: getHeaders(),
    });
    return handleResponse<Person[]>(response);
  },

  getById: async (id: string): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Person>(response);
  },

  create: async (data: PersonFormData): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Person>(response);
  },

  update: async (id: string, data: PersonFormData): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Person>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
      throw new Error(error.error || error.message || 'Có lỗi xảy ra');
    }
  },

  export: async (params: SearchPersonDto): Promise<Person[]> => {
    const response = await fetch(`${API_BASE_URL}/persons/export`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<Person[]>(response);
  },

  getCurrent: async (): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/current`, {
      headers: getHeaders(),
    });
    return handleResponse<Person>(response);
  },

  updateCurrentProfile: async (data: Partial<PersonFormData>): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Person>(response);
  },

  uploadAvatar: async (file: File): Promise<Person> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/persons/me/avatar`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse<Person>(response);
  },
};
