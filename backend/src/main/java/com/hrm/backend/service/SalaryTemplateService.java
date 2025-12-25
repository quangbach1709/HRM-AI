package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryTemplateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateDto;

import java.util.List;
import java.util.UUID;

public interface SalaryTemplateService {

    // ===== PAGINATION =====
    PageResponse<SalaryTemplateDto> search(SearchSalaryTemplateDto dto);

    PageResponse<SalaryTemplateDto> paging(SearchDto dto);

    // ===== CRUD =====
    SalaryTemplateDto getById(UUID id);

    SalaryTemplateDto create(SalaryTemplateDto dto);

    SalaryTemplateDto update(UUID id, SalaryTemplateDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<SalaryTemplateDto> getAll();

    List<SalaryTemplateDto> exportToExcel(SearchSalaryTemplateDto dto);
}
