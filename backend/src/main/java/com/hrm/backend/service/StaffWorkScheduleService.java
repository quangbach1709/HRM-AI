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

    // CRUD
    StaffWorkScheduleDto getById(UUID id);

    StaffWorkScheduleDto create(StaffWorkScheduleDto dto);

    StaffWorkScheduleDto update(UUID id, StaffWorkScheduleDto dto);

    void delete(UUID id);

    // Additional
    List<StaffWorkScheduleDto> getAll();

    List<StaffWorkScheduleDto> exportToExcel(SearchStaffWorkScheduleDto dto);

    /**
     * Unified attendance method for both check-in and check-out.
     * Logic:
     * - If no StaffWorkSchedule exists for staff + today -> Create new (check-in)
     * - If exists but checkIn is null -> HR pre-created record, do check-in
     * - If exists and checkIn has value -> Do check-out
     */
    StaffWorkScheduleDto attendance(StaffWorkScheduleDto dto);
}
