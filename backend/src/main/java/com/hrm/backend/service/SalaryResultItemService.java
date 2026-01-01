package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryResultItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDto;

import java.util.List;
import java.util.UUID;

public interface SalaryResultItemService {

    // Pagination
    PageResponse<SalaryResultItemDto> search(SearchSalaryResultItemDto dto);

    // CRUD
    SalaryResultItemDto getById(UUID id);

    SalaryResultItemDto create(SalaryResultItemDto dto);

    SalaryResultItemDto update(UUID id, SalaryResultItemDto dto);

    void delete(UUID id);

    // Additional
    List<SalaryResultItemDto> getAll();

    List<SalaryResultItemDto> getBySalaryResultId(UUID salaryResultId);

    List<SalaryResultItemDto> exportToExcel(SearchSalaryResultItemDto dto);
}
