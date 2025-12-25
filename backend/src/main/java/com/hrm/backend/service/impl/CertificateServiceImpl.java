package com.hrm.backend.service.impl;

import com.hrm.backend.dto.CertificateDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchCertificateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.entity.Certificate;
import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.entity.Person;
import com.hrm.backend.repository.CertificateRepository;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.repository.PersonRepository;
import com.hrm.backend.service.CertificateService;
import com.hrm.backend.specification.CertificateSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository repository;
    private final CertificateSpecification specification;
    private final PersonRepository personRepository;
    private final FileDescriptionRepository fileDescriptionRepository;

    @Override
    public PageResponse<CertificateDto> search(SearchCertificateDto dto) {
        if (dto == null) {
            dto = new SearchCertificateDto();
        }

        Specification<Certificate> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<Certificate> page = repository.findAll(spec, pageable);
        Page<CertificateDto> dtoPage = page.map(entity -> new CertificateDto(entity, true)); // Map person as well

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<CertificateDto> paging(SearchDto dto) {
        SearchCertificateDto searchDto = SearchCertificateDto.fromSearchDto(dto);
        return search(searchDto);
    }

    @Override
    public CertificateDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new CertificateDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found: " + id));
    }

    @Override
    public List<CertificateDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new CertificateDto(entity, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CertificateDto create(CertificateDto dto) {
        validateForCreate(dto);

        Certificate entity = new Certificate();
        mapDtoToEntity(dto, entity);

        entity.setVoided(false);

        entity = repository.save(entity);
        return new CertificateDto(entity, true);
    }

    @Override
    @Transactional
    public CertificateDto update(UUID id, CertificateDto dto) {
        Certificate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found: " + id));

        validateForUpdate(dto, entity);
        mapDtoToEntity(dto, entity);



        entity = repository.save(entity);
        return new CertificateDto(entity, true);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Certificate entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found: " + id));

        entity.setVoided(true);

        repository.save(entity);
    }

    @Override
    public List<CertificateDto> exportToExcel(SearchCertificateDto dto) {
        if (dto == null) {
            dto = new SearchCertificateDto();
        }

        Specification<Certificate> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new CertificateDto(entity, true))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(CertificateDto dto, Certificate entity) {
        if (StringUtils.hasText(dto.getCode())) {
            entity.setCode(dto.getCode().trim());
        } else {
            entity.setCode("CERT-" + new Date().getTime());
        }
        if (StringUtils.hasText(dto.getName())) {
            entity.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }

        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            Person person = personRepository.findById(dto.getPerson().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Person not found"));
            entity.setPerson(person);
        } else if (dto.getPersonId() != null) {
            Person person = personRepository.findById(dto.getPersonId())
                    .orElseThrow(() -> new EntityNotFoundException("Person not found"));
            entity.setPerson(person);
        }

        if (dto.getCertificateFile() != null && dto.getCertificateFile().getId() != null) {
            FileDescription file = fileDescriptionRepository.findById(dto.getCertificateFile().getId())
                    .orElseThrow(() -> new EntityNotFoundException("File not found"));
            entity.setCertificateFile(file);
        }
    }

    private void validateForCreate(CertificateDto dto) {
        if (!StringUtils.hasText(dto.getName())) {
            throw new IllegalArgumentException("Name is required");
        }
    }

    private void validateForUpdate(CertificateDto dto, Certificate existing) {
        if (!StringUtils.hasText(dto.getName())) {
            throw new IllegalArgumentException("Name is required");
        }
    }
}
