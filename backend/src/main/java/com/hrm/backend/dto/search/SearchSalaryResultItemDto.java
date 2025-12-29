package com.hrm.backend.dto.search;

import java.util.UUID;

/**
 * DTO tìm kiếm cho SalaryResultItem
 * Chi tiết bảng lương của từng nhân viên
 */
public class SearchSalaryResultItemDto extends SearchDto {

    // ===== SORTING =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private UUID salaryResultId; // Lọc theo bảng lương
    private UUID staffId; // Lọc theo nhân viên
    private String staffCode; // Lọc theo mã nhân viên
    private String staffName; // Lọc theo tên nhân viên

    public SearchSalaryResultItemDto() {
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

    public UUID getSalaryResultId() {
        return salaryResultId;
    }

    public void setSalaryResultId(UUID salaryResultId) {
        this.salaryResultId = salaryResultId;
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    /**
     * Factory method từ SearchDto cơ bản
     */
    public static SearchSalaryResultItemDto fromSearchDto(SearchDto dto) {
        SearchSalaryResultItemDto result = new SearchSalaryResultItemDto();
        if (dto != null) {
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result.setKeyword(dto.getKeyword());
            result.setVoided(dto.getVoided());

            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
