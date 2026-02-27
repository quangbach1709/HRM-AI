import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ColumnDef } from '../../../types/pagination';
import { SortDirection } from '../../../types/common';
import { cn } from '@/lib/utils';

interface TableHeaderProps<T> {
    columns: ColumnDef<T>[];
    sortBy: string;
    sortDirection: SortDirection;
    onSort: (column: string) => void;
    expandable?: boolean; // Add expandable prop
}

export function TableHeader<T>({
    columns,
    sortBy,
    sortDirection,
    onSort,
    expandable = false,
}: TableHeaderProps<T>) {
    const getSortIcon = (column: ColumnDef<T>) => {
        if (!column.sortable) return null;

        const sortKey = column.sortKey || column.key;
        const isActive = sortBy === sortKey;

        if (!isActive) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;

        return sortDirection === 'ASC'
            ? <ArrowUp className="ml-2 h-4 w-4" />
            : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const handleClick = (column: ColumnDef<T>) => {
        if (!column.sortable) return;
        const sortKey = column.sortKey || column.key;
        onSort(sortKey);
    };

    // Check if column is actions column
    const isActionsColumn = (key: string) => key === 'actions';

    return (
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {/* Render extra empty cell if expandable */}
            {expandable && <th className="p-4 w-[50px] bg-muted/20"></th>}

            {columns.map((column) => (
                <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                        column.sortable && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                        isActionsColumn(column.key) && 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] md:static md:shadow-none md:bg-transparent'
                    )}
                    onClick={() => handleClick(column)}
                >
                    <div className="flex items-center">
                        {column.header}
                        {getSortIcon(column)}
                    </div>
                </th>
            ))}
        </tr>
    );
}
