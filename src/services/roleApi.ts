import { Role, RoleFormData, SearchRoleDto, UserRole, UserRoleFormData, SearchUserRoleDto } from '@/types/role';
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

export const roleApi = {
  search: async (params: SearchRoleDto): Promise<PageResponse<Role>> => {
    const response = await fetch(`${API_BASE_URL}/roles/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<PageResponse<Role>>(response);
  },

  getAll: async (): Promise<Role[]> => {
    const response = await fetch(`${API_BASE_URL}/roles/all`, {
      headers: getHeaders(),
    });
    return handleResponse<Role[]>(response);
  },

  getById: async (id: string): Promise<Role> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Role>(response);
  },

  create: async (data: RoleFormData): Promise<Role> => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Role>(response);
  },

  update: async (id: string, data: RoleFormData): Promise<Role> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Role>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Có lỗi xảy ra' }));
      throw new Error(error.error || error.message || 'Có lỗi xảy ra');
    }
  },

  export: async (params: SearchRoleDto): Promise<Role[]> => {
    const response = await fetch(`${API_BASE_URL}/roles/export`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<Role[]>(response);
  },
};

// Mock data for UserRole (Keep existing mocks for UserRole as it might not be implemented on backend yet)
const mockRoles: Role[] = [
  { id: '1', name: 'Quản trị viên', description: 'Có toàn quyền truy cập hệ thống', createdAt: '2024-01-01' },
  { id: '2', name: 'Quản lý', description: 'Quản lý phòng ban, nhân sự, lương', createdAt: '2024-01-01' },
];

const mockUsers = [
  { id: '1', username: 'admin', displayName: 'Nguyễn Văn Admin' },
  { id: '2', username: 'manager', displayName: 'Trần Thị Manager' },
  { id: '3', username: 'hr', displayName: 'Lê Văn HR' },
  { id: '4', username: 'employee', displayName: 'Phạm Thị Employee' },
];

const mockUserRoles: UserRole[] = [
  { id: '1', userId: '1', roleId: '1', user: mockUsers[0], role: mockRoles[0], createdAt: '2024-01-01' },
  { id: '2', userId: '2', roleId: '2', user: mockUsers[1], role: mockRoles[1], createdAt: '2024-01-02' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userRoleApi = {
  search: async (params: SearchUserRoleDto): Promise<PageResponse<UserRole>> => {
    await delay(300);
    let filtered = [...mockUserRoles];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        ur =>
          ur.user?.username.toLowerCase().includes(keyword) ||
          ur.user?.displayName?.toLowerCase().includes(keyword) ||
          ur.role?.name.toLowerCase().includes(keyword)
      );
    }

    if (params.userId) {
      filtered = filtered.filter(ur => ur.userId === params.userId);
    }

    if (params.roleId) {
      filtered = filtered.filter(ur => ur.roleId === params.roleId);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / params.pageSize);
    const start = params.pageIndex * params.pageSize;
    const content = filtered.slice(start, start + params.pageSize);

    return {
      content,
      pageNumber: params.pageIndex,
      pageSize: params.pageSize,
      totalElements,
      totalPages,
      first: params.pageIndex === 0,
      last: params.pageIndex >= totalPages - 1,
      hasNext: params.pageIndex < totalPages - 1,
      hasPrevious: params.pageIndex > 0,
    };
  },

  getUsers: async () => {
    await delay(200);
    return mockUsers;
  },

  create: async (data: UserRoleFormData): Promise<UserRole> => {
    await delay(300);
    const user = mockUsers.find(u => u.id === data.userId);
    const role = mockRoles.find(r => r.id === data.roleId);
    const newUserRole: UserRole = {
      id: String(mockUserRoles.length + 1),
      ...data,
      user,
      role,
      createdAt: new Date().toISOString(),
    };
    mockUserRoles.push(newUserRole);
    return newUserRole;
  },

  update: async (id: string, data: UserRoleFormData): Promise<UserRole> => {
    await delay(300);
    const index = mockUserRoles.findIndex(ur => ur.id === id);
    if (index === -1) throw new Error('Không tìm thấy phân quyền');
    const user = mockUsers.find(u => u.id === data.userId);
    const role = mockRoles.find(r => r.id === data.roleId);
    mockUserRoles[index] = { ...mockUserRoles[index], ...data, user, role, updatedAt: new Date().toISOString() };
    return mockUserRoles[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockUserRoles.findIndex(ur => ur.id === id);
    if (index === -1) throw new Error('Không tìm thấy phân quyền');
    mockUserRoles.splice(index, 1);
  },
};
