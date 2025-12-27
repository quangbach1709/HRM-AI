package com.hrm.backend.service.impl;

import com.hrm.backend.dto.PositionDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchPositionDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.entity.Department;
import com.hrm.backend.entity.Position;
import com.hrm.backend.repository.DepartmentRepository;
import com.hrm.backend.repository.PositionRepository;
import com.hrm.backend.service.PositionService;
import com.hrm.backend.specification.PositionSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;

    private final DepartmentRepository departmentRepository;

    private final PositionSpecification positionSpecification;

    @Autowired
    public PositionServiceImpl(PositionRepository positionRepository, DepartmentRepository departmentRepository,
            PositionSpecification positionSpecification) {
        this.positionRepository = positionRepository;
        this.departmentRepository = departmentRepository;
        this.positionSpecification = positionSpecification;
    }

    @Override
    public PositionDto saveOrUpdate(PositionDto dto) {
        Position entity;
        if (dto.getId() != null) {
            entity = positionRepository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vị trí với ID: " + dto.getId()));

            if (dto.getCode() != null && !dto.getCode().equals(entity.getCode())) {
                if (positionRepository.existsByCode(dto.getCode())) {
                    throw new IllegalArgumentException("Mã vị trí đã tồn tại: " + dto.getCode());
                }
            }
        } else {
            entity = new Position();
            entity.setVoided(false);

            if (dto.getCode() != null && positionRepository.existsByCode(dto.getCode())) {
                throw new IllegalArgumentException("Mã vị trí đã tồn tại: " + dto.getCode());
            }

            if (dto.getCode() == null || dto.getCode().isEmpty()) {
                entity.setCode("POS-" + System.currentTimeMillis());
            }
        }

        if (dto.getCode() != null && !dto.getCode().isEmpty()) {
            entity.setCode(dto.getCode());
        }
        entity.setName(dto.getName());
        entity.setIsMain(dto.getIsMain());

        if (dto.getDepartment() != null && dto.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(dto.getDepartment().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy phòng ban với ID: " + dto.getDepartment().getId()));
            entity.setDepartment(department);
        } else {
            entity.setDepartment(null);
        }

        if (dto.getStaff() != null) {
            // Staff assignment logic can be added here if needed
        }

        Position savedEntity = positionRepository.save(entity);
        return new PositionDto(savedEntity, true, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PositionDto getById(UUID uuid) {
        Position entity = positionRepository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vị trí với ID: " + uuid));

        if (entity.getVoided()) {
            throw new EntityNotFoundException("Không tìm thấy vị trí với ID: " + uuid);
        }

        return new PositionDto(entity, true, true);
    }

    @Override
    public void deleteById(UUID uuid) {
        Position entity = positionRepository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vị trí với ID: " + uuid));
        // Soft delete
        entity.setVoided(true);
        positionRepository.save(entity);
    }

    // ===== SEARCH WITH SPECIFICATION =====

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PositionDto> searchPositions(SearchPositionDto dto) {
        if (dto == null) {
            dto = new SearchPositionDto();
        }

        // Tạo Specification từ DTO
        Specification<Position> spec = positionSpecification.getSpecification(dto);

        // Tạo Pageable với sort
        Pageable pageable = positionSpecification.getPageable(dto);

        // Query database
        Page<Position> page = positionRepository.findAll(spec, pageable);

        // Map Entity sang DTO
        Page<PositionDto> dtoPage = page.map(pos -> new PositionDto(pos, true, true));

        return PageResponse.of(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PositionDto> pagingPositions(SearchDto dto) {
        // Convert SearchDto sang SearchPositionDto (backward compatible)
        SearchPositionDto searchDto = SearchPositionDto.fromSearchDto(dto);
        return searchPositions(searchDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionDto> getAllPositions() {
        return positionRepository.findByVoidedFalseOrderByNameAsc()
                .stream()
                .map(pos -> new PositionDto(pos, true, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionDto> getPositionsByDepartment(UUID departmentId) {
        return positionRepository.findByDepartmentIdAndVoidedFalse(departmentId)
                .stream()
                .map(pos -> new PositionDto(pos, true, true))
                .collect(Collectors.toList());
    }
}
