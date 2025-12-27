package com.hrm.backend.service;

import com.hrm.backend.dto.RecruitmentRequestDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchRecruitmentRequestDto;

import java.util.List;
import java.util.UUID;

public interface RecruitmentRequestService {

    PageResponse<RecruitmentRequestDto> search(SearchRecruitmentRequestDto dto);

    PageResponse<RecruitmentRequestDto> paging(SearchDto dto);

    RecruitmentRequestDto getById(UUID id);

    RecruitmentRequestDto create(RecruitmentRequestDto dto);

    RecruitmentRequestDto update(UUID id, RecruitmentRequestDto dto);

    void delete(UUID id);

    List<RecruitmentRequestDto> getAll();

    List<RecruitmentRequestDto> exportToExcel(SearchRecruitmentRequestDto dto);
}
