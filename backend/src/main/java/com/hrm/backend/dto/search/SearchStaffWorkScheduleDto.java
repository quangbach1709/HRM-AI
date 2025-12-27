package com.hrm.backend.dto.search;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchStaffWorkScheduleDto extends SearchDto {

    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // Filter fields
    private Integer shiftWorkType;
    private Integer shiftWorkStatus;
    private UUID staffId;
    private UUID coordinatorId;
    private Boolean isLocked;

    // Additional date filters if needed (e.g. checkIn From/To)
    // Inherited from SearchDto: fromDate, toDate (can be used for checkIn range)

    public static SearchStaffWorkScheduleDto fromSearchDto(SearchDto dto) {
        SearchStaffWorkScheduleDto result = new SearchStaffWorkScheduleDto();
        if (dto != null) {
            result.setId(dto.getId()); // inherited
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result.setKeyword(dto.getKeyword());
            result.setFromDate(dto.getFromDate());
            result.setToDate(dto.getToDate());
            result.setVoided(dto.getVoided());
            result.setOrderBy(dto.getOrderBy());

            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ? "ASC" : "DESC");
            }
        }
        return result;
    }
}
