import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Position,
    SearchPositionDto,
    defaultSearchPositionDto,
} from '../types/position';
import { PageResponse } from '../types/pagination';
import { SortDirection } from '../types/common';
import { positionApi } from '../services/positionApi';
import { useDebounce } from './useDebounce';

export function usePositions(initialParams?: Partial<SearchPositionDto>) {
    const [data, setData] = useState<PageResponse<Position> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchPositionDto>({
        ...defaultSearchPositionDto,
        ...initialParams,
    });

    const debouncedKeyword = useDebounce(searchParams.keyword, 500);

    // Helper to remove undefined/empty fields before sending
    const cleanParams = (params: SearchPositionDto) => {
        const cleaned = { ...params };
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key as keyof SearchPositionDto] === undefined || cleaned[key as keyof SearchPositionDto] === '') {
                delete cleaned[key as keyof SearchPositionDto];
            }
        });
        return cleaned;
    };

    const apiParams = useMemo(
        () => ({ ...searchParams, keyword: debouncedKeyword }),
        [searchParams, debouncedKeyword]
    );

    const fetchData = useCallback(async (params: SearchPositionDto) => {
        setLoading(true);
        setError(null);
        try {
            const cleaned = cleanParams(params);
            const response = await positionApi.search(cleaned);
            setData(response);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
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

    const handleFilter = useCallback((filters: Partial<SearchPositionDto>) => {
        setSearchParams((prev) => ({ ...prev, ...filters, pageIndex: 0 }));
    }, []);

    const handleSearch = useCallback((keyword: string) => {
        setSearchParams((prev) => ({ ...prev, keyword: keyword || undefined, pageIndex: 0 }));
    }, []);

    const handleReset = useCallback(() => {
        setSearchParams(defaultSearchPositionDto);
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
