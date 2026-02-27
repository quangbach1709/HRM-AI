import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    SalaryPeriod,
    SearchSalaryPeriodDto,
    defaultSearchSalaryPeriodDto,
} from '../types/salaryPeriod';
import { PageResponse } from '../types/pagination';
import { salaryPeriodApi } from '../services/salaryPeriodApi';
import { useDebounce } from './useDebounce';

interface UseSalaryPeriodsReturn {
    data: PageResponse<SalaryPeriod> | null;
    loading: boolean;
    error: string | null;
    searchParams: SearchSalaryPeriodDto;
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryPeriodDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;
    refresh: () => void;
}

export function useSalaryPeriods(initialParams?: Partial<SearchSalaryPeriodDto>): UseSalaryPeriodsReturn {
    const [data, setData] = useState<PageResponse<SalaryPeriod> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryPeriodDto>({
        ...defaultSearchSalaryPeriodDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchSalaryPeriodDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryPeriodApi.search(params);
            setData(response);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu';
            setError(message);
            console.error('Error fetching SalaryPeriods:', err);
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

    const handleFilter = useCallback((filters: Partial<SearchSalaryPeriodDto>) => {
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
        setSearchParams(defaultSearchSalaryPeriodDto);
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
