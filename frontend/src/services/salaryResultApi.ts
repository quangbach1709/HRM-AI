import { api } from './api';
import { SalaryResult, SalaryResultFormData, SearchSalaryResultDto } from '../types/salaryResult';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/salary-results';

// Types for salary calculation
export interface CalculateSalaryResponse {
    salaryResultId: string;
    salaryResultItemId: string;
    staffId: string;
    staffCode: string;
    staffName: string;
    salaryPeriodId: string;
    salaryPeriodName: string;
    totalSalary: number;
    items: SalaryItemDetail[];
}

export interface SalaryItemDetail {
    salaryTemplateItemId: string;
    code: string;
    name: string;
    salaryItemType: number;
    value: number;
    displayOrder: number;
}

export const salaryResultApi = {
    async search(params: SearchSalaryResultDto): Promise<PageResponse<SalaryResult>> {
        const response = await api.post<PageResponse<SalaryResult>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    async getAll(): Promise<SalaryResult[]> {
        const response = await api.get<SalaryResult[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    async getById(id: string): Promise<SalaryResult> {
        const response = await api.get<SalaryResult>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async create(data: SalaryResultFormData): Promise<SalaryResult> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryPeriod: { id: data.salaryPeriodId },
            salaryTemplate: { id: data.salaryTemplateId }
        };
        const response = await api.post<SalaryResult>(ENDPOINT, payload);
        return response.data;
    },

    async update(id: string, data: SalaryResultFormData): Promise<SalaryResult> {
        // Transform flat ID to object structure expected by backend
        const payload = {
            ...data,
            salaryPeriod: { id: data.salaryPeriodId },
            salaryTemplate: { id: data.salaryTemplateId }
        };
        const response = await api.put<SalaryResult>(`${ENDPOINT}/${id}`, payload);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    async export(params: SearchSalaryResultDto): Promise<SalaryResult[]> {
        const response = await api.post<SalaryResult[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },

    /**
     * Calculate salary for a single staff member
     */
    async calculateSalary(staffId: string, salaryPeriodId: string): Promise<CalculateSalaryResponse> {
        const response = await api.post<CalculateSalaryResponse>(`${ENDPOINT}/calculate`, {
            staffId,
            salaryPeriodId
        });
        return response.data;
    },

    /**
     * Calculate salary for all staff members
     */
    async calculateSalaryAll(salaryPeriodId: string): Promise<any> {
        const response = await api.post<any>(`${ENDPOINT}/calculate-all`, {
            salaryPeriodId,
            allStaff: true
        });
        return response.data;
    },
};
