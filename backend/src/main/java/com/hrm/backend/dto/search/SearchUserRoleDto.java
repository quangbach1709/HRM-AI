package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchUserRoleDto extends SearchDto {
    private UUID userId;
    private UUID roleId;

    // Sort
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    public static SearchUserRoleDto fromSearchDto(SearchDto dto) {
        SearchUserRoleDto result = new SearchUserRoleDto();
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
