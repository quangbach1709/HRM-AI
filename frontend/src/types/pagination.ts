// src/types/pagination.ts

// Response từ API
export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Column definition cho table
export interface ColumnDef<T> {
    key: string;                              // Field key (có thể nested: "department.name")
    header: string;                           // Tiêu đề hiển thị
    sortable?: boolean;                       // Có thể sort không
    sortKey?: string;                         // Key gửi lên API khi sort (nếu khác key)
    filterable?: boolean;                     // Có thể filter không
    filterType?: 'text' | 'select' | 'date' | 'boolean';
    filterKey?: string;                       // Key gửi lên API khi filter
    filterOptions?: { value: string; label: string }[];
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
}
