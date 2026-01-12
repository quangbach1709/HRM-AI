package com.hrm.backend.service.impl;

import com.hrm.backend.config.SystemConfigLoader;
import com.hrm.backend.dto.SystemConfigDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSystemConfigDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.entity.SystemConfig;
import com.hrm.backend.repository.SystemConfigRepository;
import com.hrm.backend.service.SystemConfigService;
import com.hrm.backend.specification.SystemConfigSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository repository;
    private final SystemConfigSpecification specification;
    private final SystemConfigLoader configLoader;

    // ===== PAGINATION =====

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SystemConfigDto> search(SearchSystemConfigDto dto) {
        if (dto == null) {
            dto = new SearchSystemConfigDto();
        }

        Specification<SystemConfig> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);
        Page<SystemConfig> page = repository.findAll(spec, pageable);
        Page<SystemConfigDto> dtoPage = page.map(SystemConfigDto::new);

        return PageResponse.of(dtoPage);
    }

    // ===== CRUD =====

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigDto> getAllConfigs() {
        return repository.findByVoidedFalseOrderByConfigKeyAsc()
                .stream()
                .map(SystemConfigDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigDto getById(UUID id) {
        SystemConfig entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cấu hình với ID: " + id));

        if (entity.getVoided()) {
            throw new EntityNotFoundException("Không tìm thấy cấu hình với ID: " + id);
        }

        return new SystemConfigDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigDto getByKey(String configKey) {
        SystemConfig entity = repository.findByConfigKeyAndVoidedFalse(configKey)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cấu hình với key: " + configKey));

        return new SystemConfigDto(entity);
    }

    @Override
    @Transactional
    public SystemConfigDto saveOrUpdate(SystemConfigDto dto) {
        SystemConfig entity;

        if (dto.getId() != null) {
            // Update existing
            entity = repository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cấu hình với ID: " + dto.getId()));

            // Check config key uniqueness if changed
            if (dto.getConfigKey() != null && !dto.getConfigKey().equals(entity.getConfigKey())) {
                if (repository.existsByConfigKey(dto.getConfigKey())) {
                    throw new IllegalArgumentException("Config key đã tồn tại: " + dto.getConfigKey());
                }
            }
        } else {
            // Create new
            entity = new SystemConfig();
            entity.setVoided(false);

            // Validate config key uniqueness
            if (dto.getConfigKey() != null && repository.existsByConfigKey(dto.getConfigKey())) {
                throw new IllegalArgumentException("Config key đã tồn tại: " + dto.getConfigKey());
            }

            // Generate code if not provided
            if (dto.getCode() == null || dto.getCode().isEmpty()) {
                entity.setCode("CFG-" + System.currentTimeMillis());
            }
        }

        // Update fields
        if (dto.getCode() != null && !dto.getCode().isEmpty()) {
            entity.setCode(dto.getCode());
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setConfigKey(dto.getConfigKey());
        entity.setConfigValue(dto.getConfigValue());
        entity.setNumberOfZero(dto.getNumberOfZero());
        entity.setNote(dto.getNote());
        entity.setConfigType(dto.getConfigType());

        SystemConfig saved = repository.save(entity);

        // Refresh config cache
        configLoader.refresh();

        return new SystemConfigDto(saved);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        SystemConfig entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cấu hình với ID: " + id));

        // Soft delete
        entity.setVoided(true);
        repository.save(entity);

        // Refresh config cache
        configLoader.refresh();
    }

    // ===== HELPER METHODS =====

    @Override
    @Transactional(readOnly = true)
    public String getConfigValue(String configKey) {
        return getConfigValue(configKey, null);
    }

    @Override
    @Transactional(readOnly = true)
    public String getConfigValue(String configKey, String defaultValue) {
        // First try from cache
        String cachedValue = SystemConfigLoader.getValue(configKey);
        if (cachedValue != null) {
            return cachedValue;
        }

        // Fallback to database
        return repository.findByConfigKeyAndVoidedFalse(configKey)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }
}
