package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryTemplateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateDto;
import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.repository.SalaryTemplateRepository;
import com.hrm.backend.service.SalaryTemplateService;
import com.hrm.backend.specification.SalaryTemplateSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryTemplateServiceImpl implements SalaryTemplateService {

    private final SalaryTemplateRepository repository;
    private final SalaryTemplateSpecification specification;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<SalaryTemplateDto> search(SearchSalaryTemplateDto dto) {
        if (dto == null) {
            dto = new SearchSalaryTemplateDto();
        }

        Specification<SalaryTemplate> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryTemplate> page = repository.findAll(spec, pageable);
        Page<SalaryTemplateDto> dtoPage = page.map(entity -> new SalaryTemplateDto(entity, false));

        return PageResponse.of(dtoPage);
    }


    // ==================== GET ====================

    @Override
    public SalaryTemplateDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new SalaryTemplateDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplate not found: " + id));
    }

    @Override
    public List<SalaryTemplateDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new SalaryTemplateDto(entity, false))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public SalaryTemplateDto create(SalaryTemplateDto dto) {
        validateForCreate(dto);

        if (!StringUtils.hasText(dto.getCode())) {
            dto.setCode("SAL-" + System.currentTimeMillis());
        }

        SalaryTemplate entity = SalaryTemplateDto.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new SalaryTemplateDto(entity, false);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public SalaryTemplateDto update(UUID id, SalaryTemplateDto dto) {
        SalaryTemplate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplate not found: " + id));

        validateForUpdate(dto, entity);
        entity = SalaryTemplateDto.toEntity(dto);
        entity.setUpdatedAt(LocalDateTime.now());
        entity = repository.save(entity);
        return new SalaryTemplateDto(entity, false);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryTemplate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplate not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<SalaryTemplateDto> exportToExcel(SearchSalaryTemplateDto dto) {
        if (dto == null) {
            dto = new SearchSalaryTemplateDto();
        }

        Specification<SalaryTemplate> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new SalaryTemplateDto(entity, false))
                .collect(Collectors.toList());
    }


    private void validateForCreate(SalaryTemplateDto dto) {
        if (!StringUtils.hasText(dto.getCode())) {
            throw new IllegalArgumentException("Mã mẫu lương là bắt buộc");
        }
        if (!StringUtils.hasText(dto.getName())) {
            throw new IllegalArgumentException("Tên mẫu lương là bắt buộc");
        }

        if (repository.existsByCode(dto.getCode().trim())) {
            throw new IllegalArgumentException("Mã mẫu lương đã tồn tại: " + dto.getCode());
        }
    }

    private void validateForUpdate(SalaryTemplateDto dto, SalaryTemplate existing) {
        if (StringUtils.hasText(dto.getCode()) &&
                !dto.getCode().trim().equals(existing.getCode()) &&
                repository.existsByCode(dto.getCode().trim())) {
            throw new IllegalArgumentException("Mã mẫu lương đã tồn tại: " + dto.getCode());
        }
    }
}
