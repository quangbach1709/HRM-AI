package com.hrm.backend.service;

import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.StaffDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffDto;
import com.hrm.backend.entity.Staff;

import java.util.List;
import java.util.UUID;

public interface StaffService {
    PageResponse<StaffDto> search(SearchStaffDto dto);

    PageResponse<StaffDto> paging(SearchDto dto);

    StaffDto getById(UUID id);

    StaffDto create(StaffDto dto);

    StaffDto update(UUID id, StaffDto dto);

    void delete(UUID id);

    List<StaffDto> getAll();

    List<StaffDto> exportToExcel(SearchStaffDto dto);

    StaffDto getCurrentStaff();

    Staff getCurrentStaffEntity();

    String generateStaffCode();
}
