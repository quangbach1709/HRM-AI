package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryResultItemDetailDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDetailDto;

import java.util.List;
import java.util.UUID;

public interface SalaryResultItemDetailService {

    // Pagination
    PageResponse<SalaryResultItemDetailDto> search(SearchSalaryResultItemDetailDto dto);

    PageResponse<SalaryResultItemDetailDto> searchForCurrentUser(SearchSalaryResultItemDetailDto dto);

    // CRUD
    SalaryResultItemDetailDto getById(UUID id);

    SalaryResultItemDetailDto create(SalaryResultItemDetailDto dto);

    SalaryResultItemDetailDto update(UUID id, SalaryResultItemDetailDto dto);

    void delete(UUID id);

    // Additional
    List<SalaryResultItemDetailDto> getAll();

    List<SalaryResultItemDetailDto> getBySalaryResultItemId(UUID salaryResultItemId);

    List<SalaryResultItemDetailDto> exportToExcel(SearchSalaryResultItemDetailDto dto);
}
