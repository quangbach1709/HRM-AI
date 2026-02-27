import { DashboardStats, DashboardSyncResponse } from '@/types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = localStorage.getItem('hrm_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Lấy thống kê tháng hiện tại
 */
export const getCurrentStats = async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
};

/**
 * Lấy thống kê theo tháng cụ thể
 */
export const getStatsByMonth = async (monthKey: string): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats/${monthKey}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
};

/**
 * Đồng bộ dữ liệu từ PostgreSQL sang MongoDB (Admin only)
 */
export const syncCurrentStats = async (): Promise<DashboardSyncResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to sync dashboard stats');
    }

    return response.json();
};

/**
 * Đồng bộ dữ liệu cho tháng cụ thể (Admin only)
 */
export const syncStatsByMonth = async (monthKey: string): Promise<DashboardSyncResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/sync/${monthKey}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to sync dashboard stats');
    }

    return response.json();
};
