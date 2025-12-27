package com.hrm.backend.service.impl;

import com.hrm.backend.dto.CandidateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchCandidateDto;
import com.hrm.backend.entity.Candidate;
import com.hrm.backend.entity.Position;
import com.hrm.backend.entity.RecruitmentRequest;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.repository.CandidateRepository;
import com.hrm.backend.repository.PositionRepository;
import com.hrm.backend.repository.RecruitmentRequestRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.CandidateService;
import com.hrm.backend.specification.CandidateSpecification;
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
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository repository;
    private final CandidateSpecification specification;
    private final PositionRepository positionRepository;
    private final StaffRepository staffRepository;
    private final RecruitmentRequestRepository recruitmentRequestRepository;

    @Override
    public PageResponse<CandidateDto> search(SearchCandidateDto dto) {
        if (dto == null) {
            dto = new SearchCandidateDto();
        }

        Specification<Candidate> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<Candidate> page = repository.findAll(spec, pageable);
        Page<CandidateDto> dtoPage = page.map(e -> new CandidateDto(e, true));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<CandidateDto> paging(SearchDto dto) {
        SearchCandidateDto searchDto = SearchCandidateDto.fromSearchDto(dto);
        return search(searchDto);
    }

    @Override
    public CandidateDto getById(UUID id) {
        return repository.findById(id)
                .map(e -> new CandidateDto(e, true))
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found: " + id));
    }

    @Override
    public List<CandidateDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new CandidateDto(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CandidateDto create(CandidateDto dto) {
        validateForCreate(dto);

        Candidate entity = new Candidate();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new CandidateDto(entity, true);
    }

    @Override
    @Transactional
    public CandidateDto update(UUID id, CandidateDto dto) {
        Candidate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new CandidateDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Candidate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<CandidateDto> exportToExcel(SearchCandidateDto dto) {
        if (dto == null) {
            dto = new SearchCandidateDto();
        }
        Specification<Candidate> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new CandidateDto(e, true))
                .collect(Collectors.toList());
    }

    // Helper methods

    private void mapDtoToEntity(CandidateDto dto, Candidate entity) {
        // Person fields
        if (StringUtils.hasText(dto.getFirstName()))
            entity.setFirstName(dto.getFirstName());
        if (StringUtils.hasText(dto.getLastName()))
            entity.setLastName(dto.getLastName());
        if (StringUtils.hasText(dto.getDisplayName()))
            entity.setDisplayName(dto.getDisplayName());
        if (dto.getBirthDate() != null)
            entity.setBirthDate(dto.getBirthDate());
        if (StringUtils.hasText(dto.getBirthPlace()))
            entity.setBirthPlace(dto.getBirthPlace());
        if (dto.getGender() != null)
            entity.setGender(dto.getGender());
        if (StringUtils.hasText(dto.getPhoneNumber()))
            entity.setPhoneNumber(dto.getPhoneNumber());
        if (StringUtils.hasText(dto.getIdNumber()))
            entity.setIdNumber(dto.getIdNumber());
        if (StringUtils.hasText(dto.getIdNumberIssueBy()))
            entity.setIdNumberIssueBy(dto.getIdNumberIssueBy());
        if (dto.getIdNumberIssueDate() != null)
            entity.setIdNumberIssueDate(dto.getIdNumberIssueDate());
        if (StringUtils.hasText(dto.getEmail()))
            entity.setEmail(dto.getEmail());
        if (dto.getMaritalStatus() != null)
            entity.setMaritalStatus(dto.getMaritalStatus());
        if (StringUtils.hasText(dto.getTaxCode()))
            entity.setTaxCode(dto.getTaxCode());
        if (dto.getEducationLevel() != null)
            entity.setEducationLevel(dto.getEducationLevel());

        // Candidate specific fields
        if (StringUtils.hasText(dto.getCandidateCode()))
            entity.setCandidateCode(dto.getCandidateCode());
        if (dto.getSubmissionDate() != null)
            entity.setSubmissionDate(dto.getSubmissionDate());
        if (dto.getInterviewDate() != null)
            entity.setInterviewDate(dto.getInterviewDate());
        if (dto.getDesiredPay() != null)
            entity.setDesiredPay(dto.getDesiredPay());
        if (dto.getPossibleWorkingDate() != null)
            entity.setPossibleWorkingDate(dto.getPossibleWorkingDate());
        if (dto.getOnboardDate() != null)
            entity.setOnboardDate(dto.getOnboardDate());
        if (dto.getCandidateStatus() != null)
            entity.setCandidateStatus(dto.getCandidateStatus());
        if (StringUtils.hasText(dto.getWorkExperience()))
            entity.setWorkExperience(dto.getWorkExperience());

        // Relations
        if (dto.getPosition() != null && dto.getPosition().getId() != null) {
            Position position = positionRepository.findById(dto.getPosition().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Position not found"));
            entity.setPosition(position);
        }

        if (dto.getIntroducer() != null && dto.getIntroducer().getId() != null) {
            Staff introducer = staffRepository.findById(dto.getIntroducer().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Introducer not found"));
            entity.setIntroducer(introducer);
        }

        if (dto.getRecruitmentRequest() != null && dto.getRecruitmentRequest().getId() != null) {
            RecruitmentRequest request = recruitmentRequestRepository.findById(dto.getRecruitmentRequest().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Recruitment Request not found"));
            entity.setRecruitmentRequest(request);
        }
    }

    private void validateForCreate(CandidateDto dto) {
        if (!StringUtils.hasText(dto.getCandidateCode())) {
            throw new IllegalArgumentException("Candidate code is required");
        }
        if (repository.existsByCandidateCode(dto.getCandidateCode())) {
            throw new IllegalArgumentException("Candidate code already exists: " + dto.getCandidateCode());
        }
        if (!StringUtils.hasText(dto.getDisplayName())) {
            throw new IllegalArgumentException("Display name is required");
        }
    }

    private void validateForUpdate(CandidateDto dto, Candidate existing) {
        if (StringUtils.hasText(dto.getCandidateCode()) &&
                !dto.getCandidateCode().equals(existing.getCandidateCode()) &&
                repository.existsByCandidateCode(dto.getCandidateCode())) {
            throw new IllegalArgumentException("Candidate code already exists: " + dto.getCandidateCode());
        }
    }
}
