package com.hrm.backend.service.impl;

import com.hrm.backend.dto.PersonDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchPersonDto;

import com.hrm.backend.entity.Person;
import com.hrm.backend.repository.PersonRepository;
import com.hrm.backend.service.PersonService;
import com.hrm.backend.specification.PersonSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonServiceImpl implements PersonService {

    private final PersonRepository repository;
    private final PersonSpecification specification;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<PersonDto> search(SearchPersonDto dto) {
        if (dto == null) {
            dto = new SearchPersonDto();
        }

        Specification<Person> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<Person> page = repository.findAll(spec, pageable);

        // Map to DTO (isGetFull = false for list view)
        Page<PersonDto> dtoPage = page.map(entity -> new PersonDto(entity, false));

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<PersonDto> paging(SearchDto dto) {
        SearchPersonDto searchDto = SearchPersonDto.fromSearchDto(dto);
        return search(searchDto);
    }

    // ==================== GET ====================

    @Override
    public PersonDto getById(UUID id) {
        Person entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found: " + id));

        // Include full details (isGetFull = true)
        return new PersonDto(entity, true);
    }

    @Override
    public List<PersonDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(e -> new PersonDto(e, false))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public PersonDto create(PersonDto dto) {
        // Validation
        validateForCreate(dto);

        Person entity = new Person();
        mapDtoToEntity(dto, entity);

        // Audit fields handled by AuditingEntityListener but we can set defaults if
        // needed
        entity.setVoided(false);
        entity.setCreatedAt(java.time.LocalDateTime.now());
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        entity = repository.save(entity);
        return new PersonDto(entity, true);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public PersonDto update(UUID id, PersonDto dto) {
        Person entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found: " + id));

        // Validation
        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        entity = repository.save(entity);
        return new PersonDto(entity, true);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        Person entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found: " + id));

        // Soft delete
        entity.setVoided(true);
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<PersonDto> exportToExcel(SearchPersonDto dto) {
        if (dto == null) {
            dto = new SearchPersonDto();
        }

        Specification<Person> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(e -> new PersonDto(e, false))
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private void mapDtoToEntity(PersonDto dto, Person entity) {
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
        if (dto.getHeight() != null)
            entity.setHeight(dto.getHeight());
        if (dto.getWeight() != null)
            entity.setWeight(dto.getWeight());

        // Avatar mapping if needed (complex type)
        if (dto.getAvatar() != null && dto.getAvatar().getId() != null) {
            // Need to retrieve FileDescription or construct it
            // For now assuming we just update fields if logic requires,
            // but usually avatar is handled via upload API separately or passed as object
            // entity.setAvatar(...)
        }
    }

    private void validateForCreate(PersonDto dto) {
        if (!StringUtils.hasText(dto.getFirstName()) && !StringUtils.hasText(dto.getDisplayName())) {
            throw new IllegalArgumentException("First Name or Display Name is required");
        }
        // Add more validations (e.g. unique email, unique idNumber)
    }

    private void validateForUpdate(PersonDto dto, Person existing) {
        // Similar validations, check if unique fields collide with other entities
    }
}
