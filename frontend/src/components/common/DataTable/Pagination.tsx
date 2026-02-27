import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui components exist, otherwise standard buttons
// If Button component doesn't exist, I'll use standard HTML button with tailwind

interface PaginationProps {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    hasNext,
    hasPrevious,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const from = pageNumber * pageSize + 1;
    const to = Math.min((pageNumber + 1) * pageSize, totalElements);

    if (totalElements === 0) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Hiển thị {totalElements > 0 ? from : 0} - {to} / {totalElements} kết quả
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Số hàng mỗi trang</p>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        onClick={() => onPageChange(0)}
                        disabled={pageNumber === 0}
                        title="Trang đầu"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        onClick={() => onPageChange(pageNumber - 1)}
                        disabled={!hasPrevious}
                        title="Trang trước"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Trang {pageNumber + 1} / {totalPages || 1}
                    </div>
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        onClick={() => onPageChange(pageNumber + 1)}
                        disabled={!hasNext}
                        title="Trang sau"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        onClick={() => onPageChange(totalPages - 1)}
                        disabled={pageNumber >= totalPages - 1}
                        title="Trang cuối"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
