package com.hrm.backend.dto.search;


import lombok.*;

import java.util.UUID;

/**
 * DTO tìm kiếm cho Position
 * Extends SearchDto để kế thừa các field cơ bản
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchPositionDto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER ĐẶC THÙ CHO POSITION =====
    private UUID departmentId;
    private UUID staffId;
    private Boolean isMain;
    private String code;
    private String name;

    /**
     * Tạo từ SearchDto cơ bản (backward compatible)
     */
    public static SearchPositionDto fromSearchDto(SearchDto dto) {
        SearchPositionDto result = new SearchPositionDto();
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
            result.setParentId(dto.getParentId()); // Note: Position might not use parentId directly but SearchDto has
                                                   // it
            result.setExportExcel(dto.getExportExcel());

            // Map orderBy sang sortDirection
            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
