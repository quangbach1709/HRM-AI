package com.hrm.backend.service;

import com.hrm.backend.dto.StaffWorkScheduleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffWorkScheduleDto;

import java.util.List;
import java.util.UUID;

public interface StaffWorkScheduleService {

    // Pagination
    PageResponse<StaffWorkScheduleDto> search(SearchStaffWorkScheduleDto dto);

    PageResponse<StaffWorkScheduleDto> paging(SearchDto dto);

    // CRUD
    StaffWorkScheduleDto getById(UUID id);

    StaffWorkScheduleDto create(StaffWorkScheduleDto dto);

    StaffWorkScheduleDto update(UUID id, StaffWorkScheduleDto dto);

    void delete(UUID id);

    // Additional
    List<StaffWorkScheduleDto> getAll();

    List<StaffWorkScheduleDto> exportToExcel(SearchStaffWorkScheduleDto dto);
}
