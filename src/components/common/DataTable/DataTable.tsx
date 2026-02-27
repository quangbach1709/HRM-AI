import React, { useCallback, useState } from 'react';
import { ColumnDef, PageResponse } from '../../../types/pagination';
import { SortDirection } from '../../../types/common';
import { TableHeader } from './TableHeader';
import { TableFilter } from './TableFilter';
import { Pagination } from './Pagination';
import { Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataTableProps<T> {
    data: PageResponse<T> | null;
    columns: ColumnDef<T>[];
    loading: boolean;
    sortBy: string;
    sortDirection: SortDirection;
    onSort: (column: string) => void;
    onFilter: (filters: Record<string, any>) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onRowClick?: (row: T) => void;
    rowKey?: keyof T | ((row: T) => string);
    // Expandable props
    expandable?: boolean;
    renderExpandedRow?: (row: T) => React.ReactNode;
    // Grouping props
    groupBy?: keyof T | string; // Path to property to group by
    renderGroupHeader?: (value: any, row: T) => React.ReactNode;
}

export function DataTable<T>({
    data,
    columns,
    loading,
    sortBy,
    sortDirection,
    onSort,
    onFilter,
    onPageChange,
    onPageSizeChange,
    onRowClick,
    rowKey = 'id' as keyof T,
    expandable = false,
    renderExpandedRow,
    groupBy,
    renderGroupHeader,
}: DataTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Lấy key cho row
    const getRowKey = useCallback(
        (row: T, index: number): string => {
            if (typeof rowKey === 'function') {
                return rowKey(row);
            }
            return String((row as any)[rowKey] || index);
        },
        [rowKey]
    );

    // Toggle expansion
    const toggleRow = (rowId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    // Toggle group collapse
    const toggleGroup = (groupKey: string) => {
        const newCollapsed = new Set(collapsedGroups);
        if (newCollapsed.has(groupKey)) {
            newCollapsed.delete(groupKey);
        } else {
            newCollapsed.add(groupKey);
        }
        setCollapsedGroups(newCollapsed);
    };

    // Lấy giá trị từ nested object (e.g., "parent.name")
    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    };

    // Check if column is actions column
    const isActionsColumn = (key: string) => key === 'actions';

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="relative w-full overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            {/* HEADER - CLICK ĐỂ SORT */}
                            <TableHeader
                                columns={columns}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                onSort={onSort}
                                expandable={expandable}
                            />
                            {/* FILTER ROW - LỌC THEO CỘT */}
                            <TableFilter
                                columns={columns}
                                onFilter={onFilter}
                                expandable={expandable}
                            />
                        </thead>

                        {/* BODY */}
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading && !data ? (
                                <tr>
                                    <td colSpan={columns.length + (expandable ? 1 : 0)} className="h-24 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : !data?.content?.length ? (
                                <tr>
                                    <td colSpan={columns.length + (expandable ? 1 : 0)} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <p>Không có dữ liệu</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.content.map((row, index) => {
                                    const rowId = getRowKey(row, index);
                                    const isExpanded = expandedRows.has(rowId);

                                    // Grouping Logic
                                    let showGroupHeader = false;
                                    let groupValue = null;
                                    let groupKey = '';

                                    if (groupBy) {
                                        groupValue = getNestedValue(row, groupBy as string);
                                        const prevRow = index > 0 ? data.content[index - 1] : null;
                                        const prevGroupValue = prevRow ? getNestedValue(prevRow, groupBy as string) : null;

                                        // Simple comparison (might need refinement for objects)
                                        if (index === 0 || groupValue !== prevGroupValue) {
                                            showGroupHeader = true;
                                        }
                                        groupKey = String(groupValue);
                                    }

                                    const isGroupCollapsed = collapsedGroups.has(groupKey);

                                    return (
                                        <React.Fragment key={`frag-${rowId}`}>
                                            {showGroupHeader && groupBy && (
                                                <tr className="bg-muted/50 hover:bg-muted/60">
                                                    <td
                                                        colSpan={columns.length + (expandable ? 1 : 0)}
                                                        className="p-2 font-medium cursor-pointer"
                                                        onClick={() => toggleGroup(groupKey)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isGroupCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                            {renderGroupHeader ? renderGroupHeader(groupValue, row) : groupValue}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {!isGroupCollapsed && (
                                                <>
                                                    <tr
                                                        key={rowId}
                                                        onClick={() => onRowClick?.(row)}
                                                        className={cn(
                                                            'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                                                            onRowClick ? 'cursor-pointer' : '',
                                                            isExpanded && 'bg-muted/30 border-b-0'
                                                        )}
                                                    >
                                                        {expandable && (
                                                            <td className="p-4 w-[50px]">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={(e) => toggleRow(rowId, e)}
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                    <span className="sr-only">Toggle row</span>
                                                                </Button>
                                                            </td>
                                                        )}

                                                        {columns.map((column) => {
                                                            const value = getNestedValue(row, column.key);
                                                            return (
                                                                <td
                                                                    key={column.key}
                                                                    className={cn(
                                                                        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
                                                                        isActionsColumn(column.key) && 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] md:static md:shadow-none md:bg-transparent'
                                                                    )}
                                                                >
                                                                    {column.render ? column.render(value, row) : value ?? '-'}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                    {expandable && isExpanded && renderExpandedRow && (
                                                        <tr className="bg-muted/30">
                                                            <td colSpan={columns.length + 1} className="p-4 pt-0">
                                                                <div className="p-4 bg-background rounded-md border shadow-sm">
                                                                    {renderExpandedRow(row)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {data && (
                <Pagination
                    pageNumber={data.pageNumber}
                    pageSize={data.pageSize}
                    totalElements={data.totalElements}
                    totalPages={data.totalPages}
                    hasNext={data.hasNext}
                    hasPrevious={data.hasPrevious}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
}
