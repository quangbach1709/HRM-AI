package com.hrm.backend.dto.search;

/**
 * DTO tìm kiếm cho Department
 * Extends SearchDto để kế thừa các field cơ bản
 * Thêm các field đặc thù cho Department
 */
public class SearchDepartmentDto extends SearchDto {

    // ===== SORTING MỞ RỘNG (hỗ trợ click header bảng) =====
    private String sortBy = "createdAt"; // Field để sort, mặc định createdAt
    private String sortDirection = "DESC"; // ASC hoặc DESC

    // ===== FILTER ĐẶC THÙ CHO DEPARTMENT =====
    private String code; // Lọc theo mã phòng ban
    private String name; // Lọc theo tên phòng ban

    public SearchDepartmentDto() {
    }

    // ===== GETTERS & SETTERS =====

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Builder method để tạo từ SearchDto cơ bản
     */
    public static SearchDepartmentDto fromSearchDto(SearchDto dto) {
        SearchDepartmentDto result = new SearchDepartmentDto();
        if (dto != null) {
            result.setId(dto.getId());
            result.setOwnerId(dto.getOwnerId());
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result.setKeyword(dto.getKeyword());
            result.setFromDate(dto.getFromDate());
            result.setToDate(dto.getToDate());
            result.setVoided(dto.getVoided());
            result.setOrderBy(dto.getOrderBy());
            result.setParentId(dto.getParentId());
            result.setExportExcel(dto.getExportExcel());

            // Map orderBy sang sortDirection
            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
