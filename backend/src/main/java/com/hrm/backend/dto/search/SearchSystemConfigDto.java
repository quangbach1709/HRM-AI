package com.hrm.backend.dto.search;

/**
 * DTO tìm kiếm cho SystemConfig
 * Extends SearchDto để kế thừa các field cơ bản
 */
public class SearchSystemConfigDto extends SearchDto {

    // ===== SORTING =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER ĐẶC THÙ CHO SYSTEM CONFIG =====
    private String configKey;
    private Integer configType;

    public SearchSystemConfigDto() {
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

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public Integer getConfigType() {
        return configType;
    }

    public void setConfigType(Integer configType) {
        this.configType = configType;
    }

    /**
     * Builder method để tạo từ SearchDto cơ bản
     */
    public static SearchSystemConfigDto fromSearchDto(SearchDto dto) {
        SearchSystemConfigDto result = new SearchSystemConfigDto();
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
            result.setExportExcel(dto.getExportExcel());

            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
