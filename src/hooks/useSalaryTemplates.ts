import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    SalaryTemplate,
    SearchSalaryTemplateDto,
    defaultSearchSalaryTemplateDto,
} from '../types/salaryTemplate';
import { PageResponse } from '../types/pagination';
import { salaryTemplateApi } from '../services/salaryTemplateApi';
import { useDebounce } from './useDebounce';

interface UseSalaryTemplatesReturn {
    // Data
    data: PageResponse<SalaryTemplate> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchSalaryTemplateDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchSalaryTemplateDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useSalaryTemplates(
    initialParams?: Partial<SearchSalaryTemplateDto>
): UseSalaryTemplatesReturn {
    // State
    const [data, setData] = useState<PageResponse<SalaryTemplate> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchSalaryTemplateDto>({
        ...defaultSearchSalaryTemplateDto,
        ...initialParams,
    });

    // Debounce keyword
    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    // API params
    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    // Fetch data
    const fetchData = useCallback(async (params: SearchSalaryTemplateDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salaryTemplateApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(message);
            console.error('Error fetching SalaryTemplates:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect: fetch when params change
    useEffect(() => {
        fetchData(apiParams);
    }, [apiParams, fetchData]);

    // ==================== HANDLERS ====================

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

    const handleFilter = useCallback((filters: Partial<SearchSalaryTemplateDto>) => {
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
        setSearchParams(defaultSearchSalaryTemplateDto);
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
