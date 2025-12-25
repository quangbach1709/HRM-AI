package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchSalaryTemplateItemDto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "displayOrder"; // Default sort by displayOrder
    private String sortDirection = "ASC";

    // ===== FILTER FIELDS =====
    private String code;
    private String name;
    private UUID salaryTemplateId;
    private Integer salaryItemType;

    /**
     * Factory method tạo từ SearchDto cơ bản
     */
    public static SearchSalaryTemplateItemDto fromSearchDto(SearchDto dto) {
        SearchSalaryTemplateItemDto result = new SearchSalaryTemplateItemDto();
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
            result.setParentId(dto.getParentId()); // Can use this as salaryTemplateId if generic paging is used
            result.setExportExcel(dto.getExportExcel());

            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }

            // Map parentId to salaryTemplateId if present
            if (dto.getParentId() != null) {
                result.setSalaryTemplateId(dto.getParentId());
            }
        }
        return result;
    }
}
