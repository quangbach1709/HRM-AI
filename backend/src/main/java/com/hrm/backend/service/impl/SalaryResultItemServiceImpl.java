package com.hrm.backend.service.impl;

import com.hrm.backend.dto.SalaryResultItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDto;
import com.hrm.backend.entity.SalaryResult;
import com.hrm.backend.entity.SalaryResultItem;
import com.hrm.backend.entity.SalaryResultItemDetail;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.repository.SalaryResultItemRepository;
import com.hrm.backend.repository.SalaryResultRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.SalaryResultItemService;
import com.hrm.backend.specification.SalaryResultItemSpecification;
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
public class SalaryResultItemServiceImpl implements SalaryResultItemService {

    private final SalaryResultItemRepository repository;
    private final SalaryResultItemSpecification specification;
    private final SalaryResultRepository salaryResultRepository;
    private final StaffRepository staffRepository;

    @Override
    public PageResponse<SalaryResultItemDto> search(SearchSalaryResultItemDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultItemDto();
        }

        Specification<SalaryResultItem> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<SalaryResultItem> page = repository.findAll(spec, pageable);
        Page<SalaryResultItemDto> dtoPage = page.map(e -> new SalaryResultItemDto(e, false));

        return PageResponse.of(dtoPage);
    }

    @Override
    public SalaryResultItemDto getById(UUID id) {
        return repository.findById(id)
                .map(e -> new SalaryResultItemDto(e, true))
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItem not found: " + id));
    }

    @Override
    public List<SalaryResultItemDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new SalaryResultItemDto(e, false))
                .collect(Collectors.toList());
    }

    @Override
    public List<SalaryResultItemDto> getBySalaryResultId(UUID salaryResultId) {
        return repository.findBySalaryResultIdAndVoidedFalse(salaryResultId).stream()
                .map(e -> new SalaryResultItemDto(e, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SalaryResultItemDto create(SalaryResultItemDto dto) {
        validateForCreate(dto);

        SalaryResultItem entity = new SalaryResultItem();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new SalaryResultItemDto(entity, true);
    }

    @Override
    @Transactional
    public SalaryResultItemDto update(UUID id, SalaryResultItemDto dto) {
        SalaryResultItem entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItem not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new SalaryResultItemDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SalaryResultItem entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryResultItem not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<SalaryResultItemDto> exportToExcel(SearchSalaryResultItemDto dto) {
        if (dto == null) {
            dto = new SearchSalaryResultItemDto();
        }

        Specification<SalaryResultItem> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new SalaryResultItemDto(e, false))
                .collect(Collectors.toList());
    }

    public void mapDtoToEntity(SalaryResultItemDto dto, SalaryResultItem entity) {
        if (dto.getSalaryResult() != null && dto.getSalaryResult().getId() != null) {
            SalaryResult salaryResult = salaryResultRepository.findById(dto.getSalaryResult().getId())
                    .orElseThrow(() -> new EntityNotFoundException("SalaryResult not found"));
            entity.setSalaryResult(salaryResult);
        }

        if (dto.getStaff() != null && dto.getStaff().getId() != null) {
            Staff staff = staffRepository.findById(dto.getStaff().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            entity.setStaff(staff);
        }
    }

    private void validateForCreate(SalaryResultItemDto dto) {
        if (dto.getSalaryResult() == null || dto.getSalaryResult().getId() == null) {
            throw new IllegalArgumentException("Salary Result is required");
        }
        if (dto.getStaff() == null || dto.getStaff().getId() == null) {
            throw new IllegalArgumentException("Staff is required");
        }

        // Check unique constraint
        if (repository.existsBySalaryResultIdAndStaffId(
                dto.getSalaryResult().getId(), dto.getStaff().getId())) {
            throw new IllegalArgumentException("Nhân viên này đã tồn tại trong bảng lương");
        }
    }

    private void validateForUpdate(SalaryResultItemDto dto, SalaryResultItem entity) {
        if (dto.getSalaryResult() != null && dto.getStaff() != null &&
                dto.getSalaryResult().getId() != null && dto.getStaff().getId() != null) {
            // Check unique constraint excluding current entity
            if (repository.existsBySalaryResultIdAndStaffIdAndIdNot(
                    dto.getSalaryResult().getId(), dto.getStaff().getId(), entity.getId())) {
                throw new IllegalArgumentException("Nhân viên này đã tồn tại trong bảng lương");
            }
        }
    }
}
