package com.hrm.backend.dto.search;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchCandidateDto extends SearchDto {

    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // Filter fields
    private String candidateCode;
    private UUID positionId;
    private Integer candidateStatus;
    private UUID recruitmentRequestId;
    private UUID introducerId;
    private String personName;
    private String personEmail;
    private String personPhone;

    public static SearchCandidateDto fromSearchDto(SearchDto dto) {
        SearchCandidateDto result = new SearchCandidateDto();
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
