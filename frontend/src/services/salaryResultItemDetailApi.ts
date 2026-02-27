import { api } from './api';
import { SalaryResultItemDetail, SalaryResultItemDetailFormData, SearchSalaryResultItemDetailDto } from '../types/salaryResultItemDetail';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/salary-result-item-details';

export const salaryResultItemDetailApi = {
    async search(params: SearchSalaryResultItemDetailDto): Promise<PageResponse<SalaryResultItemDetail>> {
        const response = await api.post<PageResponse<SalaryResultItemDetail>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    async searchForCurrentUser(params: SearchSalaryResultItemDetailDto): Promise<PageResponse<SalaryResultItemDetail>> {
        const response = await api.post<PageResponse<SalaryResultItemDetail>>(
            `${ENDPOINT}/current-user/search`,
            params
        );
        return response.data;
    },

    async getAll(): Promise<SalaryResultItemDetail[]> {
        const response = await api.get<SalaryResultItemDetail[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    async getBySalaryResultItemId(salaryResultItemId: string): Promise<SalaryResultItemDetail[]> {
        const response = await api.get<SalaryResultItemDetail[]>(`${ENDPOINT}/by-salary-result-item/${salaryResultItemId}`);
        return response.data;
    },

    async getById(id: string): Promise<SalaryResultItemDetail> {
        const response = await api.get<SalaryResultItemDetail>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async create(data: SalaryResultItemDetailFormData): Promise<SalaryResultItemDetail> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryResultItem: { id: data.salaryResultItemId },
            salaryTemplateItem: { id: data.salaryTemplateItemId },
            value: data.value
        };
        const response = await api.post<SalaryResultItemDetail>(ENDPOINT, payload);
        return response.data;
    },

    async update(id: string, data: SalaryResultItemDetailFormData): Promise<SalaryResultItemDetail> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryResultItem: { id: data.salaryResultItemId },
            salaryTemplateItem: { id: data.salaryTemplateItemId },
            value: data.value
        };
        const response = await api.put<SalaryResultItemDetail>(`${ENDPOINT}/${id}`, payload);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    async export(params: SearchSalaryResultItemDetailDto): Promise<SalaryResultItemDetail[]> {
        const response = await api.post<SalaryResultItemDetail[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },
};
