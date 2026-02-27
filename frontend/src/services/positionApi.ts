import { api } from './api';
import { Position, PositionFormData, SearchPositionDto } from '@/types/position';
import { PageResponse } from '@/types/pagination';

const ENDPOINT = '/positions';

export const positionApi = {
  search: async (params: SearchPositionDto): Promise<PageResponse<Position>> => {
    const response = await api.post<PageResponse<Position>>(
      `${ENDPOINT}/search`,
      params
    );
    return response.data;
  },

  getAll: async (): Promise<Position[]> => {
    const response = await api.get<Position[]>(`${ENDPOINT}/all`);
    return response.data;
  },

  getById: async (id: string): Promise<Position> => {
    const response = await api.get<Position>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (data: PositionFormData): Promise<Position> => {
    const response = await api.post<Position>(ENDPOINT, data);
    return response.data;
  },

  update: async (id: string, data: PositionFormData): Promise<Position> => {
    const response = await api.put<Position>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  export: async (params: SearchPositionDto): Promise<Position[]> => {
    // TODO: Implement export endpoint in backend
    return [];
  },

  getByDepartment: async (departmentId: string): Promise<Position[]> => {
    const response = await api.get<Position[]>(`${ENDPOINT}/department/${departmentId}`);
    return response.data;
  }
};
