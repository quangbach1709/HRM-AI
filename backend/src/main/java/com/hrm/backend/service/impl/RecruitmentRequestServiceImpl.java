package com.hrm.backend.service.impl;

import com.hrm.backend.dto.RecruitmentRequestDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchRecruitmentRequestDto;
import com.hrm.backend.entity.Position;
import com.hrm.backend.entity.RecruitmentRequest;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.repository.PositionRepository;
import com.hrm.backend.repository.RecruitmentRequestRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.RecruitmentRequestService;
import com.hrm.backend.specification.RecruitmentRequestSpecification;
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
public class RecruitmentRequestServiceImpl implements RecruitmentRequestService {

    private final RecruitmentRequestRepository repository;
    private final RecruitmentRequestSpecification specification;
    private final StaffRepository staffRepository;
    private final PositionRepository positionRepository;

    @Override
    public PageResponse<RecruitmentRequestDto> search(SearchRecruitmentRequestDto dto) {
        if (dto == null) {
            dto = new SearchRecruitmentRequestDto();
        }

        Specification<RecruitmentRequest> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<RecruitmentRequest> page = repository.findAll(spec, pageable);
        List<RecruitmentRequestDto> content = page.getContent().stream()
                .map(item -> new RecruitmentRequestDto(item, true))
                .collect(Collectors.toList());

        PageResponse<RecruitmentRequestDto> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setHasNext(page.hasNext());
        response.setHasPrevious(page.hasPrevious());

        return response;
    }

    @Override
    public RecruitmentRequestDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new RecruitmentRequestDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("Recruitment Request not found: " + id));
    }

    @Override
    public List<RecruitmentRequestDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new RecruitmentRequestDto(entity, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RecruitmentRequestDto create(RecruitmentRequestDto dto) {
        validateForCreate(dto);

        RecruitmentRequest entity = new RecruitmentRequest();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new RecruitmentRequestDto(entity, true);
    }

    @Override
    @Transactional
    public RecruitmentRequestDto update(UUID id, RecruitmentRequestDto dto) {
        RecruitmentRequest entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Recruitment Request not found: " + id));

        validateForUpdate(dto, entity);
        mapDtoToEntity(dto, entity);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new RecruitmentRequestDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        RecruitmentRequest entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Recruitment Request not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<RecruitmentRequestDto> exportToExcel(SearchRecruitmentRequestDto dto) {
        if (dto == null) {
            dto = new SearchRecruitmentRequestDto();
        }

        Specification<RecruitmentRequest> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new RecruitmentRequestDto(entity, true))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(RecruitmentRequestDto dto, RecruitmentRequest entity) {
        if (StringUtils.hasText(dto.getCode())) {
            entity.setCode(dto.getCode().trim());
        }
        if (StringUtils.hasText(dto.getName())) {
            entity.setName(dto.getName().trim());
        }
        if (StringUtils.hasText(dto.getRequest())) {
            entity.setRequest(dto.getRequest());
        }

        if (dto.getProposalDate() != null) {
            entity.setProposalDate(dto.getProposalDate());
        }

        // Map relationships
        if (dto.getProposer() != null && dto.getProposer().getId() != null) {
            Staff proposer = staffRepository.findById(dto.getProposer().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Proposer not found"));
            entity.setProposer(proposer);
        }

        if (dto.getPosition() != null && dto.getPosition().getId() != null) {
            Position position = positionRepository.findById(dto.getPosition().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Position not found"));
            entity.setPosition(position);
        }
    }

    private void validateForCreate(RecruitmentRequestDto dto) {
        if (!StringUtils.hasText(dto.getCode())) {
            throw new IllegalArgumentException("Code is required");
        }
        if (repository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Code already exists: " + dto.getCode());
        }
    }

    private void validateForUpdate(RecruitmentRequestDto dto, RecruitmentRequest existing) {
        if (StringUtils.hasText(dto.getCode()) &&
                !dto.getCode().equals(existing.getCode()) &&
                repository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Code already exists: " + dto.getCode());
        }
    }
}
