package com.hrm.backend.service.impl;

import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.StaffDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffDto;
import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.repository.SalaryTemplateRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.StaffService;
import com.hrm.backend.specification.StaffSpecification;
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
public class StaffServiceImpl implements StaffService {

    private final StaffRepository repository;
    private final StaffSpecification specification;
    private final SalaryTemplateRepository salaryTemplateRepository;

    @Override
    public PageResponse<StaffDto> search(SearchStaffDto dto) {
        if (dto == null)
            dto = new SearchStaffDto();

        Specification<Staff> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<Staff> page = repository.findAll(spec, pageable);
        // Using `true` for isGetFull to get agreements if needed, or `false` for
        // lighter payload for list?
        // Typically list view doesn't need full agreements details. using false.
        Page<StaffDto> dtoPage = page.map(entity -> new StaffDto(entity, false));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<StaffDto> paging(SearchDto dto) {
        return search(SearchStaffDto.fromSearchDto(dto));
    }

    @Override
    public StaffDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new StaffDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + id));
    }

    @Override
    public List<StaffDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new StaffDto(entity, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffDto create(StaffDto dto) {
        validateForCreate(dto);

        Staff entity = new Staff();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new StaffDto(entity, true);
    }

    @Override
    @Transactional
    public StaffDto update(UUID id, StaffDto dto) {
        Staff entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new StaffDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Staff entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<StaffDto> exportToExcel(SearchStaffDto dto) {
        if (dto == null)
            dto = new SearchStaffDto();
        Specification<Staff> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new StaffDto(entity, false))
                .collect(Collectors.toList());
    }

    private void validateForCreate(StaffDto dto) {
        if (!StringUtils.hasText(dto.getStaffCode())) {
            throw new IllegalArgumentException("Staff code is required");
        }
        if (repository.existsByStaffCode(dto.getStaffCode())) {
            throw new IllegalArgumentException("Staff code already exists: " + dto.getStaffCode());
        }
        if (!StringUtils.hasText(dto.getDisplayName())) {
            throw new IllegalArgumentException("Display name is required");
        }
    }

    private void validateForUpdate(StaffDto dto, Staff existing) {
        if (StringUtils.hasText(dto.getStaffCode()) &&
                !dto.getStaffCode().equals(existing.getStaffCode()) &&
                repository.existsByStaffCode(dto.getStaffCode())) {
            throw new IllegalArgumentException("Staff code already exists: " + dto.getStaffCode());
        }
    }

    private void mapDtoToEntity(StaffDto dto, Staff entity) {
        // Person Fields
        if (StringUtils.hasText(dto.getFirstName()))
            entity.setFirstName(dto.getFirstName());
        if (StringUtils.hasText(dto.getLastName()))
            entity.setLastName(dto.getLastName());
        if (StringUtils.hasText(dto.getDisplayName()))
            entity.setDisplayName(dto.getDisplayName());
        if (dto.getGender() != null)
            entity.setGender(dto.getGender());
        if (StringUtils.hasText(dto.getEmail()))
            entity.setEmail(dto.getEmail());
        if (StringUtils.hasText(dto.getPhoneNumber()))
            entity.setPhoneNumber(dto.getPhoneNumber());
        if (StringUtils.hasText(dto.getIdNumber()))
            entity.setIdNumber(dto.getIdNumber());
        if (dto.getBirthDate() != null)
            entity.setBirthDate(dto.getBirthDate());
        if (StringUtils.hasText(dto.getBirthPlace()))
            entity.setBirthPlace(dto.getBirthPlace());
        if (dto.getIdNumberIssueDate() != null)
            entity.setIdNumberIssueDate(dto.getIdNumberIssueDate());
        if (StringUtils.hasText(dto.getIdNumberIssueBy()))
            entity.setIdNumberIssueBy(dto.getIdNumberIssueBy());
        if (StringUtils.hasText(dto.getTaxCode()))
            entity.setTaxCode(dto.getTaxCode());
        if (dto.getMaritalStatus() != null)
            entity.setMaritalStatus(dto.getMaritalStatus());
        if (dto.getEducationLevel() != null)
            entity.setEducationLevel(dto.getEducationLevel());
        if (dto.getHeight() != null)
            entity.setHeight(dto.getHeight());
        if (dto.getWeight() != null)
            entity.setWeight(dto.getWeight());

        // Staff Fields
        if (StringUtils.hasText(dto.getStaffCode()))
            entity.setStaffCode(dto.getStaffCode());
        if (dto.getRecruitmentDate() != null)
            entity.setRecruitmentDate(dto.getRecruitmentDate());
        if (dto.getStartDate() != null)
            entity.setStartDate(dto.getStartDate());
        if (dto.getApprenticeDays() != null)
            entity.setApprenticeDays(dto.getApprenticeDays());
        if (dto.getEmployeeStatus() != null)
            entity.setEmployeeStatus(dto.getEmployeeStatus());
        if (dto.getStaffPhase() != null)
            entity.setStaffPhase(dto.getStaffPhase());
        if (dto.getRequireAttendance() != null)
            entity.setRequireAttendance(dto.getRequireAttendance());
        if (dto.getAllowExternalIpTimekeeping() != null)
            entity.setAllowExternalIpTimekeeping(dto.getAllowExternalIpTimekeeping());

        // Salary Template
        if (dto.getSalaryTemplate() != null && dto.getSalaryTemplate().getId() != null) {
            SalaryTemplate template = salaryTemplateRepository.findById(dto.getSalaryTemplate().getId())
                    .orElse(null); // Or throw error?
            entity.setSalaryTemplate(template);
        } else if (dto.getSalaryTemplate() == null) {
            entity.setSalaryTemplate(null);
        }
    }
}
