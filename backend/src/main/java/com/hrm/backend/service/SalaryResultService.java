package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryResultDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultDto;

import java.util.List;
import java.util.UUID;

public interface SalaryResultService {
    PageResponse<SalaryResultDto> search(SearchSalaryResultDto dto);

    SalaryResultDto getById(UUID id);

    SalaryResultDto create(SalaryResultDto dto);

    SalaryResultDto update(UUID id, SalaryResultDto dto);

    void delete(UUID id);

    List<SalaryResultDto> getAll();

    List<SalaryResultDto> exportToExcel(SearchSalaryResultDto dto);
}
