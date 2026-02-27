import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    SalaryTemplateItem,
    SearchSalaryTemplateItemDto,
    defaultSearchSalaryTemplateItemDto,
} from '../types/salaryTemplateItem';
import { PageResponse } from '../types/pagination';
import { salaryTemplateItemApi } from '../services/salaryTemplateItemApi';
import { useDebounce } from './useDebounce';

interface UseSalaryTemplateItemsReturn {
    data: PageResponse<SalaryTemplateItem> | null;
    loading: boolean;
    error: string | null;
    searchParams: SearchSalaryTemplateItemDto;
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryTemplateItemDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;
    refresh: () => void;
}

export function useSalaryTemplateItems(initialParams?: Partial<SearchSalaryTemplateItemDto>): UseSalaryTemplateItemsReturn {
    const [data, setData] = useState<PageResponse<SalaryTemplateItem> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryTemplateItemDto>({
        ...defaultSearchSalaryTemplateItemDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchSalaryTemplateItemDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryTemplateItemApi.search(params);
            setData(response);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu';
            setError(message);
            console.error('Error fetching SalaryTemplateItems:', err);
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

    const handleFilter = useCallback((filters: Partial<SearchSalaryTemplateItemDto>) => {
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
        setSearchParams(defaultSearchSalaryTemplateItemDto);
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
