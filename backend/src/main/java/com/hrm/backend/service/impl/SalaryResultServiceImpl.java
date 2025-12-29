package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryResultDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultDto;
import com.hrm.backend.entity.SalaryResult;
import com.hrm.backend.entity.SalaryPeriod;
import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.repository.SalaryResultRepository;
import com.hrm.backend.repository.SalaryPeriodRepository;
import com.hrm.backend.repository.SalaryTemplateRepository;
import com.hrm.backend.service.SalaryResultService;
import com.hrm.backend.specification.SalaryResultSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryResultServiceImpl implements SalaryResultService {

    private final SalaryResultRepository repository;
    private final SalaryResultSpecification specification;
    private final SalaryPeriodRepository salaryPeriodRepository;
    private final SalaryTemplateRepository salaryTemplateRepository;

    @Override
    public PageResponse<SalaryResultDto> search(SearchSalaryResultDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultDto();
        }

        Specification<SalaryResult> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryResult> page = repository.findAll(spec, pageable);
        // Map to DTO, false for isGetFull to avoid fetching lines if not needed in list
        Page<SalaryResultDto> dtoPage = page.map(e -> new SalaryResultDto(e, false));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<SalaryResultDto> paging(SearchDto dto) {
        SearchSalaryResultDto searchDto = SearchSalaryResultDto.fromSearchDto(dto);
        return search(searchDto);
    }

    @Override
    public SalaryResultDto getById(UUID id) {
        return repository.findById(id)
                .map(e -> new SalaryResultDto(e, true))
                .orElseThrow(() -> new EntityNotFoundException("SalaryResult not found: " + id));
    }

    @Override
    public List<SalaryResultDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new SalaryResultDto(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SalaryResultDto create(SalaryResultDto dto) {
        validateForCreate(dto);

        SalaryResult entity = new SalaryResult();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new SalaryResultDto(entity, true);
    }

    @Override
    @Transactional
    public SalaryResultDto update(UUID id, SalaryResultDto dto) {
        SalaryResult entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResult not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new SalaryResultDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryResult entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResult not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<SalaryResultDto> exportToExcel(SearchSalaryResultDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultDto();
        }

        Specification<SalaryResult> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new SalaryResultDto(e, false))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(SalaryResultDto dto, SalaryResult entity) {
        if (StringUtils.hasText(dto.getName())) {
            entity.setName(dto.getName());
        }

        if (dto.getSalaryPeriod() != null && dto.getSalaryPeriod().getId() != null) {
            SalaryPeriod period = salaryPeriodRepository.findById(dto.getSalaryPeriod().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryPeriod not found"));
            entity.setSalaryPeriod(period);
        }

        if (dto.getSalaryTemplate() != null && dto.getSalaryTemplate().getId() != null) {
            SalaryTemplate template = salaryTemplateRepository.findById(dto.getSalaryTemplate().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryTemplate not found"));
            entity.setSalaryTemplate(template);
        }
    }

    private void validateForCreate(SalaryResultDto dto) {
        if (!StringUtils.hasText(dto.getName())) {
            throw new IllegalArgumentException("Name is required");
        }
        if (dto.getSalaryPeriod() == null || dto.getSalaryPeriod().getId() == null) {
            throw new IllegalArgumentException("Salary Period is required");
        }
        if (dto.getSalaryTemplate() == null || dto.getSalaryTemplate().getId() == null) {
            throw new IllegalArgumentException("Salary Template is required");
        }
    }

    private void validateForUpdate(SalaryResultDto dto, SalaryResult entity) {
        // Add specific validation for update if needed
    }
}
