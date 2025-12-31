package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryPeriodDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryPeriodDto;
import com.hrm.backend.entity.SalaryPeriod;
import com.hrm.backend.repository.SalaryPeriodRepository;
import com.hrm.backend.service.SalaryPeriodService;
import com.hrm.backend.specification.SalaryPeriodSpecification;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryPeriodServiceImpl implements SalaryPeriodService {

    private final SalaryPeriodRepository repository;
    private final SalaryPeriodSpecification specification;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<SalaryPeriodDto> search(SearchSalaryPeriodDto dto) {
        if (dto == null) {
            dto = new SearchSalaryPeriodDto();
        }

        Specification<SalaryPeriod> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryPeriod> page = repository.findAll(spec, pageable);
        Page<SalaryPeriodDto> dtoPage = page.map(SalaryPeriodDto::new);

        return PageResponse.of(dtoPage);
    }


    // ==================== GET ====================

    @Override
    public SalaryPeriodDto getById(UUID id) {
        return repository.findById(id)
                .map(SalaryPeriodDto::new)
                .orElseThrow(() -> new EntityNotFoundException("SalaryPeriod not found: " + id));
    }

    @Override
    public List<SalaryPeriodDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(SalaryPeriodDto::new)
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public SalaryPeriodDto create(SalaryPeriodDto dto) {
        validateForCreate(dto);

        SalaryPeriod entity = SalaryPeriodDto.toEntity(dto);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);
        if (entity.getSalaryPeriodStatus() == null) {
            entity.setSalaryPeriodStatus(HRConstants.SalaryPeriodStatus.DRAFT.getValue());
        }

        entity = repository.save(entity);
        return new SalaryPeriodDto(entity);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public SalaryPeriodDto update(UUID id, SalaryPeriodDto dto) {
        SalaryPeriod entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryPeriod not found: " + id));

        validateForUpdate(dto, entity);
        dto.setId(id);
        entity = SalaryPeriodDto.toEntity(dto);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new SalaryPeriodDto(entity);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryPeriod entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryPeriod not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<SalaryPeriodDto> exportToExcel(SearchSalaryPeriodDto dto) {
        if (dto == null) {
            dto = new SearchSalaryPeriodDto();
        }

        Specification<SalaryPeriod> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(SalaryPeriodDto::new)
                .collect(Collectors.toList());
    }

    private void validateForCreate(SalaryPeriodDto dto) {
        if (!StringUtils.hasText(dto.getCode()))
            throw new IllegalArgumentException("Mã kỳ lương là bắt buộc");
        if (!StringUtils.hasText(dto.getName()))
            throw new IllegalArgumentException("Tên kỳ lương là bắt buộc");
        if (dto.getStartDate() == null)
            throw new IllegalArgumentException("Ngày bắt đầu là bắt buộc");
        if (dto.getEndDate() == null)
            throw new IllegalArgumentException("Ngày kết thúc là bắt buộc");

        if (dto.getStartDate().after(dto.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        if (repository.existsByCode(dto.getCode().trim())) {
            throw new IllegalArgumentException("Mã kỳ lương đã tồn tại: " + dto.getCode());
        }
    }

    private void validateForUpdate(SalaryPeriodDto dto, SalaryPeriod existing) {
        if (StringUtils.hasText(dto.getCode()) &&
                !dto.getCode().trim().equals(existing.getCode()) &&
                repository.existsByCode(dto.getCode().trim())) {
            throw new IllegalArgumentException("Mã kỳ lương đã tồn tại: " + dto.getCode());
        }

        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            if (dto.getStartDate().after(dto.getEndDate())) {
                throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
            }
        }
    }
}
