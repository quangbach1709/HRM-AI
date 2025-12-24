package com.hrm.backend.service;


import com.hrm.backend.dto.DepartmentDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.entity.Department;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    DepartmentDto saveOrUpdate(DepartmentDto departmentDto);
    DepartmentDto getById(UUID uuid);
    void deleteById(UUID uuid);
    List<DepartmentDto> searchByKeyword(SearchDto searchDto);


}
