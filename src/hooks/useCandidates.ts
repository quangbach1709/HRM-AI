import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Candidate,
    SearchCandidateDto,
    defaultSearchCandidateDto,
} from '../types/candidate';
import { PageResponse } from '../types/pagination';
import { candidateApi } from '../services/candidateApi';
import { useDebounce } from './useDebounce';

interface UseCandidatesReturn {
    // Data
    data: PageResponse<Candidate> | null;
    loading: boolean;
    error: string | null;

    // Search params
    searchParams: SearchCandidateDto;

    // Pagination actions
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;

    // Sort & Filter actions
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchCandidateDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;

    // Other actions
    refresh: () => void;
}

export function useCandidates(
    initialParams?: Partial<SearchCandidateDto>
): UseCandidatesReturn {
    // State
    const [data, setData] = useState<PageResponse<Candidate> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchCandidateDto>({
        ...defaultSearchCandidateDto,
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
    const fetchData = useCallback(async (params: SearchCandidateDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await candidateApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách ứng viên';
            setError(message);
            console.error('Error fetching candidates:', err);
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

    const handleFilter = useCallback((filters: Partial<SearchCandidateDto>) => {
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
        setSearchParams(defaultSearchCandidateDto);
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
