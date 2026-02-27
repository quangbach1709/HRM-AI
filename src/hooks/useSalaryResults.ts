import { useState, useCallback, useEffect, useRef } from 'react';
import {
    SalaryResult,
    SearchSalaryResultDto,
    defaultSearchSalaryResultDto,
} from '../types/salaryResult';
import { PageResponse } from '../types/pagination';
import { salaryResultApi } from '../services/salaryResultApi';
import { useDebounce } from './useDebounce';

interface UseSalaryResultsReturn {
    // Data
    data: PageResponse<SalaryResult> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchSalaryResultDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryResultDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useSalaryResults(
    initialParams?: Partial<SearchSalaryResultDto>
): UseSalaryResultsReturn {
    const [data, setData] = useState<PageResponse<SalaryResult> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryResultDto>({
        ...defaultSearchSalaryResultDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword || '', 500);

    // Use a ref to track the previous serialized params to avoid infinite loops
    const prevParamsRef = useRef<string>('');

    const fetchData = useCallback(async (params: SearchSalaryResultDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryResultApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách bảng lương';
            setError(message);
            console.error('Error fetching salary results:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const apiParams: SearchSalaryResultDto = {
            ...searchParams,
            keyword: debouncedKeyword || undefined,
        };

        const serializedParams = JSON.stringify(apiParams);

        // Only fetch if params actually changed
        if (serializedParams !== prevParamsRef.current) {
            prevParamsRef.current = serializedParams;
            fetchData(apiParams);
        }
    }, [searchParams, debouncedKeyword, fetchData]);

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

    const handleFilter = useCallback((filters: Partial<SearchSalaryResultDto>) => {
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
        setSearchParams(defaultSearchSalaryResultDto);
    }, []);

    const refresh = useCallback(() => {
        const apiParams: SearchSalaryResultDto = {
            ...searchParams,
            keyword: debouncedKeyword || undefined,
        };
        fetchData(apiParams);
    }, [fetchData, searchParams, debouncedKeyword]);

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
