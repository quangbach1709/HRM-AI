package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryResultItemDetailDto;
import com.hrm.backend.dto.StaffDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDetailDto;
import com.hrm.backend.entity.*;
import com.hrm.backend.repository.SalaryResultItemDetailRepository;
import com.hrm.backend.repository.SalaryResultItemRepository;
import com.hrm.backend.repository.SalaryTemplateItemRepository;
import com.hrm.backend.service.SalaryResultItemDetailService;
import com.hrm.backend.service.StaffService;
import com.hrm.backend.service.UserService;
import com.hrm.backend.specification.SalaryResultItemDetailSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryResultItemDetailServiceImpl implements SalaryResultItemDetailService {

    private final SalaryResultItemDetailRepository repository;
    private final SalaryResultItemDetailSpecification specification;
    private final SalaryResultItemRepository salaryResultItemRepository;
    private final SalaryTemplateItemRepository salaryTemplateItemRepository;
    private final StaffService staffService;

    @Override
    public PageResponse<SalaryResultItemDetailDto> search(SearchSalaryResultItemDetailDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultItemDetailDto();
        }

        Specification<SalaryResultItemDetail> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryResultItemDetail> page = repository.findAll(spec, pageable);
        Page<SalaryResultItemDetailDto> dtoPage = page.map(e -> new SalaryResultItemDetailDto(e, true, true));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<SalaryResultItemDetailDto> searchForCurrentUser(SearchSalaryResultItemDetailDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultItemDetailDto();
        }

        StaffDto currentStaff = staffService.getCurrentStaff();
        dto.setStaffId(currentStaff.getId());

        return search(dto);
    }

    @Override
    public SalaryResultItemDetailDto getById(UUID id) {
        return repository.findById(id)
                .map(e -> new SalaryResultItemDetailDto(e, true, true))
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItemDetail not found: " + id));
    }

    @Override
    public List<SalaryResultItemDetailDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new SalaryResultItemDetailDto(e, true, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<SalaryResultItemDetailDto> getBySalaryResultItemId(UUID salaryResultItemId) {
        return repository.findBySalaryResultItemIdAndVoidedFalse(salaryResultItemId).stream()
                .map(e -> new SalaryResultItemDetailDto(e, false, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SalaryResultItemDetailDto create(SalaryResultItemDetailDto dto) {
        validateForCreate(dto);

        SalaryResultItemDetail entity = new SalaryResultItemDetail();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new SalaryResultItemDetailDto(entity, true, true);
    }

    @Override
    @Transactional
    public SalaryResultItemDetailDto update(UUID id, SalaryResultItemDetailDto dto) {
        SalaryResultItemDetail entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItemDetail not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new SalaryResultItemDetailDto(entity, true, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryResultItemDetail entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItemDetail not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<SalaryResultItemDetailDto> exportToExcel(SearchSalaryResultItemDetailDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultItemDetailDto();
        }

        Specification<SalaryResultItemDetail> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new SalaryResultItemDetailDto(e, true, true))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(SalaryResultItemDetailDto dto, SalaryResultItemDetail entity) {
        if (dto.getSalaryResultItem() != null && dto.getSalaryResultItem().getId() != null) {
            SalaryResultItem salaryResultItem = salaryResultItemRepository.findById(dto.getSalaryResultItem().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryResultItem not found"));
            entity.setSalaryResultItem(salaryResultItem);
        }

        if (dto.getSalaryTemplateItem() != null && dto.getSalaryTemplateItem().getId() != null) {
            SalaryTemplateItem salaryTemplateItem = salaryTemplateItemRepository
                    .findById(dto.getSalaryTemplateItem().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryTemplateItem not found"));
            entity.setSalaryTemplateItem(salaryTemplateItem);
        }

        if (dto.getValue() != null) {
            entity.setValue(dto.getValue());
        }
    }

    private void validateForCreate(SalaryResultItemDetailDto dto) {
        if (dto.getSalaryResultItem() == null || dto.getSalaryResultItem().getId() == null) {
            throw new IllegalArgumentException("Salary Result Item is required");
        }
        if (dto.getSalaryTemplateItem() == null || dto.getSalaryTemplateItem().getId() == null) {
            throw new IllegalArgumentException("Salary Template Item is required");
        }

        // Check unique constraint
        if (repository.existsBySalaryResultItemIdAndSalaryTemplateItemId(
                dto.getSalaryResultItem().getId(), dto.getSalaryTemplateItem().getId())) {
            throw new IllegalArgumentException("Thành phần lương này đã tồn tại cho nhân viên");
        }
    }

    private void validateForUpdate(SalaryResultItemDetailDto dto, SalaryResultItemDetail entity) {
        if (dto.getSalaryResultItem() != null && dto.getSalaryTemplateItem() != null &&
                dto.getSalaryResultItem().getId() != null && dto.getSalaryTemplateItem().getId() != null) {
            // Check unique constraint excluding current entity
            if (repository.existsBySalaryResultItemIdAndSalaryTemplateItemIdAndIdNot(
                    dto.getSalaryResultItem().getId(), dto.getSalaryTemplateItem().getId(), entity.getId())) {
                throw new IllegalArgumentException("Thành phần lương này đã tồn tại cho nhân viên");
            }
        }
    }
}
