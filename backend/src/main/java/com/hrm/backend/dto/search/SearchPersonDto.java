package com.hrm.backend.dto.search;

import lombok.*;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchPersonDto extends SearchDto {

    // ===== SORTING =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private String firstName;
    private String lastName;
    private String displayName;
    private Integer gender;
    private String phoneNumber;
    private String email;
    private String idNumber;
    private String taxCode;
    private Integer educationLevel;
    private Integer maritalStatus;

    // Date range for birthDate
    private Date fromBirthDate;
    private Date toBirthDate;

    public static SearchPersonDto fromSearchDto(SearchDto dto) {
        SearchPersonDto result = new SearchPersonDto();
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
