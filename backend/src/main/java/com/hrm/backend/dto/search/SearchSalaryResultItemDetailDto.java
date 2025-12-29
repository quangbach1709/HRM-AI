package com.hrm.backend.dto.search;

import java.util.UUID;

/**
 * DTO tìm kiếm cho SalaryResultItemDetail
 * Chi tiết từng khoản lương phần tử lương
 */
public class SearchSalaryResultItemDetailDto extends SearchDto {

    // ===== SORTING =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private UUID salaryResultItemId; // Lọc theo chi tiết bảng lương nhân viên
    private UUID salaryTemplateItemId; // Lọc theo thành phần lương
    private Double minValue; // Lọc theo giá trị tối thiểu
    private Double maxValue; // Lọc theo giá trị tối đa

    public SearchSalaryResultItemDetailDto() {
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

    public UUID getSalaryResultItemId() {
        return salaryResultItemId;
    }

    public void setSalaryResultItemId(UUID salaryResultItemId) {
        this.salaryResultItemId = salaryResultItemId;
    }

    public UUID getSalaryTemplateItemId() {
        return salaryTemplateItemId;
    }

    public void setSalaryTemplateItemId(UUID salaryTemplateItemId) {
        this.salaryTemplateItemId = salaryTemplateItemId;
    }

    public Double getMinValue() {
        return minValue;
    }

    public void setMinValue(Double minValue) {
        this.minValue = minValue;
    }

    public Double getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Double maxValue) {
        this.maxValue = maxValue;
    }

    /**
     * Factory method từ SearchDto cơ bản
     */
    public static SearchSalaryResultItemDetailDto fromSearchDto(SearchDto dto) {
        SearchSalaryResultItemDetailDto result = new SearchSalaryResultItemDetailDto();
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
