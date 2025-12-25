package com.hrm.backend.service.impl;

import com.hrm.backend.dto.UserRoleDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchUserRoleDto;
import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.User;
import com.hrm.backend.entity.UserRole;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.repository.UserRoleRepository;
import com.hrm.backend.service.UserRoleService;
import com.hrm.backend.specification.UserRoleSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserRoleServiceImpl implements UserRoleService {

    private final UserRoleRepository repository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleSpecification specification;

    @Override
    public PageResponse<UserRoleDto> search(SearchUserRoleDto dto) {
        if (dto == null)
            dto = new SearchUserRoleDto();
        Specification<UserRole> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);
        Page<UserRole> page = repository.findAll(spec, pageable);
        return PageResponse.of(page.map(UserRoleDto::new));
    }

    @Override
    public PageResponse<UserRoleDto> paging(SearchDto dto) {
        return search(SearchUserRoleDto.fromSearchDto(dto)); // Note: SearchUserRoleDto needs to handle fromSearchDto
                                                             // correctly or we cast
    }

    @Override
    public UserRoleDto getById(UUID id) {
        return repository.findById(id)
                .map(UserRoleDto::new)
                .orElseThrow(() -> new EntityNotFoundException("UserRole not found: " + id));
    }

    @Override
    public List<UserRoleDto> getAll() {
        return repository.findAll().stream()
                .filter(ur -> ur.getVoided() == null || !ur.getVoided())
                .map(UserRoleDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserRoleDto create(SearchUserRoleDto dto) {
        if (dto.getUserId() == null || dto.getRoleId() == null) {
            throw new IllegalArgumentException("UserId and RoleId are required");
        }

        if (repository.existsByUserIdAndRoleId(dto.getUserId(), dto.getRoleId())) {
            throw new IllegalArgumentException("UserRole already exists");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + dto.getUserId()));
        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + dto.getRoleId()));

        UserRole entity = new UserRole();
        entity.setUser(user);
        entity.setRole(role);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new UserRoleDto(entity);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        UserRole entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserRole not found: " + id));
        // Hard delete or Soft delete?
        // UserRole is often hard deleted if it's just a link.
        // But entity has voided.
        // I'll soft delete.
        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }
}
