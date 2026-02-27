import React, { useState, useEffect, useCallback } from 'react';
import { ColumnDef } from '../../../types/pagination';
import { useDebounce } from '../../../hooks/useDebounce';

interface TableFilterProps<T> {
    columns: ColumnDef<T>[];
    onFilter: (filters: Record<string, any>) => void;
    expandable?: boolean; // Add expandable prop
}

export function TableFilter<T>({ columns, onFilter, expandable = false }: TableFilterProps<T>) {
    const [filters, setFilters] = useState<Record<string, any>>({});

    // Debounce filters
    const debouncedFilters = useDebounce(filters, 500);

    // Gọi onFilter khi debounced filters thay đổi
    useEffect(() => {
        onFilter(debouncedFilters);
    }, [debouncedFilters, onFilter]);

    // Handle filter change
    const handleChange = useCallback((key: string, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === '' ? undefined : value,
        }));
    }, []);

    // Render filter input
    const renderFilter = (column: ColumnDef<T>) => {
        if (!column.filterable) return null;

        const filterKey = column.filterKey || column.key;
        const value = filters[filterKey] ?? '';

        const inputClasses = "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

        switch (column.filterType) {
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleChange(filterKey, e.target.value)}
                        className={inputClasses}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="">Tất cả</option>
                        {column.filterOptions?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'boolean':
                return (
                    <select
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange(filterKey, val === '' ? undefined : val === 'true');
                        }}
                        className={inputClasses}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleChange(filterKey, e.target.value)}
                        className={inputClasses}
                        onClick={(e) => e.stopPropagation()}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(filterKey, e.target.value)}
                        placeholder={`Lọc...`}
                        className={inputClasses}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
        }
    };

    // Check if any column is filterable
    const hasFilterableColumns = columns.some((c) => c.filterable);
    if (!hasFilterableColumns) return null;

    return (
        <tr className="bg-muted/30">
            {/* Render empty cell if expandable */}
            {expandable && <th className="p-2 border-r bg-muted/20"></th>}

            {columns.map((column) => (
                <th key={`filter-${column.key}`} className="p-2">
                    {renderFilter(column)}
                </th>
            ))}
        </tr>
    );
}
