package com.hrm.backend.service.impl;

import com.hrm.backend.dto.DepartmentDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.entity.Department;
import com.hrm.backend.repository.DepartmentRepository;
import com.hrm.backend.service.DepartmentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentDto saveOrUpdate(DepartmentDto dto) {
        Department entity;

        if (dto.getId() != null) {
            // Update existing
            entity = departmentRepository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phòng ban với ID: " + dto.getId()));

            // Check code uniqueness if changed
            if (dto.getCode() != null && !dto.getCode().equals(entity.getCode())) {
                if (departmentRepository.existsByCode(dto.getCode())) {
                    throw new IllegalArgumentException("Mã phòng ban đã tồn tại: " + dto.getCode());
                }
            }

            // Prevent setting itself as parent
            if (dto.getParentId() != null && dto.getParentId().equals(dto.getId())) {
                throw new IllegalArgumentException("Phòng ban không thể là cha của chính nó");
            }
        } else {
            // Create new
            entity = new Department();
            entity.setVoided(false);

            // Validate code uniqueness
            if (dto.getCode() != null && departmentRepository.existsByCode(dto.getCode())) {
                throw new IllegalArgumentException("Mã phòng ban đã tồn tại: " + dto.getCode());
            }

            // Generate code if not provided
            if (dto.getCode() == null || dto.getCode().isEmpty()) {
                entity.setCode("DEPT-" + System.currentTimeMillis());
            }
        }

        // Update fields
        if (dto.getCode() != null && !dto.getCode().isEmpty()) {
            entity.setCode(dto.getCode());
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());

        // Set parent
        if (dto.getParentId() != null) {
            Department parent = departmentRepository.findById(dto.getParentId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Không tìm thấy phòng ban cha: " + dto.getParentId()));
            entity.setParent(parent);
        } else {
            entity.setParent(null);
        }

        Department saved = departmentRepository.save(entity);
        return new DepartmentDto(saved, false, false, false);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getById(UUID id) {
        Department entity = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phòng ban với ID: " + id));

        if (entity.getVoided()) {
            throw new EntityNotFoundException("Không tìm thấy phòng ban với ID: " + id);
        }

        return new DepartmentDto(entity, true, true, true);
    }

    @Override
    public void deleteById(UUID id) {
        Department entity = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phòng ban với ID: " + id));

        // Soft delete this department and all children
        softDeleteRecursive(entity);
    }

    private void softDeleteRecursive(Department department) {
        // Soft delete children first
        List<Department> children = departmentRepository.findByParentIdAndVoidedFalseOrderByNameAsc(department.getId());
        for (Department child : children) {
            softDeleteRecursive(child);
        }

        // Then soft delete this department
        department.setVoided(true);
        departmentRepository.save(department);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentDto> searchByKeyword(SearchDto searchDto) {
        int page = searchDto.getPageIndex() != null ? searchDto.getPageIndex() : 0;
        int size = searchDto.getPageSize() != null ? searchDto.getPageSize() : 10;

        Pageable pageable = PageRequest.of(page, size);
        Page<Department> result;

        if (searchDto.getParentId() != null) {
            // Get sub-departments of a parent
            result = departmentRepository.findByParentIdAndVoidedFalse(searchDto.getParentId(), pageable);
        } else if (searchDto.getKeyword() != null && !searchDto.getKeyword().trim().isEmpty()) {
            // Search by keyword
            result = departmentRepository.searchByKeyword(searchDto.getKeyword().trim(), pageable);
        } else {
            // Get root departments (no parent) - for tree structure
            result = departmentRepository.findByParentIsNullAndVoidedFalse(pageable);
        }

        // Convert to DTOs with subRows
        return result.map(dept -> new DepartmentDto(dept, false, true, false));
    }

    // Additional helper methods
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findByVoidedFalseOrderByNameAsc()
                .stream()
                .map(dept -> new DepartmentDto(dept, false, false, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getDepartmentTree() {
        List<Department> rootDepartments = departmentRepository.findByParentIsNullAndVoidedFalseOrderByNameAsc();
        return rootDepartments.stream()
                .map(dept -> new DepartmentDto(dept, false, true, true))
                .collect(Collectors.toList());
    }
}
