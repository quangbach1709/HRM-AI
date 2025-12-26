package com.hrm.backend.service;


import com.hrm.backend.dto.StaffLabourAgreementDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchStaffLabourAgreementDto;

import java.util.List;
import java.util.UUID;

public interface StaffLabourAgreementService {
    PageResponse<StaffLabourAgreementDto> search(SearchStaffLabourAgreementDto dto);

    PageResponse<StaffLabourAgreementDto> paging(SearchDto dto);

    StaffLabourAgreementDto getById(UUID id);

    StaffLabourAgreementDto create(StaffLabourAgreementDto dto);

    StaffLabourAgreementDto update(UUID id, StaffLabourAgreementDto dto);

    void delete(UUID id);

    List<StaffLabourAgreementDto> getAll();

    List<StaffLabourAgreementDto> exportToExcel(SearchStaffLabourAgreementDto dto);
}
