package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SearchCertificateDto extends SearchDto {

    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    private String code;
    private UUID personId;

    public static SearchCertificateDto fromSearchDto(SearchDto dto) {
        SearchCertificateDto result = new SearchCertificateDto();
        if (dto != null) {
            result.setId(dto.getId());
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
