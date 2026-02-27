import { useState, useMemo } from 'react';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface UsePaginationOptions {
  initialPageSize?: number;
  initialPageIndex?: number;
}

export interface UsePaginationReturn<T> {
  // Pagination state
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Paginated data
  paginatedData: T[];
  
  // Actions
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  
  // Helpers
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPageSize = 10, initialPageIndex = 0 } = options;
  
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Reset to first page when data changes significantly
  const validPageIndex = Math.min(pageIndex, Math.max(0, totalPages - 1));
  
  const paginatedData = useMemo(() => {
    const start = validPageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, validPageIndex, pageSize]);
  
  const startIndex = validPageIndex * pageSize + 1;
  const endIndex = Math.min((validPageIndex + 1) * pageSize, totalItems);
  
  const canGoNext = validPageIndex < totalPages - 1;
  const canGoPrevious = validPageIndex > 0;
  
  const handleSetPageSize = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when page size changes
  };
  
  const handleSetPageIndex = (newIndex: number) => {
    setPageIndex(Math.max(0, Math.min(newIndex, totalPages - 1)));
  };
  
  return {
    pageIndex: validPageIndex,
    pageSize,
    totalItems,
    totalPages,
    paginatedData,
    setPageIndex: handleSetPageIndex,
    setPageSize: handleSetPageSize,
    goToFirstPage: () => setPageIndex(0),
    goToLastPage: () => setPageIndex(totalPages - 1),
    goToNextPage: () => canGoNext && setPageIndex(validPageIndex + 1),
    goToPreviousPage: () => canGoPrevious && setPageIndex(validPageIndex - 1),
    canGoNext,
    canGoPrevious,
    startIndex: totalItems > 0 ? startIndex : 0,
    endIndex,
  };
}
