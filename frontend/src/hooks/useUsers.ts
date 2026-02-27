import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    User,
    SearchUserDto,
    defaultSearchUserDto,
} from '../types/user';
import { PageResponse } from '../types/pagination';
import { userApi } from '../services/userApi';
import { useDebounce } from './useDebounce';

interface UseUsersReturn {
    data: PageResponse<User> | null;
    loading: boolean;
    error: string | null;
    searchParams: SearchUserDto;
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchUserDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;
    refresh: () => void;
}

export function useUsers(initialParams?: Partial<SearchUserDto>): UseUsersReturn {
    const [data, setData] = useState<PageResponse<User> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchUserDto>({
        ...defaultSearchUserDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchUserDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await userApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(message);
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

    const handleFilter = useCallback((filters: Partial<SearchUserDto>) => {
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
        setSearchParams(defaultSearchUserDto);
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
