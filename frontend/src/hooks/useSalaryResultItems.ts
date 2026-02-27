import { useState, useCallback, useEffect, useRef } from 'react';
import {
    SalaryResultItem,
    SearchSalaryResultItemDto,
    defaultSearchSalaryResultItemDto,
} from '../types/salaryResultItem';
import { PageResponse } from '../types/pagination';
import { salaryResultItemApi } from '../services/salaryResultItemApi';
import { useDebounce } from './useDebounce';

interface UseSalaryResultItemsReturn {
    // Data
    data: PageResponse<SalaryResultItem> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchSalaryResultItemDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryResultItemDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useSalaryResultItems(
    initialParams?: Partial<SearchSalaryResultItemDto>
): UseSalaryResultItemsReturn {
    const [data, setData] = useState<PageResponse<SalaryResultItem> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryResultItemDto>({
        ...defaultSearchSalaryResultItemDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword || '', 500);

    // Use a ref to track the previous serialized params to avoid infinite loops
    const prevParamsRef = useRef<string>('');

    const fetchData = useCallback(async (params: SearchSalaryResultItemDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryResultItemApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách chi tiết bảng lương';
            setError(message);
            console.error('Error fetching salary result items:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const apiParams: SearchSalaryResultItemDto = {
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

    const handleFilter = useCallback((filters: Partial<SearchSalaryResultItemDto>) => {
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
        setSearchParams(defaultSearchSalaryResultItemDto);
    }, []);

    const refresh = useCallback(() => {
        const apiParams: SearchSalaryResultItemDto = {
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
