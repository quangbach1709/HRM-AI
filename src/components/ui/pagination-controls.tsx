import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  pageIndex,
  pageSize,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  canGoNext,
  canGoPrevious,
  setPageIndex,
  setPageSize,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  pageSizeOptions = [5, 10, 20, 50, 100],
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/30">
      {/* Left: Items info */}
      <div className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{startIndex}</span> -{' '}
        <span className="font-medium text-foreground">{endIndex}</span> trên{' '}
        <span className="font-medium text-foreground">{totalItems}</span> mục
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Số dòng:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToFirstPage}
            disabled={!canGoPrevious}
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm text-muted-foreground">Trang</span>
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {pageIndex + 1}
            </span>
            <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextPage}
            disabled={!canGoNext}
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToLastPage}
            disabled={!canGoNext}
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
