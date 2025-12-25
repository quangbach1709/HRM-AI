package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryTemplateItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateItemDto;

import java.util.List;
import java.util.UUID;

public interface SalaryTemplateItemService {

    // ===== PAGINATION =====
    PageResponse<SalaryTemplateItemDto> search(SearchSalaryTemplateItemDto dto);

    PageResponse<SalaryTemplateItemDto> paging(SearchDto dto);

    // ===== CRUD =====
    SalaryTemplateItemDto getById(UUID id);

    SalaryTemplateItemDto create(SalaryTemplateItemDto dto);

    SalaryTemplateItemDto update(UUID id, SalaryTemplateItemDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<SalaryTemplateItemDto> getAll();

    List<SalaryTemplateItemDto> exportToExcel(SearchSalaryTemplateItemDto dto);

    // For dropdowns or specific lists
    List<SalaryTemplateItemDto> getBySalaryTemplateId(UUID salaryTemplateId);
}
