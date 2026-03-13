import { Certificate, CertificateFormData, SearchCertificateDto } from '@/types/certificate';
import { PageResponse } from '@/types/pagination';

const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000'}/api/v1/hr`;

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

export const certificateApi = {
  // ==================== PAGINATION ====================

  async search(params: SearchCertificateDto): Promise<PageResponse<Certificate>> {
    const response = await fetch(`${API_BASE_URL}/certificates/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<PageResponse<Certificate>>(response);
  },

  // ==================== CRUD ====================

  async getById(id: string): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Certificate>(response);
  },

  async getAll(): Promise<Certificate[]> {
    const response = await fetch(`${API_BASE_URL}/certificates/all`, {
      headers: getHeaders(),
    });
    return handleResponse<Certificate[]>(response);
  },

  async create(data: CertificateFormData): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Certificate>(response);
  },

  async update(id: string, data: CertificateFormData): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Certificate>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
      throw new Error(error.error || error.message || 'Có lỗi xảy ra');
    }
  },

  // ==================== ADDITIONAL ====================

  async export(params: SearchCertificateDto): Promise<Certificate[]> {
    const response = await fetch(`${API_BASE_URL}/certificates/export`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<Certificate[]>(response);
  },
};
