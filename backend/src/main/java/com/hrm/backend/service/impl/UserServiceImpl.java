package com.hrm.backend.service.impl;

import com.hrm.backend.dto.UserDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchUserDto;
import com.hrm.backend.entity.User;
import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.UserRole;
import com.hrm.backend.entity.Person;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.PersonRepository;
import com.hrm.backend.service.UserService;
import com.hrm.backend.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final PersonRepository personRepository;
    private final UserSpecification specification;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<UserDto> search(SearchUserDto dto) {
        if (dto == null)
            dto = new SearchUserDto();
        Specification<User> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);
        Page<User> page = repository.findAll(spec, pageable);
        return PageResponse.of(page.map(UserDto::new));
    }

    @Override
    public PageResponse<UserDto> paging(SearchDto dto) {
        return search(SearchUserDto.fromSearchDto(dto));
    }

    @Override
    public UserDto getById(UUID id) {
        return repository.findById(id)
                .map(UserDto::new)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    @Override
    public List<UserDto> getAll() {
        return repository.findAll().stream()
                .filter(u -> u.getVoided() == null || !u.getVoided())
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto create(UserDto dto) {
        validateForCreate(dto);

        User entity = new User();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);
        entity.setTotalLoginFailures(0L);
        entity.setLastLoginFailures(0L);

        // Encode password
        if (StringUtils.hasText(dto.getPassword())) {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        entity = repository.save(entity);
        return new UserDto(entity);
    }

    @Override
    @Transactional
    public UserDto update(UUID id, UserDto dto) {
        User entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);
        entity.setUpdatedAt(LocalDateTime.now());

        // Password update if provided
        if (StringUtils.hasText(dto.getPassword())) {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        entity = repository.save(entity);
        return new UserDto(entity);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        User entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public List<UserDto> exportToExcel(SearchUserDto dto) {
        if (dto == null)
            dto = new SearchUserDto();
        Specification<User> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);
        return repository.findAll(spec, sort).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User result = (User) authentication.getPrincipal();
            return new UserDto(result);
        }
        throw new SecurityException("Bạn chưa đăng nhập");
    }

    @Override
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new SecurityException("Bạn chưa đăng nhập");
    }

    private void mapDtoToEntity(UserDto dto, User entity) {
        if (StringUtils.hasText(dto.getUsername()))
            entity.setUsername(dto.getUsername());
        if (StringUtils.hasText(dto.getEmail()))
            entity.setEmail(dto.getEmail());

        // Map Roles
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            // Logic to update roles.
            // Note: UserRole is a join entity. We need to manage it.
            // For simplicity, we might just clear and add if we had a proper UserRole
            // repository or cascade.
            // But User has `cascade = CascadeType.ALL, orphanRemoval = true` on `roles`.
            // So updating the `roles` set should work.

            if (entity.getRoles() == null)
                entity.setRoles(new HashSet<>());

            // This logic is tricky.
            // Ideally we find existing roles by ID and update the Set.
            // Or we re-create UserRoles.

            // Create new set of UserRoles
            // But we need to keep existing IDs if we want to update?
            // Actually UserRole is mostly a link.

            // Clear existing (orphanRemoval handles delete)
            entity.getRoles().clear();

            for (var roleDto : dto.getRoles()) {
                Role role = roleRepository.findById(roleDto.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleDto.getId()));
                UserRole userRole = new UserRole(role);
                userRole.setUser(entity); // IMPORTANT
                userRole.setCreatedAt(LocalDateTime.now());
                userRole.setVoided(false);
                entity.getRoles().add(userRole);
            }
        }

        // Map Person
        // If UserDto has personId? No, UserDto has `PersonDto`.
        // If PersonDto is passed, we might link to it.
        // Usually we link by ID.
        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            Person person = personRepository.findById(dto.getPerson().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Person not found: " + dto.getPerson().getId()));
            entity.setPerson(person);
        }
    }

    private void validateForCreate(UserDto dto) {
        if (!StringUtils.hasText(dto.getUsername()))
            throw new IllegalArgumentException("Username is required");
        if (!StringUtils.hasText(dto.getPassword()))
            throw new IllegalArgumentException("Password is required");
        if (repository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
        }
        if (StringUtils.hasText(dto.getEmail()) && repository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
        }
    }

    private void validateForUpdate(UserDto dto, User existing) {
        if (StringUtils.hasText(dto.getUsername()) && !dto.getUsername().equals(existing.getUsername())) {
            if (repository.existsByUsername(dto.getUsername())) {
                throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
            }
        }
        if (StringUtils.hasText(dto.getEmail()) && !dto.getEmail().equals(existing.getEmail())) {
            if (repository.existsByEmailAndIdNot(dto.getEmail(), existing.getId())) {
                throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
            }
        }
    }
}
