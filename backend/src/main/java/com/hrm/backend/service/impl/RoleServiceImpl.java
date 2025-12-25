package com.hrm.backend.service.impl;

import com.hrm.backend.dto.RoleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchRoleDto;
import com.hrm.backend.entity.Role;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.service.RoleService;
import com.hrm.backend.specification.RoleSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
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
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;
    private final RoleSpecification specification;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<RoleDto> search(SearchRoleDto dto) {
        if (dto == null) {
            dto = new SearchRoleDto();
        }

        Specification<Role> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<Role> page = repository.findAll(spec, pageable);
        Page<RoleDto> dtoPage = page.map(RoleDto::new);

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<RoleDto> paging(SearchDto dto) {
        SearchRoleDto searchDto = SearchRoleDto.fromSearchDto(dto);
        return search(searchDto);
    }

    // ==================== GET ====================

    @Override
    public RoleDto getById(UUID id) {
        return repository.findById(id)
                .map(RoleDto::new)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + id));
    }

    @Override
    public List<RoleDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(RoleDto::new)
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public RoleDto create(RoleDto dto) {
        validateForCreate(dto);

        Role entity = new Role();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new RoleDto(entity);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public RoleDto update(UUID id, RoleDto dto) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new RoleDto(entity);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<RoleDto> exportToExcel(SearchRoleDto dto) {
        if (dto == null) {
            dto = new SearchRoleDto();
        }

        Specification<Role> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(RoleDto::new)
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private void mapDtoToEntity(RoleDto dto, Role entity) {
        if (StringUtils.hasText(dto.getName())) {
            entity.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
    }

    private void validateForCreate(RoleDto dto) {
        if (!StringUtils.hasText(dto.getName())) {
            throw new IllegalArgumentException("Tên vai trò là bắt buộc");
        }

        if (repository.existsByName(dto.getName().trim())) {
            throw new IllegalArgumentException("Tên vai trò đã tồn tại: " + dto.getName());
        }
    }

    private void validateForUpdate(RoleDto dto, Role existing) {
        if (StringUtils.hasText(dto.getName()) &&
                !dto.getName().trim().equals(existing.getName()) &&
                repository.existsByName(dto.getName().trim())) {
            throw new IllegalArgumentException("Tên vai trò đã tồn tại: " + dto.getName());
        }
    }
}
