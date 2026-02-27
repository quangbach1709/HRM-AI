import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Certificate,
    SearchCertificateDto,
    defaultSearchCertificateDto,
} from '../types/certificate';
import { PageResponse } from '../types/pagination';
import { certificateApi } from '../services/certificateApi';
import { useDebounce } from './useDebounce';

interface UseCertificatesReturn {
    // Data
    data: PageResponse<Certificate> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchCertificateDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchCertificateDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useCertificates(
    initialParams?: Partial<SearchCertificateDto>
): UseCertificatesReturn {
    // State
    const [data, setData] = useState<PageResponse<Certificate> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchCertificateDto>({
        ...defaultSearchCertificateDto,
        ...initialParams,
    });

    // Debounce keyword
    // Only debounce if keyword is present to avoid unnecessary delays on other filters
    const debouncedKeyword = useDebounce(searchParams.keyword || '', 500);

    // API params
    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword || undefined }),
        [searchParams, debouncedKeyword]
    );

    // Fetch data
    const fetchData = useCallback(async (params: SearchCertificateDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await certificateApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(message);
            console.error('Error fetching certificates:', err);
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

    const handleFilter = useCallback((filters: Partial<SearchCertificateDto>) => {
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
        setSearchParams(defaultSearchCertificateDto);
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
