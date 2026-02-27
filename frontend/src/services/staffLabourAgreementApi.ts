import { api } from './api';
import {
    StaffLabourAgreement,
    StaffLabourAgreementFormData,
    SearchStaffLabourAgreementDto
} from '../types/staffLabourAgreement';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/labour-agreements';

export const staffLabourAgreementApi = {
    async search(params: SearchStaffLabourAgreementDto): Promise<PageResponse<StaffLabourAgreement>> {
        const response = await api.post<PageResponse<StaffLabourAgreement>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    async getById(id: string): Promise<StaffLabourAgreement> {
        const response = await api.get<StaffLabourAgreement>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getAll(): Promise<StaffLabourAgreement[]> {
        const response = await api.get<StaffLabourAgreement[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    async create(data: StaffLabourAgreementFormData): Promise<StaffLabourAgreement> {
        const response = await api.post<StaffLabourAgreement>(ENDPOINT, data);
        return response.data;
    },

    async update(id: string, data: StaffLabourAgreementFormData): Promise<StaffLabourAgreement> {
        const response = await api.put<StaffLabourAgreement>(`${ENDPOINT}/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    async export(params: SearchStaffLabourAgreementDto): Promise<StaffLabourAgreement[]> {
        const response = await api.post<StaffLabourAgreement[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },
};
