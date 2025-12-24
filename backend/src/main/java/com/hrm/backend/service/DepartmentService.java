package com.hrm.backend.service;

import com.hrm.backend.dto.DepartmentDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDepartmentDto;
import com.hrm.backend.dto.search.SearchDto;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {

    DepartmentDto saveOrUpdate(DepartmentDto departmentDto);

    DepartmentDto getById(UUID uuid);

    void deleteById(UUID uuid);

    /**
     * Phân trang với filter động - PHƯƠNG THỨC MỚI
     * Sử dụng SearchDepartmentDto để hỗ trợ đầy đủ tính năng
     */
    PageResponse<DepartmentDto> searchDepartments(SearchDepartmentDto dto);

    /**
     * Phân trang - BACKWARD COMPATIBLE với SearchDto cũ
     */
    PageResponse<DepartmentDto> pagingDepartments(SearchDto dto);

    /**
     * Lấy tất cả departments (flat list, không phân trang)
     * Dùng cho dropdown, select box...
     */
    List<DepartmentDto> getAllDepartments();

    /**
     * Lấy departments dạng cây (với subRows)
     */
    List<DepartmentDto> getDepartmentTree();
}
