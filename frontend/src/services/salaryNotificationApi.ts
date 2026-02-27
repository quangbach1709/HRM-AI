import { api } from './api';

const ENDPOINT = '/salary-notifications';

export interface SendSalaryEmailRequest {
    staffId?: string;
    salaryPeriodId: string;
    isAllStaff: boolean;
}

export const salaryNotificationApi = {
    /**
     * Send salary notification email
     * @param request - Contains staffId (optional), salaryPeriodId, isAllStaff
     */
    async sendSalaryEmail(request: SendSalaryEmailRequest): Promise<string> {
        const response = await api.post<string>(`${ENDPOINT}/send`, request);
        return response.data;
    }
};
