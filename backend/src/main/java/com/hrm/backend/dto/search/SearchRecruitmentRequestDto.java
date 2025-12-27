package com.hrm.backend.dto.search;


import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchRecruitmentRequestDto extends SearchDto {

    private String sortBy = "proposalDate";
    private String sortDirection = "DESC";

    private UUID positionId;
    private UUID proposerId;

    public static SearchRecruitmentRequestDto fromSearchDto(SearchDto dto) {
        SearchRecruitmentRequestDto result = new SearchRecruitmentRequestDto();
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
