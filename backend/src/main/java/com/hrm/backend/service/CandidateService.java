package com.hrm.backend.service;

import com.hrm.backend.dto.CandidateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchCandidateDto;

import java.util.List;
import java.util.UUID;

public interface CandidateService {

    PageResponse<CandidateDto> search(SearchCandidateDto dto);

    PageResponse<CandidateDto> paging(SearchDto dto);

    CandidateDto getById(UUID id);

    CandidateDto create(CandidateDto dto);

    CandidateDto update(UUID id, CandidateDto dto);

    void delete(UUID id);

    List<CandidateDto> getAll();

    List<CandidateDto> exportToExcel(SearchCandidateDto dto);
}
