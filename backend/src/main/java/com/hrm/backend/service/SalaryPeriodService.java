package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryPeriodDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryPeriodDto;

import java.util.List;
import java.util.UUID;

public interface SalaryPeriodService {

    // ===== PAGINATION =====
    PageResponse<SalaryPeriodDto> search(SearchSalaryPeriodDto dto);

    // ===== CRUD =====
    SalaryPeriodDto getById(UUID id);

    SalaryPeriodDto create(SalaryPeriodDto dto);

    SalaryPeriodDto update(UUID id, SalaryPeriodDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<SalaryPeriodDto> getAll();

    List<SalaryPeriodDto> exportToExcel(SearchSalaryPeriodDto dto);
}
