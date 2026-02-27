import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    StaffLabourAgreement,
    SearchStaffLabourAgreementDto,
    defaultSearchStaffLabourAgreementDto,
} from '../types/staffLabourAgreement';
import { PageResponse } from '../types/pagination';
import { staffLabourAgreementApi } from '../services/staffLabourAgreementApi';
import { useDebounce } from './useDebounce';

interface UseStaffLabourAgreementsReturn {
    // Data
    data: PageResponse<StaffLabourAgreement> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchStaffLabourAgreementDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchStaffLabourAgreementDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useStaffLabourAgreements(
    initialParams?: Partial<SearchStaffLabourAgreementDto>
): UseStaffLabourAgreementsReturn {
    // State
    const [data, setData] = useState<PageResponse<StaffLabourAgreement> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchStaffLabourAgreementDto>({
        ...defaultSearchStaffLabourAgreementDto,
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
    const fetchData = useCallback(async (params: SearchStaffLabourAgreementDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffLabourAgreementApi.search(params);
            setData(response);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
            const message =
                axiosError.response?.data?.message || axiosError.message || 'Có lỗi xảy ra';
            setError(message);
            console.error('Error fetching staff labour agreements:', err);
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

    const handleFilter = useCallback((filters: Partial<SearchStaffLabourAgreementDto>) => {
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
        setSearchParams(defaultSearchStaffLabourAgreementDto);
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
