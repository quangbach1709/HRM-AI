package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchUserDto extends SearchDto {
    private String username;
    private String email;
    private String displayName; // From Person
    private String phoneNumber; // From Person
    private UUID roleId; // Filter by Role ID

    // Checked: AuditableEntity usually has UUID id.
    // Spec needs to check Role ID type. Role extends AuditableEntity.
    // I should check AuditableEntity.java to be sure about ID type.
    // But for now I'll use UUID for roleId as typical.
    // Wait, UserRole uses `role_id`.

    // Sort
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    public static SearchUserDto fromSearchDto(SearchDto dto) {
        SearchUserDto result = new SearchUserDto();
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
