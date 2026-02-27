import { useState, useCallback, useEffect, useRef } from 'react';
import {
    SalaryResultItemDetail,
    SearchSalaryResultItemDetailDto,
    defaultSearchSalaryResultItemDetailDto,
} from '../types/salaryResultItemDetail';
import { PageResponse } from '../types/pagination';
import { salaryResultItemDetailApi } from '../services/salaryResultItemDetailApi';
import { useDebounce } from './useDebounce';

interface UseSalaryResultItemDetailsReturn {
    // Data
    data: PageResponse<SalaryResultItemDetail> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchSalaryResultItemDetailDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryResultItemDetailDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useSalaryResultItemDetails(
    initialParams?: Partial<SearchSalaryResultItemDetailDto>
): UseSalaryResultItemDetailsReturn {
    const [data, setData] = useState<PageResponse<SalaryResultItemDetail> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryResultItemDetailDto>({
        ...defaultSearchSalaryResultItemDetailDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword || '', 500);

    // Use a ref to track the previous serialized params to avoid infinite loops
    const prevParamsRef = useRef<string>('');

    const fetchData = useCallback(async (params: SearchSalaryResultItemDetailDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryResultItemDetailApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách chi tiết khoản lương';
            setError(message);
            console.error('Error fetching salary result item details:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const apiParams: SearchSalaryResultItemDetailDto = {
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

    const handleFilter = useCallback((filters: Partial<SearchSalaryResultItemDetailDto>) => {
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
        setSearchParams(defaultSearchSalaryResultItemDetailDto);
    }, []);

    const refresh = useCallback(() => {
        const apiParams: SearchSalaryResultItemDetailDto = {
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
