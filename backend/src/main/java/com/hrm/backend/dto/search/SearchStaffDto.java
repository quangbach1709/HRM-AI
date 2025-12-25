package com.hrm.backend.dto.search;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchStaffDto extends SearchPersonDto {

    // ===== STAFF SPECIFIC FILTERS =====
    private String staffCode;
    private Integer employeeStatus;
    private Integer staffPhase;
    private UUID salaryTemplateId;
    private Boolean requireAttendance;
    private Boolean allowExternalIpTimekeeping;

    public static SearchStaffDto fromSearchDto(SearchDto dto) {
        SearchStaffDto result = new SearchStaffDto();
        if (dto != null) {
            // Base fields
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
