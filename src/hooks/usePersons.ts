import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Person,
    SearchPersonDto,
    defaultSearchPersonDto,
} from '../types/person';
import { PageResponse } from '../types/pagination';
import { personApi } from '../services/personApi';
import { useDebounce } from './useDebounce';

export function usePersons(initialParams?: Partial<SearchPersonDto>) {
    const [data, setData] = useState<PageResponse<Person> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchPersonDto>({
        ...defaultSearchPersonDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    const cleanParams = (params: SearchPersonDto) => {
        const cleaned = { ...params };
        // Clean undefined/empty values if needed, for strings mainly
        // number 0 should be kept
        return cleaned;
    };

    const apiParams = useMemo(
        () => cleanParams({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchPersonDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await personApi.search(params);
            setData(response);
        } catch (err: any) {
            const message = err.message || 'Có lỗi xảy ra';
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
            sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
            pageIndex: 0,
        }));
    }, []);

    const handleFilter = useCallback((filters: Partial<SearchPersonDto>) => {
        setSearchParams((prev) => ({ ...prev, ...filters, pageIndex: 0 }));
    }, []);

    const handleSearch = useCallback((keyword: string) => {
        setSearchParams((prev) => ({ ...prev, keyword: keyword || undefined, pageIndex: 0 }));
    }, []);

    const handleReset = useCallback(() => {
        setSearchParams(defaultSearchPersonDto);
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
