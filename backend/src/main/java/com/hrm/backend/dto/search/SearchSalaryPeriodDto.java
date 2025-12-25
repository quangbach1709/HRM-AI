package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchSalaryPeriodDto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private String code;
    private String name;
    private Integer salaryPeriodStatus;

    // Filter by specific date range (optional, extends base from/to which are
    // usually for createdAt)
    private Date startDateFrom;
    private Date startDateTo;

    private Date endDateFrom;
    private Date endDateTo;

    /**
     * Factory method tạo từ SearchDto cơ bản
     */
    public static SearchSalaryPeriodDto fromSearchDto(SearchDto dto) {
        SearchSalaryPeriodDto result = new SearchSalaryPeriodDto();
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
