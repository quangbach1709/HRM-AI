import { api } from './api';
import { SalaryResultItem, SalaryResultItemFormData, SearchSalaryResultItemDto } from '../types/salaryResultItem';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/salary-result-items';

export const salaryResultItemApi = {
    async search(params: SearchSalaryResultItemDto): Promise<PageResponse<SalaryResultItem>> {
        const response = await api.post<PageResponse<SalaryResultItem>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    async getAll(): Promise<SalaryResultItem[]> {
        const response = await api.get<SalaryResultItem[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    async getBySalaryResultId(salaryResultId: string): Promise<SalaryResultItem[]> {
        const response = await api.get<SalaryResultItem[]>(`${ENDPOINT}/by-salary-result/${salaryResultId}`);
        return response.data;
    },

    async getById(id: string): Promise<SalaryResultItem> {
        const response = await api.get<SalaryResultItem>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async create(data: SalaryResultItemFormData): Promise<SalaryResultItem> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryResult: { id: data.salaryResultId },
            staff: { id: data.staffId }
        };
        const response = await api.post<SalaryResultItem>(ENDPOINT, payload);
        return response.data;
    },

    async update(id: string, data: SalaryResultItemFormData): Promise<SalaryResultItem> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryResult: { id: data.salaryResultId },
            staff: { id: data.staffId }
        };
        const response = await api.put<SalaryResultItem>(`${ENDPOINT}/${id}`, payload);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    async export(params: SearchSalaryResultItemDto): Promise<SalaryResultItem[]> {
        const response = await api.post<SalaryResultItem[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },
};
