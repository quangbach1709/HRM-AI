import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    UserRole,
    SearchUserRoleDto,
    defaultSearchUserRoleDto,
} from '../types/role';
import { PageResponse } from '../types/pagination';
import { userRoleApi } from '../services/userRoleApi';
import { useDebounce } from './useDebounce';

interface UseUserRolesReturn {
    data: PageResponse<UserRole> | null;
    loading: boolean;
    error: string | null;
    searchParams: SearchUserRoleDto;
    handlePageChange: (pageIndex: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleSort: (sortBy: string) => void;
    handleFilter: (filters: Partial<SearchUserRoleDto>) => void;
    handleSearch: (keyword: string) => void;
    handleReset: () => void;
    refresh: () => void;
}

export function useUserRoles(initialParams?: Partial<SearchUserRoleDto>): UseUserRolesReturn {
    const [data, setData] = useState<PageResponse<UserRole> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchUserRoleDto>({
        ...defaultSearchUserRoleDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchUserRoleDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await userRoleApi.search(params);
            setData(response);
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Error fetching user roles';
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

    const handleFilter = useCallback((filters: Partial<SearchUserRoleDto>) => {
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
        setSearchParams(defaultSearchUserRoleDto);
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
