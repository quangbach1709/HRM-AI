package com.hrm.backend.dto.search;


import lombok.*;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchStaffLabourAgreementDto extends SearchDto {

    private String sortBy = "createDate";
    private String sortDirection = "DESC";

    private UUID staffId;
    private String labourAgreementNumber;
    private Integer contractType;
    private Integer agreementStatus;

    private Date fromStartDate;
    private Date toStartDate;

    private Date fromEndDate;
    private Date toEndDate;

    private Date fromSignedDate;
    private Date toSignedDate;

    public static SearchStaffLabourAgreementDto fromSearchDto(SearchDto dto) {
        SearchStaffLabourAgreementDto result = new SearchStaffLabourAgreementDto();
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
