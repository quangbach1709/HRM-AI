package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

/**
 * DTO tìm kiếm cho SalaryTemplate
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchSalaryTemplateDto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private String code;
    private String name;
    private String description;

    /**
     * Factory method tạo từ SearchDto cơ bản
     */
    public static SearchSalaryTemplateDto fromSearchDto(SearchDto dto) {
        SearchSalaryTemplateDto result = new SearchSalaryTemplateDto();
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

            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
