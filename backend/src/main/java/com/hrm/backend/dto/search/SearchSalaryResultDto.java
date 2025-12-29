package com.hrm.backend.dto.search;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchSalaryResultDto extends SearchDto {
    private String name;
    private UUID salaryPeriodId;
    private UUID salaryTemplateId;

    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    public static SearchSalaryResultDto fromSearchDto(SearchDto dto) {
        SearchSalaryResultDto result = new SearchSalaryResultDto();
        if (dto != null) {
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result.setKeyword(dto.getKeyword());
            result.setVoided(dto.getVoided());

            // Map common fields if needed, generally SearchDto fields are transferred
            // manually or via superclass if they matched
        }
        return result;
    }
}
