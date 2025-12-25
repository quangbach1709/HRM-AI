package com.hrm.backend.service;

import com.hrm.backend.dto.RoleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchRoleDto;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    // ===== PAGINATION =====
    PageResponse<RoleDto> search(SearchRoleDto dto);

    PageResponse<RoleDto> paging(SearchDto dto);

    // ===== CRUD =====
    RoleDto getById(UUID id);

    RoleDto create(RoleDto dto);

    RoleDto update(UUID id, RoleDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<RoleDto> getAll();

    List<RoleDto> exportToExcel(SearchRoleDto dto);
}
