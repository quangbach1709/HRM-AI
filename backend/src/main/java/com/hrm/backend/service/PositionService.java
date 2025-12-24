package com.hrm.backend.service;

import java.util.List;
import java.util.UUID;

import com.hrm.backend.dto.PositionDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchPositionDto;
import com.hrm.backend.dto.search.SearchDto;

public interface PositionService {
    PositionDto saveOrUpdate(PositionDto positionDto);

    PositionDto getById(UUID uuid);

    void deleteById(UUID uuid);

    /**
     * Phân trang với filter động - PHƯƠNG THỨC MỚI
     * Sử dụng SearchPositionDto để hỗ trợ đầy đủ tính năng
     */
    PageResponse<PositionDto> searchPositions(SearchPositionDto dto);

    /**
     * Phân trang - BACKWARD COMPATIBLE với SearchDto cũ
     */
    PageResponse<PositionDto> pagingPositions(SearchDto dto);

    /**
     * Lấy tất cả positions (flat list, không phân trang)
     */
    List<PositionDto> getAllPositions();

    /**
     * Lấy tất cả positions theo department
     */
    List<PositionDto> getPositionsByDepartment(UUID departmentId);
}
