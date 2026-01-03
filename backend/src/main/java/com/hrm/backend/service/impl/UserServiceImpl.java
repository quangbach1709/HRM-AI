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

import jakarta.persistence.EntityManager;
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
    private final EntityManager entityManager;

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
        dto.setId(id);
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

    @Override
    @Transactional
    public UserDto updatePasswordUser(UserDto dto) {
        User currentUser = getCurrentUserEntity();
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được để trống");
        }
        currentUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        currentUser.setUpdatedAt(LocalDateTime.now());
        currentUser = repository.saveAndFlush(currentUser);
        return new UserDto(currentUser);
    }

    private void mapDtoToEntity(UserDto dto, User entity) {
        if (StringUtils.hasText(dto.getUsername()))
            entity.setUsername(dto.getUsername());
        if (StringUtils.hasText(dto.getEmail()))
            entity.setEmail(dto.getEmail());

        // Map Roles - if roles list is provided (even if empty), update roles
        if (dto.getRoles() != null) {
            if (entity.getRoles() == null)
                entity.setRoles(new HashSet<>());

            // Only flush if there were existing roles to clear (for UPDATE case)
            boolean hadExistingRoles = !entity.getRoles().isEmpty();

            // Clear existing (orphanRemoval handles delete)
            entity.getRoles().clear();

            // Flush to ensure deletes are executed before inserts
            // This prevents unique constraint violation when re-adding same role
            if (hadExistingRoles) {
                entityManager.flush();
            }

            // Add new roles
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
