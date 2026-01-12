package com.hrm.backend.service;

import com.hrm.backend.dto.SystemConfigDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSystemConfigDto;
import com.hrm.backend.dto.search.SearchDto;

import java.util.List;
import java.util.UUID;

public interface SystemConfigService {

    /**
     * Phân trang với filter động
     */
    PageResponse<SystemConfigDto> search(SearchSystemConfigDto dto);


    /**
     * Lấy tất cả configs (flat list, không phân trang)
     */
    List<SystemConfigDto> getAllConfigs();

    /**
     * Lấy config theo ID
     */
    SystemConfigDto getById(UUID id);

    /**
     * Lấy config theo key
     */
    SystemConfigDto getByKey(String configKey);

    /**
     * Tạo mới hoặc cập nhật config
     */
    SystemConfigDto saveOrUpdate(SystemConfigDto dto);

    /**
     * Xóa config (soft delete)
     */
    void deleteById(UUID id);

    /**
     * Lấy giá trị config theo key
     */
    String getConfigValue(String configKey);

    /**
     * Lấy giá trị config theo key với giá trị mặc định
     */
    String getConfigValue(String configKey, String defaultValue);
}
