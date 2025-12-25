package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryTemplateItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateItemDto;
import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.entity.SalaryTemplateItem;
import com.hrm.backend.repository.SalaryTemplateRepository;
import com.hrm.backend.repository.SalaryTemplateItemRepository;
import com.hrm.backend.service.SalaryTemplateItemService;
import com.hrm.backend.specification.SalaryTemplateItemSpecification;
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
public class SalaryTemplateItemServiceImpl implements SalaryTemplateItemService {

    private final SalaryTemplateItemRepository repository;
    private final SalaryTemplateRepository salaryTemplateRepository;
    private final SalaryTemplateItemSpecification specification;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<SalaryTemplateItemDto> search(SearchSalaryTemplateItemDto dto) {
        if (dto == null) {
            dto = new SearchSalaryTemplateItemDto();
        }

        Specification<SalaryTemplateItem> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryTemplateItem> page = repository.findAll(spec, pageable);
        // Pass false to avoid deep recursion if not needed, or true if we want template
        // details
        Page<SalaryTemplateItemDto> dtoPage = page.map(e -> new SalaryTemplateItemDto(e, true));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<SalaryTemplateItemDto> paging(SearchDto dto) {
        SearchSalaryTemplateItemDto searchDto = SearchSalaryTemplateItemDto.fromSearchDto(dto);
        return search(searchDto);
    }

    // ==================== GET ====================

    @Override
    public SalaryTemplateItemDto getById(UUID id) {
        return repository.findById(id)
                .map(e -> new SalaryTemplateItemDto(e, true))
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplateItem not found: " + id));
    }

    @Override
    public List<SalaryTemplateItemDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new SalaryTemplateItemDto(e, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<SalaryTemplateItemDto> getBySalaryTemplateId(UUID salaryTemplateId) {
        return repository.findBySalaryTemplateId(salaryTemplateId).stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new SalaryTemplateItemDto(e, false))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public SalaryTemplateItemDto create(SalaryTemplateItemDto dto) {
        validateForCreate(dto);

        SalaryTemplateItem entity = new SalaryTemplateItem();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new SalaryTemplateItemDto(entity, true);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public SalaryTemplateItemDto update(UUID id, SalaryTemplateItemDto dto) {
        SalaryTemplateItem entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplateItem not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new SalaryTemplateItemDto(entity, true);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryTemplateItem entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryTemplateItem not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<SalaryTemplateItemDto> exportToExcel(SearchSalaryTemplateItemDto dto) {
        if (dto == null) {
            dto = new SearchSalaryTemplateItemDto();
        }

        Specification<SalaryTemplateItem> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new SalaryTemplateItemDto(e, true))
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private void mapDtoToEntity(SalaryTemplateItemDto dto, SalaryTemplateItem entity) {
        if (StringUtils.hasText(dto.getCode()))
            entity.setCode(dto.getCode().trim());
        if (StringUtils.hasText(dto.getName()))
            entity.setName(dto.getName().trim());
        if (dto.getDisplayOrder() != null)
            entity.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getSalaryItemType() != null)
            entity.setSalaryItemType(dto.getSalaryItemType());
        if (dto.getDefaultAmount() != null)
            entity.setDefaultAmount(dto.getDefaultAmount());
        if (dto.getFormula() != null)
            entity.setFormula(dto.getFormula());

        if (dto.getSalaryTemplate() != null && dto.getSalaryTemplate().getId() != null) {
            SalaryTemplate template = salaryTemplateRepository.findById(dto.getSalaryTemplate().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryTemplate not found"));
            entity.setSalaryTemplate(template);
        }
    }

    private void validateForCreate(SalaryTemplateItemDto dto) {
        if (!StringUtils.hasText(dto.getCode()))
            throw new IllegalArgumentException("Mã mục lương là bắt buộc");
        if (!StringUtils.hasText(dto.getName()))
            throw new IllegalArgumentException("Tên mục lương là bắt buộc");
        if (dto.getSalaryTemplate() == null || dto.getSalaryTemplate().getId() == null) {
            throw new IllegalArgumentException("Mẫu lương là bắt buộc");
        }

        // Check unique code within the same template
        if (repository.existsByCodeAndSalaryTemplateId(dto.getCode().trim(), dto.getSalaryTemplate().getId())) {
            throw new IllegalArgumentException("Mã mục lương '" + dto.getCode() + "' đã tồn tại trong mẫu lương này");
        }
    }

    private void validateForUpdate(SalaryTemplateItemDto dto, SalaryTemplateItem existing) {
        // If changing code, check uniqueness
        // Also check if changing template (unlikely but possible)
        UUID templateId = existing.getSalaryTemplate().getId();
        if (dto.getSalaryTemplate() != null && dto.getSalaryTemplate().getId() != null) {
            templateId = dto.getSalaryTemplate().getId();
        }

        if (StringUtils.hasText(dto.getCode()) &&
                (!dto.getCode().trim().equals(existing.getCode())
                        || !templateId.equals(existing.getSalaryTemplate().getId()))
                &&
                repository.existsByCodeAndSalaryTemplateIdAndIdNot(dto.getCode().trim(), templateId,
                        existing.getId())) {
            throw new IllegalArgumentException("Mã mục lương '" + dto.getCode() + "' đã tồn tại trong mẫu lương này");
        }
    }
}
