import { api } from './api';
import { StaffWorkSchedule, StaffWorkScheduleFormData, SearchStaffWorkScheduleDto } from '../types/staffWorkSchedule';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/staff-work-schedules';

export const staffWorkScheduleApi = {
    // Pagination
    async search(params: SearchStaffWorkScheduleDto): Promise<PageResponse<StaffWorkSchedule>> {
        const response = await api.post<PageResponse<StaffWorkSchedule>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    // CRUD
    async getById(id: string): Promise<StaffWorkSchedule> {
        const response = await api.get<StaffWorkSchedule>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async create(data: StaffWorkScheduleFormData): Promise<StaffWorkSchedule> {
        const response = await api.post<StaffWorkSchedule>(ENDPOINT, data);
        return response.data;
    },

    async update(id: string, data: StaffWorkScheduleFormData): Promise<StaffWorkSchedule> {
        const response = await api.put<StaffWorkSchedule>(`${ENDPOINT}/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    // Additional
    async getAll(): Promise<StaffWorkSchedule[]> {
        const response = await api.get<StaffWorkSchedule[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    async export(params: SearchStaffWorkScheduleDto): Promise<StaffWorkSchedule[]> {
        const response = await api.post<StaffWorkSchedule[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },

    /**
     * Unified attendance method for both check-in and check-out.
     * Accepts images for face verification.
     */
    async attendance(data: StaffWorkScheduleFormData, images?: File[]): Promise<StaffWorkSchedule> {
        const formData = new FormData();

        // Append data as JSON Blob
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

        // Append images
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await api.post<StaffWorkSchedule>(`${ENDPOINT}/attendance`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
