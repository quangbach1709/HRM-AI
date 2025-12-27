package com.hrm.backend.service.impl;

import com.hrm.backend.dto.StaffWorkScheduleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffWorkScheduleDto;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.entity.StaffWorkSchedule;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.repository.StaffWorkScheduleRepository;
import com.hrm.backend.service.StaffService;
import com.hrm.backend.service.StaffWorkScheduleService;
import com.hrm.backend.service.UserService;
import com.hrm.backend.specification.StaffWorkScheduleSpecification;
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
public class StaffWorkScheduleServiceImpl implements StaffWorkScheduleService {

    private final StaffWorkScheduleRepository repository;
    private final StaffWorkScheduleSpecification specification;
    private final StaffRepository staffRepository;
    private final StaffService staffService;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<StaffWorkScheduleDto> search(SearchStaffWorkScheduleDto dto) {
        if (dto == null) {
            dto = new SearchStaffWorkScheduleDto();
        }

        Specification<StaffWorkSchedule> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<StaffWorkSchedule> page = repository.findAll(spec, pageable);
        // Using explicit mapping via DTO constructor
        Page<StaffWorkScheduleDto> dtoPage = page.map(entity -> new StaffWorkScheduleDto(entity, false));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<StaffWorkScheduleDto> paging(SearchDto dto) {
        SearchStaffWorkScheduleDto searchDto = SearchStaffWorkScheduleDto.fromSearchDto(dto);
        return search(searchDto);
    }

    // ==================== GET ====================

    @Override
    public StaffWorkScheduleDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new StaffWorkScheduleDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));
    }

    @Override
    public List<StaffWorkScheduleDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new StaffWorkScheduleDto(entity, false))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public StaffWorkScheduleDto create(StaffWorkScheduleDto dto) {
        validateForCreate(dto);

        StaffWorkSchedule entity = new StaffWorkSchedule();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new StaffWorkScheduleDto(entity, true);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public StaffWorkScheduleDto update(UUID id, StaffWorkScheduleDto dto) {
        StaffWorkSchedule entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new StaffWorkScheduleDto(entity, true);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        StaffWorkSchedule entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<StaffWorkScheduleDto> exportToExcel(SearchStaffWorkScheduleDto dto) {
        if (dto == null) {
            dto = new SearchStaffWorkScheduleDto();
        }

        Specification<StaffWorkSchedule> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new StaffWorkScheduleDto(entity, false))
                .collect(Collectors.toList());
    }

    // ==================== HELPERS ====================

    private void mapDtoToEntity(StaffWorkScheduleDto dto, StaffWorkSchedule entity) {
        if (dto.getShiftWorkType() != null) {
            entity.setShiftWorkType(dto.getShiftWorkType());
        }
        if (dto.getShiftWorkStatus() != null) {
            entity.setShiftWorkStatus(dto.getShiftWorkStatus());
        }

        // Dates
        if (dto.getWorkingDate() != null) {
            entity.setWorkingDate(dto.getWorkingDate());
        }
        if (dto.getCheckIn() != null) {
            entity.setCheckIn(dto.getCheckIn());
        }
        if (dto.getCheckOut() != null) {
            entity.setCheckOut(dto.getCheckOut());
        }
        if (dto.getLocked() != null) {
            entity.setIsLocked(dto.getLocked());
        }

        // Relations
        if (dto.getStaff() != null && dto.getStaff().getId() != null) {
            Staff staff = staffRepository.findById(dto.getStaff().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + dto.getStaff().getId()));
            entity.setStaff(staff);
        } else if (dto.getStaffId() != null) {
            Staff staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + dto.getStaffId()));
            entity.setStaff(staff);
        }

        if (dto.getCoordinator() != null && dto.getCoordinator().getId() != null) {
            Staff coordinator = staffRepository.findById(dto.getCoordinator().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Coordinator not found: " + dto.getCoordinator().getId()));
            entity.setCoordinator(coordinator);
        } else {
            Staff coordinator = staffService.getCurrentStaffEntity();
            entity.setCoordinator(coordinator);
        }
    }

    private void validateForCreate(StaffWorkScheduleDto dto) {
        if ((dto.getStaff() == null || dto.getStaff().getId() == null ) && dto.getStaffId() == null) {
            throw new IllegalArgumentException("Staff is required");
            // Additional validations (e.g., locking checks) can be added here
        }
    }

    private void validateForUpdate(StaffWorkScheduleDto dto, StaffWorkSchedule existing) {
        if (existing.getIsLocked() != null && existing.getIsLocked()) {
            // If locked, restrict updates? Or allow admin Override?
            // For now, allow update but maybe warn. Or block if critical.
            // Assuming CRUD allows update unless specific rule blocks it.
        }
    }
}
