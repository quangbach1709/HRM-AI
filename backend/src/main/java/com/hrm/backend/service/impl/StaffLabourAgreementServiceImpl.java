package com.hrm.backend.service.impl;


import com.hrm.backend.dto.StaffLabourAgreementDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchStaffLabourAgreementDto;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.entity.StaffLabourAgreement;
import com.hrm.backend.repository.StaffLabourAgreementRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.StaffLabourAgreementService;
import com.hrm.backend.specification.StaffLabourAgreementSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffLabourAgreementServiceImpl implements StaffLabourAgreementService {

    private final StaffLabourAgreementRepository repository;
    private final StaffLabourAgreementSpecification specification;
    private final StaffRepository staffRepository;

    @Override
    public PageResponse<StaffLabourAgreementDto> search(SearchStaffLabourAgreementDto dto) {
        if (dto == null) {
            dto = new SearchStaffLabourAgreementDto();
        }

        Specification<StaffLabourAgreement> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<StaffLabourAgreement> page = repository.findAll(spec, pageable);
        Page<StaffLabourAgreementDto> dtoPage = page.map(entity -> new StaffLabourAgreementDto(entity, true));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<StaffLabourAgreementDto> paging(SearchDto dto) {
        SearchStaffLabourAgreementDto searchDto = SearchStaffLabourAgreementDto.fromSearchDto(dto);
        return search(searchDto);
    }

    @Override
    public StaffLabourAgreementDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new StaffLabourAgreementDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("Labour Agreement not found: " + id));
    }

    @Override
    public List<StaffLabourAgreementDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new StaffLabourAgreementDto(entity, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffLabourAgreementDto create(StaffLabourAgreementDto dto) {
        validateForCreate(dto);

        StaffLabourAgreement entity = new StaffLabourAgreement();
        mapDtoToEntity(dto, entity);


        entity.setVoided(false);

        entity = repository.save(entity);
        return new StaffLabourAgreementDto(entity, true);
    }

    @Override
    @Transactional
    public StaffLabourAgreementDto update(UUID id, StaffLabourAgreementDto dto) {
        StaffLabourAgreement entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Labour Agreement not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);


        entity = repository.save(entity);
        return new StaffLabourAgreementDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        StaffLabourAgreement entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Labour Agreement not found: " + id));

        entity.setVoided(true);

        repository.save(entity);
    }

    @Override
    public List<StaffLabourAgreementDto> exportToExcel(SearchStaffLabourAgreementDto dto) {
        if (dto == null) {
            dto = new SearchStaffLabourAgreementDto();
        }

        Specification<StaffLabourAgreement> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new StaffLabourAgreementDto(entity, true))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(StaffLabourAgreementDto dto, StaffLabourAgreement entity) {
        if (dto.getStaff() != null && dto.getStaff().getId() != null) {
            Staff staff = staffRepository.findById(dto.getStaff().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            entity.setStaff(staff);
        }

        entity.setContractType(dto.getContractType());
        if (StringUtils.hasText(dto.getLabourAgreementNumber())) {
            entity.setLabourAgreementNumber(dto.getLabourAgreementNumber());
        }
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setDurationMonths(dto.getDurationMonths());
        entity.setWorkingHour(dto.getWorkingHour());
        entity.setWorkingHourWeekMin(dto.getWorkingHourWeekMin());
        entity.setSalary(dto.getSalary());
        entity.setSignedDate(dto.getSignedDate());
        entity.setAgreementStatus(dto.getAgreementStatus());
    }

    private void validateForCreate(StaffLabourAgreementDto dto) {
        if (!StringUtils.hasText(dto.getLabourAgreementNumber())) {
            throw new IllegalArgumentException("Labour Agreement Number is required");
        }
        if (repository.existsByLabourAgreementNumber(dto.getLabourAgreementNumber())) {
            throw new IllegalArgumentException(
                    "Labour Agreement Number already exists: " + dto.getLabourAgreementNumber());
        }
        if (dto.getStaff() == null || dto.getStaff().getId() == null) {
            throw new IllegalArgumentException("Staff is required");
        }
    }

    private void validateForUpdate(StaffLabourAgreementDto dto, StaffLabourAgreement existing) {
        if (StringUtils.hasText(dto.getLabourAgreementNumber()) &&
                !dto.getLabourAgreementNumber().equals(existing.getLabourAgreementNumber()) &&
                repository.existsByLabourAgreementNumberAndIdNot(dto.getLabourAgreementNumber(), existing.getId())) {
            throw new IllegalArgumentException(
                    "Labour Agreement Number already exists: " + dto.getLabourAgreementNumber());
        }
    }
}
