import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    StaffWorkSchedule,
    SearchStaffWorkScheduleDto,
    defaultSearchStaffWorkScheduleDto,
} from '../types/staffWorkSchedule';
import { PageResponse } from '../types/pagination';
import { staffWorkScheduleApi } from '../services/staffWorkScheduleApi';
import { useDebounce } from './useDebounce';

interface UseStaffWorkSchedulesReturn {
    data: PageResponse<StaffWorkSchedule> | null;
    loading: boolean;
    error: string | null;
    searchParams: SearchStaffWorkScheduleDto;
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchStaffWorkScheduleDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;
    refresh: () => void;
}

export function useStaffWorkSchedules(
    initialParams?: Partial<SearchStaffWorkScheduleDto>
): UseStaffWorkSchedulesReturn {
    const [data, setData] = useState<PageResponse<StaffWorkSchedule> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchStaffWorkScheduleDto>({
        ...defaultSearchStaffWorkScheduleDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchStaffWorkScheduleDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffWorkScheduleApi.search(params);
            setData(response);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(message);
            console.error('Error fetching staff work schedules:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(apiParams);
    }, [apiParams, fetchData]);

    const handlePageChange = useCallback((pageIndex: number) => {
        setSearchParams((prev) => ({ ...prev, pageIndex }));
    }, []);

    const handlePageSizeChange = useCallback((pageSize: number) => {
        setSearchParams((prev) => ({ ...prev, pageSize, pageIndex: 0 }));
    }, []);

    const handleSort = useCallback((sortBy: string) => {
        setSearchParams((prev) => ({
            ...prev,
            sortBy,
            sortDirection:
                prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
            pageIndex: 0,
        }));
    }, []);

    const handleFilter = useCallback((filters: Partial<SearchStaffWorkScheduleDto>) => {
        setSearchParams((prev) => ({ ...prev, ...filters, pageIndex: 0 }));
    }, []);

    const handleSearch = useCallback((keyword: string) => {
        setSearchParams((prev) => ({
            ...prev,
            keyword: keyword || undefined,
            pageIndex: 0,
        }));
    }, []);

    const handleReset = useCallback(() => {
        setSearchParams(defaultSearchStaffWorkScheduleDto);
    }, []);

    const refresh = useCallback(() => {
        fetchData(apiParams);
    }, [fetchData, apiParams]);

    return {
        data,
        loading,
        error,
        searchParams,
        handlePageChange,
        handlePageSizeChange,
        handleSort,
        handleFilter,
        handleSearch,
        handleReset,
        refresh,
    };
}
