import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '@/types/dashboard';
import { getCurrentStats, getStatsByMonth, syncCurrentStats, syncStatsByMonth } from '@/services/dashboardApi';

// Helper để lấy monthKey format MM-yyyy
const formatMonthKey = (month: number, year: number): string => {
    return `${month.toString().padStart(2, '0')}-${year}`;
};

// Helper để lấy tháng/năm hiện tại
const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const useDashboardStats = () => {
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const monthKey = formatMonthKey(selectedMonth, selectedYear);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Nếu là tháng hiện tại, dùng API không có monthKey
            const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
            const data = isCurrentMonth
                ? await getCurrentStats()
                : await getStatsByMonth(monthKey);

            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [monthKey, selectedMonth, selectedYear, currentMonth, currentYear]);

    const syncStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
            const result = isCurrentMonth
                ? await syncCurrentStats()
                : await syncStatsByMonth(monthKey);

            // Sau khi sync, map lại sang camelCase
            setStats({
                id: result.monthKey,
                adminStats: result.admin_stats,
                managerStats: result.manager_stats,
                hrStats: result.hr_stats,
            });
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [monthKey, selectedMonth, selectedYear, currentMonth, currentYear]);

    // Fetch lại khi tháng/năm thay đổi
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        monthKey,
        refetch: fetchStats,
        syncStats,
    };
};
