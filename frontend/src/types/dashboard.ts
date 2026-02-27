// Dashboard Statistics types (camelCase to match Spring Boot JSON)
export interface AdminStats {
    totalUsers: number;
}

export interface ManagerStats {
    totalDepartments: number;
    totalSalaryTemplates: number;
}

export interface HrStats {
    totalEmployees: number;
    openPositions: number;
    completedAttendance: number;
}

export interface DashboardStats {
    id: string; // "MM-yyyy"
    adminStats?: AdminStats;
    managerStats?: ManagerStats;
    hrStats?: HrStats;
}

export interface DashboardSyncResponse {
    monthKey: string;
    admin_stats: AdminStats;
    manager_stats: ManagerStats;
    hr_stats: HrStats;
    message: string;
}
