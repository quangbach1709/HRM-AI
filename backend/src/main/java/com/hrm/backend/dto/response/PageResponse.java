package com.hrm.backend.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Response wrapper cho pagination
 * Chuẩn hóa response trả về frontend
 */
public class PageResponse<T> {

    private List<T> content; // Danh sách data
    private int pageNumber; // Trang hiện tại (0-based)
    private int pageSize; // Số lượng mỗi trang
    private long totalElements; // Tổng số records
    private int totalPages; // Tổng số trang
    private boolean first; // Là trang đầu?
    private boolean last; // Là trang cuối?
    private boolean hasNext; // Có trang tiếp?
    private boolean hasPrevious; // Có trang trước?

    public PageResponse() {
    }

    public PageResponse(List<T> content, int pageNumber, int pageSize, long totalElements,
            int totalPages, boolean first, boolean last, boolean hasNext, boolean hasPrevious) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
    }

    /**
     * Factory method tạo PageResponse từ Spring Page
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious());
    }

    // ===== GETTERS & SETTERS =====

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }
}
