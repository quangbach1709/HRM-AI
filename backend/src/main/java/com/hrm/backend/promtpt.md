# PROMPT:  Phát Triển CRUD + Paging Với Specification Pattern Cho Entity Mới

## 📋 HƯỚNG DẪN CHO AI

### BƯỚC 1: ĐỌC VÀ PHÂN TÍCH

Trước khi code, AI cần **BẮT BUỘC** đọc và phân tích các file sau:

#### 1.1. Đọc Entity và DTO mới cần phát triển: 
```
# Đọc cấu trúc Entity mới
@file: src/main/java/com/hrm/backend/entity/{EntityName}.java

# Đọc DTO của Entity mới (nếu có)
@file:src/main/java/com/hrm/backend/dto/{EntityName}Dto.java
```

#### 1.2. Tham khảo các file mẫu đã hoàn thành (Department hoặc Position):
```
# BACKEND - Tham khảo mẫu
@file:src/main/java/com/hrm/backend/controller/DepartmentController.java
@file:src/main/java/com/hrm/backend/service/DepartmentService.java
@file:src/main/java/com/hrm/backend/service/impl/DepartmentServiceImpl.java
@file:src/main/java/com/hrm/backend/repository/DepartmentRepository.java
@file:src/main/java/com/hrm/backend/specification/DepartmentSpecification.java
@file:src/main/java/com/hrm/backend/dto/search/SearchDepartmentDto.java

# FRONTEND - Tham khảo mẫu
@file:src/services/departmentApi.ts
@file:src/hooks/useDepartments.ts
@file:src/types/department.ts
@file:src/pages/manager/DepartmentManagement.tsx
@file:src/components/modals/DepartmentFormModal.tsx
```

#### 1.3. Đọc các file base/common:
```
# Backend base files
@file:src/main/java/com/hrm/backend/specification/BaseSpecification.java
@file:src/main/java/com/hrm/backend/dto/SearchDto.java
@file:src/main/java/com/hrm/backend/dto/response/PageResponse.java

# Frontend base files
@file:src/types/common.ts
@file:src/types/pagination.ts
@file:src/components/common/DataTable/DataTable.tsx
@file:src/hooks/useDebounce.ts
```

---

## 🎯 MỤC TIÊU

Phát triển đầy đủ CRUD + Paging cho entity **`{TÊN_ENTITY}`** bao gồm: 

### Backend: 
1. ✅ SearchDto mở rộng với đầy đủ filter fields
2. ✅ Specification với tất cả điều kiện lọc
3. ✅ Repository với JpaSpecificationExecutor
4. ✅ Service Interface + Implementation đầy đủ CRUD
5. ✅ Controller với tất cả endpoints REST API

### Frontend: 
1. ✅ Types/Interfaces đầy đủ fields
2. ✅ API Service với tất cả methods
3. ✅ Custom Hook quản lý state và actions
4. ✅ List Page với DataTable (sort, filter, pagination)
5. ✅ Form Modal cho Create/Update

---

## 📁 CẤU TRÚC DỰ ÁN

### Backend Structure:
```
src/main/java/com/hrm/backend/
├── config/              # Cấu hình (Security, Cors...)
├── controller/          # REST Controllers
├── dto/
│   ├── auth/           # Auth DTOs
│   ├── response/       # PageResponse... 
│   └── search/         # SearchDto, Search{Entity}Dto... 
├── entity/             # JPA Entities
├── repository/         # JPA Repositories
├── security/           # JWT, Authentication...
├── service/
│   └── impl/          # Service Implementations
├── specification/      # JPA Specifications
└── utils/             # Utilities, Constants
```

### Frontend Structure:
```
src/
├── components/
│   ├── common/
│   │   └── DataTable/   # Table components
│   ├── modals/          # Form Modals
│   └── ui/              # UI elements
├── hooks/               # Custom Hooks
├── pages/
│   └── manager/         # Management Pages
├── services/            # API Services
└── types/               # TypeScript Types
```

---

## 🔧 BACKEND - CHI TIẾT IMPLEMENTATION

### FILE 1: `dto/search/Search{EntityName}Dto. java`

```java
package com.hrm.backend.dto. search;

import com.hrm.backend.dto.SearchDto;
import lombok.*;
import java.util.UUID;
import java.util.Date;

/**
 * DTO tìm kiếm cho {EntityName}
 * 
 * QUAN TRỌNG:  AI phải đọc Entity để thêm đầy đủ filter fields
 * Mỗi field có thể filter được trong Entity nên có field tương ứng ở đây
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Search{EntityName}Dto extends SearchDto {

    // ===== SORTING MỞ RỘNG (bắt buộc) =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    // TODO: AI đọc Entity và thêm TẤT CẢ các field có thể filter
    // Ví dụ dựa trên Entity fields: 
    // - Nếu Entity có field `code` (String) → thêm:  private String code;
    // - Nếu Entity có field `name` (String) → thêm: private String name;
    // - Nếu Entity có field `status` (String/Enum) → thêm: private String status;
    // - Nếu Entity có field `isActive` (Boolean) → thêm:  private Boolean isActive;
    // - Nếu Entity có field `department` (ManyToOne) → thêm: private UUID departmentId;
    // - Nếu Entity có field `type` (Enum) → thêm: private String type;

    /**
     * Factory method tạo từ SearchDto cơ bản
     */
    public static Search{EntityName}Dto fromSearchDto(SearchDto dto) {
        Search{EntityName}Dto result = new Search{EntityName}Dto();
        if (dto != null) {
            result. setId(dto.getId());
            result. setOwnerId(dto.getOwnerId());
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result. setKeyword(dto.getKeyword());
            result.setFromDate(dto.getFromDate());
            result.setToDate(dto.getToDate());
            result.setVoided(dto.getVoided());
            result.setOrderBy(dto.getOrderBy());
            result.setParentId(dto. getParentId());
            result.setExportExcel(dto.getExportExcel());

            if (dto.getOrderBy() != null) {
                result. setSortDirection(dto.getOrderBy() ?  "ASC" :  "DESC");
            }
        }
        return result;
    }
}
```

### FILE 2: `specification/{EntityName}Specification.java`

```java
package com. hrm.backend. specification;

import com.hrm.backend.dto.search.Search{EntityName}Dto;
import com.hrm.backend.entity.{EntityName};
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework. stereotype.Component;
import org.springframework.util. StringUtils;

import javax.persistence.criteria.*;
import java.util.*;

@Component
public class {EntityName}Specification extends BaseSpecification<{EntityName}> {

    // TODO: AI thêm tất cả các field có thể sort dựa trên Entity
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt"
            // Thêm:  "code", "name", "displayOrder", v.v.  dựa trên Entity
    );

    /**
     * Tạo Specification từ SearchDto
     * 
     * QUAN TRỌNG: AI phải đọc Entity và thêm TẤT CẢ điều kiện filter
     */
    public Specification<{EntityName}> getSpecification(Search{EntityName}Dto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tránh duplicate khi có JOIN
            query.distinct(true);

            // ===== 1. VOIDED (bắt buộc) =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            // TODO: AI thêm tất cả String fields cần search
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();
                
                // Thêm các field String cần tìm kiếm
                // keywordPredicates. add(likePredicate(cb, root.get("code"), keyword));
                // keywordPredicates.add(likePredicate(cb, root.get("name"), keyword));
                // keywordPredicates.add(likePredicate(cb, root.get("description"), keyword));
                
                if (! keywordPredicates. isEmpty()) {
                    predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            // ===== 3. FILTER BY ID =====
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 4. FILTER BY PARENT (nếu có) =====
            if (dto.getParentId() != null) {
                predicates.add(cb. equal(root.get("parent").get("id"), dto.getParentId()));
            }

            // ===== 5. DATE RANGE =====
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate()
            );
            if (datePredicate != null) {
                predicates. add(datePredicate);
            }

            // ===== 6. CÁC FILTER KHÁC =====
            // TODO: AI đọc Entity và SearchDto để thêm TẤT CẢ các filter
            // Ví dụ: 
            
            // Filter by code (String - like)
            // if (StringUtils.hasText(dto.getCode())) {
            //     predicates. add(likePredicate(cb, root.get("code"), dto.getCode()));
            // }
            
            // Filter by name (String - like)
            // if (StringUtils.hasText(dto.getName())) {
            //     predicates. add(likePredicate(cb, root.get("name"), dto.getName()));
            // }
            
            // Filter by status (String/Enum - equal)
            // if (StringUtils.hasText(dto.getStatus())) {
            //     predicates.add(cb.equal(root. get("status"), dto.getStatus()));
            // }
            
            // Filter by isActive (Boolean)
            // Predicate activePredicate = booleanPredicate(cb, root. get("isActive"), dto.getIsActive());
            // if (activePredicate != null) predicates.add(activePredicate);
            
            // Filter by related entity (ManyToOne - departmentId)
            // if (dto. getDepartmentId() != null) {
            //     predicates.add(cb. equal(root.get("department").get("id"), dto.getDepartmentId()));
            // }

            return andPredicates(cb, predicates);
        };
    }

    /**
     * Tạo Sort
     */
    public Sort getSort(Search{EntityName}Dto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";

        if (! ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort. Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection())
                    ? Sort.Direction.ASC :  Sort.Direction.DESC;
        } else if (dto.getOrderBy() != null) {
            direction = dto.getOrderBy() ?  Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    /**
     * Tạo Pageable
     */
    public Pageable getPageable(Search{EntityName}Dto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto. getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto. getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
```

### FILE 3: `repository/{EntityName}Repository.java`

```java
package com. hrm.backend. repository;

import com.hrm.backend.entity.{EntityName};
import org.springframework.data. jpa.repository. JpaRepository;
import org.springframework. data.jpa. repository.JpaSpecificationExecutor;
import org. springframework.stereotype.Repository;

import java.util.Optional;
import java.util. UUID;

@Repository
public interface {EntityName}Repository extends
        JpaRepository<{EntityName}, UUID>,
        JpaSpecificationExecutor<{EntityName}> {

    // TODO:  AI thêm các query methods cần thiết dựa trên Entity
    
    // Tìm theo code (nếu Entity có field code unique)
    // Optional<{EntityName}> findByCode(String code);
    // Optional<{EntityName}> findByCodeAndVoidedFalse(String code);
    // boolean existsByCode(String code);
    // boolean existsByCodeAndIdNot(String code, UUID id);
    
    // Tìm theo name
    // Optional<{EntityName}> findByName(String name);
    
    // Tìm theo parent (nếu có cấu trúc cây)
    // List<{EntityName}> findByParentIdAndVoidedFalse(UUID parentId);
    
    // Tìm theo related entity
    // List<{EntityName}> findByDepartmentIdAndVoidedFalse(UUID departmentId);
}
```

### FILE 4: `service/{EntityName}Service.java`

```java
package com. hrm.backend. service;

import com.hrm.backend.dto.{EntityName}Dto;
import com.hrm.backend.dto.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com. hrm.backend. dto.search.Search{EntityName}Dto;

import java.util. List;
import java.util.UUID;

public interface {EntityName}Service {

    // ===== PAGINATION =====
    PageResponse<{EntityName}Dto> search(Search{EntityName}Dto dto);
    PageResponse<{EntityName}Dto> paging(SearchDto dto);  // Backward compatible

    // ===== CRUD =====
    {EntityName}Dto getById(UUID id);
    {EntityName}Dto create({EntityName}Dto dto);
    {EntityName}Dto update(UUID id, {EntityName}Dto dto);
    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<{EntityName}Dto> getAll();
    List<{EntityName}Dto> exportToExcel(Search{EntityName}Dto dto);
    
    // TODO: AI thêm các methods khác nếu cần
    // Boolean existsByCode(String code);
    // List<{EntityName}Dto> getByParentId(UUID parentId);
}
```

### FILE 5: `service/impl/{EntityName}ServiceImpl.java`

```java
package com.hrm. backend.service.impl;

import com. hrm.backend. dto.{EntityName}Dto;
import com.hrm.backend.dto. SearchDto;
import com.hrm. backend.dto.response.PageResponse;
import com.hrm.backend.dto. search.Search{EntityName}Dto;
import com.hrm.backend.entity.{EntityName};
import com.hrm.backend.repository.{EntityName}Repository;
import com.hrm.backend.service.{EntityName}Service;
import com.hrm.backend.specification.{EntityName}Specification;
import lombok.RequiredArgsConstructor;
import org.springframework.data. domain.*;
import org.springframework.data.jpa.domain.Specification;
import org. springframework.stereotype.Service;
import org.springframework. transaction.annotation.Transactional;
import org.springframework. util.StringUtils;

import javax.persistence.EntityNotFoundException;
import java. util.*;
import java.util. stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class {EntityName}ServiceImpl implements {EntityName}Service {

    private final {EntityName}Repository repository;
    private final {EntityName}Specification specification;
    
    // TODO: AI thêm các repository khác nếu cần (cho related entities)
    // private final DepartmentRepository departmentRepository;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<{EntityName}Dto> search(Search{EntityName}Dto dto) {
        if (dto == null) {
            dto = new Search{EntityName}Dto();
        }

        Specification<{EntityName}> spec = specification. getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<{EntityName}> page = repository.findAll(spec, pageable);
        Page<{EntityName}Dto> dtoPage = page.map({EntityName}Dto:: new);

        return PageResponse.of(dtoPage);
    }

    @Override
    public PageResponse<{EntityName}Dto> paging(SearchDto dto) {
        Search{EntityName}Dto searchDto = Search{EntityName}Dto.fromSearchDto(dto);
        return search(searchDto);
    }

    // ==================== GET ====================

    @Override
    public {EntityName}Dto getById(UUID id) {
        return repository.findById(id)
                .map({EntityName}Dto::new)
                .orElseThrow(() -> new EntityNotFoundException("{EntityName} not found:  " + id));
    }

    @Override
    public List<{EntityName}Dto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || ! e.getVoided())
                .map({EntityName}Dto::new)
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public {EntityName}Dto create({EntityName}Dto dto) {
        // Validation
        validateForCreate(dto);

        // Create entity
        {EntityName} entity = new {EntityName}();
        mapDtoToEntity(dto, entity);
        
        // Set audit fields
        entity.setCreatedAt(new Date());
        entity.setVoided(false);

        // Save and return
        entity = repository.save(entity);
        return new {EntityName}Dto(entity);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public {EntityName}Dto update(UUID id, {EntityName}Dto dto) {
        // Find existing
        {EntityName} entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("{EntityName} not found: " + id));

        // Validation
        validateForUpdate(dto, entity);

        // Update entity
        mapDtoToEntity(dto, entity);
        
        // Set audit fields
        entity.setModifiedAt(new Date());

        // Save and return
        entity = repository.save(entity);
        return new {EntityName}Dto(entity);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        {EntityName} entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("{EntityName} not found: " + id));
        
        // Soft delete
        entity.setVoided(true);
        entity.setModifiedAt(new Date());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<{EntityName}Dto> exportToExcel(Search{EntityName}Dto dto) {
        if (dto == null) {
            dto = new Search{EntityName}Dto();
        }

        Specification<{EntityName}> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map({EntityName}Dto::new)
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Map DTO to Entity
     * TODO: AI phải đọc Entity và DTO để map TẤT CẢ các fields
     */
    private void mapDtoToEntity({EntityName}Dto dto, {EntityName} entity) {
        // TODO: Map tất cả các fields từ DTO sang Entity
        // Ví dụ: 
        // if (StringUtils.hasText(dto.getCode())) {
        //     entity.setCode(dto.getCode().trim());
        // }
        // if (StringUtils.hasText(dto.getName())) {
        //     entity.setName(dto.getName().trim());
        // }
        // if (dto.getDescription() != null) {
        //     entity.setDescription(dto.getDescription());
        // }
        // if (dto. getIsActive() != null) {
        //     entity.setIsActive(dto.getIsActive());
        // }
        // if (dto.getDisplayOrder() != null) {
        //     entity.setDisplayOrder(dto.getDisplayOrder());
        // }
        
        // Xử lý related entities (ManyToOne)
        // if (dto.getDepartmentId() != null) {
        //     Department department = departmentRepository.findById(dto.getDepartmentId())
        //             .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        //     entity.setDepartment(department);
        // }
        
        // if (dto.getParentId() != null) {
        //     {EntityName} parent = repository.findById(dto.getParentId())
        //             .orElseThrow(() -> new EntityNotFoundException("Parent not found"));
        //     entity.setParent(parent);
        // }
    }

    /**
     * Validate for Create
     * TODO: AI thêm validation rules dựa trên Entity constraints
     */
    private void validateForCreate({EntityName}Dto dto) {
        // Required fields
        // if (! StringUtils.hasText(dto.getCode())) {
        //     throw new IllegalArgumentException("Code is required");
        // }
        // if (!StringUtils. hasText(dto. getName())) {
        //     throw new IllegalArgumentException("Name is required");
        // }
        
        // Unique constraints
        // if (repository.existsByCode(dto.getCode())) {
        //     throw new IllegalArgumentException("Code already exists:  " + dto.getCode());
        // }
    }

    /**
     * Validate for Update
     */
    private void validateForUpdate({EntityName}Dto dto, {EntityName} existing) {
        // Required fields (same as create)
        
        // Unique constraints (exclude current entity)
        // if (StringUtils.hasText(dto.getCode()) && 
        //     ! dto.getCode().equals(existing.getCode()) &&
        //     repository.existsByCode(dto.getCode())) {
        //     throw new IllegalArgumentException("Code already exists: " + dto.getCode());
        // }
    }
}
```

### FILE 6: `controller/{EntityName}Controller.java`

```java
package com.hrm.backend.controller;

import com.hrm.backend.dto.{EntityName}Dto;
import com.hrm. backend.dto.SearchDto;
import com.hrm.backend.dto.response. PageResponse;
import com.hrm. backend.dto.search.Search{EntityName}Dto;
import com.hrm.backend.service.{EntityName}Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework. http.ResponseEntity;
import org.springframework.web.bind. annotation.*;

import java.util.List;
import java.util. UUID;

@RestController
@RequestMapping("/api/{entity-path}")  // TODO:  Thay bằng path thực (ví dụ: /api/staffs)
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class {EntityName}Controller {

    private final {EntityName}Service service;

    // ==================== PAGINATION ====================

    /**
     * Tìm kiếm với full filter và sort
     * POST /api/{entities}/search
     */
    @PostMapping("/search")
    public ResponseEntity<PageResponse<{EntityName}Dto>> search(
            @RequestBody Search{EntityName}Dto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    /**
     * Phân trang backward compatible với SearchDto cũ
     * POST /api/{entities}/paging
     */
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<{EntityName}Dto>> paging(
            @RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    /**
     * GET với query params
     * GET /api/{entities}? pageIndex=0&pageSize=10&keyword=abc
     */
    @GetMapping
    public ResponseEntity<PageResponse<{EntityName}Dto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID parentId,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
            // TODO: AI thêm các @RequestParam filter khác dựa trên SearchDto
    ) {
        Search{EntityName}Dto dto = new Search{EntityName}Dto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setParentId(parentId);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);
        // TODO: Set các filter fields khác

        return ResponseEntity. ok(service.search(dto));
    }

    // ==================== CRUD ====================

    /**
     * Lấy chi tiết theo ID
     * GET /api/{entities}/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<{EntityName}Dto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Tạo mới
     * POST /api/{entities}
     */
    @PostMapping
    public ResponseEntity<{EntityName}Dto> create(@RequestBody {EntityName}Dto dto) {
        {EntityName}Dto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật
     * PUT /api/{entities}/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<{EntityName}Dto> update(
            @PathVariable UUID id,
            @RequestBody {EntityName}Dto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /**
     * Xóa (soft delete)
     * DELETE /api/{entities}/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADDITIONAL ====================

    /**
     * Lấy tất cả (không phân trang) - cho dropdown
     * GET /api/{entities}/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<{EntityName}Dto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * Export Excel
     * POST /api/{entities}/export
     */
    @PostMapping("/export")
    public ResponseEntity<List<{EntityName}Dto>> export(
            @RequestBody Search{EntityName}Dto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
```

---

## ⚛️ FRONTEND - CHI TIẾT IMPLEMENTATION

### FILE 1: `types/{entityName}.ts`

```typescript
import { BaseSearchDto, SortDirection } from './common';

/**
 * Entity interface
 * TODO: AI phải đọc Entity backend và DTO để định nghĩa TẤT CẢ fields
 */
export interface {EntityName} {
  id: string;
  
  // TODO:  Thêm tất cả fields từ Entity
  // code?:  string;
  // name?: string;
  // description?: string;
  // isActive?: boolean;
  // displayOrder?:  number;
  
  // Audit fields
  voided?: boolean;
  createdAt?:  string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  
  // Related entities (nested objects)
  // parent?: {
  //   id:  string;
  //   name: string;
  //   code?: string;
  // };
  // department?: {
  //   id: string;
  //   name: string;
  // };
}

/**
 * Form data interface (for create/update)
 * Có thể khác Entity interface
 */
export interface {EntityName}FormData {
  id?: string;
  
  // TODO:  Thêm các fields cho form
  // code:  string;
  // name: string;
  // description?:  string;
  // isActive?:  boolean;
  // parentId?: string;
  // departmentId?: string;
}

/**
 * Search DTO
 */
export interface Search{EntityName}Dto extends BaseSearchDto {
  // TODO:  Thêm các filter fields đặc thù
  // code?: string;
  // name?: string;
  // status?: string;
  // isActive?: boolean;
  // departmentId?: string;
}

/**
 * Default search params
 */
export const defaultSearch{EntityName}Dto: Search{EntityName}Dto = {
  pageIndex:  0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};
```

### FILE 2: `services/{entityName}Api.ts`

```typescript
import api from './api';
import { {EntityName}, {EntityName}FormData, Search{EntityName}Dto } from '../types/{entityName}';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/{entities}';  // TODO: Thay bằng endpoint thực

export const {entityName}Api = {
  // ==================== PAGINATION ====================
  
  /**
   * Tìm kiếm với full filter và sort
   */
  async search(params: Search{EntityName}Dto): Promise<PageResponse<{EntityName}>> {
    const response = await api.post<PageResponse<{EntityName}>>(
      `${ENDPOINT}/search`,
      params
    );
    return response.data;
  },

  // ==================== CRUD ====================

  /**
   * Lấy chi tiết theo ID
   */
  async getById(id: string): Promise<{EntityName}> {
    const response = await api.get<{EntityName}>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Lấy tất cả (không phân trang) - cho dropdown
   */
  async getAll(): Promise<{EntityName}[]> {
    const response = await api.get<{EntityName}[]>(`${ENDPOINT}/all`);
    return response. data;
  },

  /**
   * Tạo mới
   */
  async create(data: {EntityName}FormData): Promise<{EntityName}> {
    const response = await api.post<{EntityName}>(ENDPOINT, data);
    return response.data;
  },

  /**
   * Cập nhật
   */
  async update(id:  string, data: {EntityName}FormData): Promise<{EntityName}> {
    const response = await api.put<{EntityName}>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Xóa (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api. delete(`${ENDPOINT}/${id}`);
  },

  // ==================== ADDITIONAL ====================

  /**
   * Export Excel
   */
  async export(params: Search{EntityName}Dto): Promise<{EntityName}[]> {
    const response = await api. post<{EntityName}[]>(`${ENDPOINT}/export`, params);
    return response.data;
  },
};
```

### FILE 3: `hooks/use{EntityName}s.ts`

```typescript
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  {EntityName},
  Search{EntityName}Dto,
  defaultSearch{EntityName}Dto,
} from '../types/{entityName}';
import { PageResponse } from '../types/pagination';
import { SortDirection } from '../types/common';
import { {entityName}Api } from '../services/{entityName}Api';
import { useDebounce } from './useDebounce';

interface Use{EntityName}sReturn {
  // Data
  data: PageResponse<{EntityName}> | null;
  loading: boolean;
  error: string | null;

  // Search params
  searchParams:  Search{EntityName}Dto;

  // Pagination actions
  handlePageChange: (pageIndex: number) => void;
  handlePageSizeChange: (pageSize: number) => void;

  // Sort & Filter actions
  handleSort:  (sortBy: string) => void;
  handleFilter: (filters: Partial<Search{EntityName}Dto>) => void;
  handleSearch: (keyword: string) => void;
  handleReset: () => void;

  // Other actions
  refresh: () => void;
}

export function use{EntityName}s(
  initialParams?:  Partial<Search{EntityName}Dto>
): Use{EntityName}sReturn {
  // State
  const [data, setData] = useState<PageResponse<{EntityName}> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<Search{EntityName}Dto>({
    ...defaultSearch{EntityName}Dto,
    ...initialParams,
  });

  // Debounce keyword
  const debouncedKeyword = useDebounce(searchParams. keyword, 500);

  // API params
  const apiParams = useMemo(
    () => ({ ...searchParams, keyword: debouncedKeyword }),
    [searchParams, debouncedKeyword]
  );

  // Fetch data
  const fetchData = useCallback(async (params: Search{EntityName}Dto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await {entityName}Api. search(params);
      setData(response);
    } catch (err:  any) {
      const message =
        err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(message);
      console.error('Error fetching {entityName}s:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect:  fetch when params change
  useEffect(() => {
    fetchData(apiParams);
  }, [apiParams, fetchData]);

  // ==================== HANDLERS ====================

  const handlePageChange = useCallback((pageIndex: number) => {
    setSearchParams((prev) => ({ ...prev, pageIndex }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, pageIndex: 0 }));
  }, []);

  const handleSort = useCallback((sortBy:  string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy,
      sortDirection: 
        prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      pageIndex: 0,
    }));
  }, []);

  const handleFilter = useCallback((filters: Partial<Search{EntityName}Dto>) => {
    setSearchParams((prev) => ({ ...prev, ...filters, pageIndex: 0 }));
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setSearchParams((prev) => ({
      ...prev,
      keyword:  keyword || undefined,
      pageIndex: 0,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSearchParams(defaultSearch{EntityName}Dto);
  }, []);

  const refresh = useCallback(() => {
    fetchData(apiParams);
  }, [fetchData, apiParams]);

  return {
    data,
    loading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    handleReset,
    refresh,
  };
}
```

### FILE 4: `components/modals/{EntityName}FormModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { {EntityName}, {EntityName}FormData } from '../../types/{entityName}';
import { {entityName}Api } from '../../services/{entityName}Api';
import { useToast } from '../../hooks/useToast';

interface {EntityName}FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {EntityName} | null;  // null = create mode, object = edit mode
}

const initialFormData: {EntityName}FormData = {
  // TODO: AI định nghĩa giá trị mặc định cho form
  // code: '',
  // name: '',
  // description: '',
  // isActive: true,
};

export function {EntityName}FormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: {EntityName}FormModalProps) {
  const [formData, setFormData] = useState<{EntityName}FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const isEditMode = !!editData;

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id,
        // TODO: Map entity fields to form data
        // code:  editData.code || '',
        // name: editData.name || '',
        // description: editData. description || '',
        // isActive: editData.isActive ??  true,
        // parentId: editData. parent?.id,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editData, isOpen]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value ?  Number(value) : undefined;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors:  Record<string, string> = {};

    // TODO: AI thêm validation rules dựa trên Entity constraints
    // if (!formData. code?. trim()) {
    //   newErrors. code = 'Mã là bắt buộc';
    // }
    // if (!formData.name?.trim()) {
    //   newErrors.name = 'Tên là bắt buộc';
    // }

    setErrors(newErrors);
    return Object. keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditMode && editData) {
        await {entityName}Api. update(editData. id, formData);
        showToast('Cập nhật thành công', 'success');
      } else {
        await {entityName}Api.create(formData);
        showToast('Tạo mới thành công', 'success');
      }
      onSuccess();
      onClose();
    } catch (err:  any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Cập nhật' : 'Thêm mới'} {EntityName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* TODO: AI tạo form fields dựa trên Entity */}
            
            {/* Ví dụ: Text input */}
            {/* <div className="form-group">
              <label htmlFor="code">Mã <span className="required">*</span></label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code || ''}
                onChange={handleChange}
                className={errors. code ? 'error' : ''}
                disabled={isEditMode}  // Không cho sửa code khi edit
              />
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div> */}

            {/* Ví dụ:  Textarea */}
            {/* <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData. description || ''}
                onChange={handleChange}
                rows={3}
              />
            </div> */}

            {/* Ví dụ:  Checkbox */}
            {/* <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive ??  true}
                  onChange={handleChange}
                />
                Đang hoạt động
              </label>
            </div> */}

            {/* Ví dụ: Select (dropdown) */}
            {/* <div className="form-group">
              <label htmlFor="parentId">Phòng ban cha</label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId || ''}
                onChange={handleChange}
              >
                <option value="">-- Chọn --</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div> */}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' :  isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### FILE 5: `pages/manager/{EntityName}Management.tsx`

```tsx
import React, { useState, useCallback, useMemo } from 'react';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { {EntityName}FormModal } from '../../components/modals/{EntityName}FormModal';
import { use{EntityName}s } from '../../hooks/use{EntityName}s';
import { {EntityName}, Search{EntityName}Dto } from '../../types/{entityName}';
import { {entityName}Api } from '../../services/{entityName}Api';
import { ColumnDef } from '../../types/pagination';
import { useToast } from '../../hooks/useToast';
import './styles/{EntityName}Management.css';

/**
 * Định nghĩa columns cho bảng
 * TODO: AI đọc Entity và định nghĩa TẤT CẢ các cột cần hiển thị
 */
const columns: ColumnDef<{EntityName}>[] = [
  // TODO:  Thêm các cột dựa trên Entity fields
  // {
  //   key: 'code',
  //   header: 'Mã',
  //   sortable: true,
  //   sortKey: 'code',
  //   filterable: true,
  //   filterType: 'text',
  //   filterKey: 'code',
  //   width: '120px',
  // },
  // {
  //   key: 'name',
  //   header: 'Tên',
  //   sortable:  true,
  //   sortKey: 'name',
  //   filterable:  true,
  //   filterType: 'text',
  //   filterKey:  'name',
  //   width:  '200px',
  // },
  // {
  //   key: 'parent. name',
  //   header: 'Thuộc về',
  //   sortable: false,
  //   filterable: false,
  //   width: '150px',
  //   render: (value) => value || '-',
  // },
  // {
  //   key:  'isActive',
  //   header: 'Trạng thái',
  //   sortable: false,
  //   filterable: true,
  //   filterType: 'boolean',
  //   filterKey: 'isActive',
  //   width: '100px',
  //   render: (value) => (
  //     <span className={`badge ${value ? 'badge-success' :  'badge-secondary'}`}>
  //       {value ?  'Hoạt động' :  'Ngưng'}
  //     </span>
  //   ),
  // },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    sortable: true,
    sortKey: 'createdAt',
    filterable: false,
    width:  '120px',
    render: (value) =>
      value ? new Date(value).toLocaleDateString('vi-VN') : '-',
  },
  {
    key: 'actions',
    header:  'Thao tác',
    sortable: false,
    filterable: false,
    width: '120px',
    render: (_, row) => null, // Handled in DataTable
  },
];

export function {EntityName}Management() {
  // State
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{EntityName} | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { showToast } = useToast();

  // Hook quản lý data
  const {
    data,
    loading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    handleReset,
    refresh,
  } = use{EntityName}s();

  // ==================== HANDLERS ====================

  const handleKeywordChange = useCallback(
    (e:  React. ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  const handleColumnFilter = useCallback(
    (filters: Record<string, any>) => {
      handleFilter(filters as Partial<Search{EntityName}Dto>);
    },
    [handleFilter]
  );

  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  // Open modal for create
  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  // Open modal for edit
  const handleEdit = useCallback((item: {EntityName}) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  // After modal success
  const handleModalSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  // Delete
  const handleDelete = useCallback(async (id: string) => {
    if (! window.confirm('Bạn có chắc chắn muốn xóa? ')) return;

    setDeletingId(id);
    try {
      await {entityName}Api. delete(id);
      showToast('Xóa thành công', 'success');
      refresh();
    } catch (err: any) {
      const message = err.response?. data?.message || 'Có lỗi xảy ra';
      showToast(message, 'error');
    } finally {
      setDeletingId(null);
    }
  }, [refresh, showToast]);

  // Columns with actions
  const columnsWithActions = useMemo(() => {
    return columns.map((col) => {
      if (col.key === 'actions') {
        return {
          ...col,
          render: (_: any, row:  {EntityName}) => (
            <div className="action-buttons">
              <button
                className="btn-icon btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                title="Sửa"
              >
                ✏️
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.id);
                }}
                disabled={deletingId === row. id}
                title="Xóa"
              >
                {deletingId === row.id ? '.. .' : '🗑️'}
              </button>
            </div>
          ),
        };
      }
      return col;
    });
  }, [handleEdit, handleDelete, deletingId]);

  // ==================== RENDER ====================

  return (
    <div className="{entityName}-management-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Quản lý {EntityName}</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm mới
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={refresh}>Thử lại</button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={handleKeywordChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* TODO:  Thêm các filter dropdowns nếu cần */}
        {/* <select
          value={searchParams.departmentId || ''}
          onChange={(e) => handleFilter({ departmentId: e.target.value || undefined })}
          className="filter-select"
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select> */}

        <div className="filter-actions">
          <button className="btn btn-outline" onClick={handleResetClick}>
            Đặt lại
          </button>
          <button className="btn btn-outline" onClick={refresh}>
            ↻ Làm mới
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable<{EntityName}>
        data={data}
        columns={columnsWithActions}
        loading={loading}
        sortBy={searchParams.sortBy || 'createdAt'}
        sortDirection={searchParams.sortDirection || 'DESC'}
        onSort={handleSort}
        onFilter={handleColumnFilter}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRowClick={handleEdit}
        rowKey="id"
      />

      {/* FORM MODAL */}
      <{EntityName}FormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editData={editingItem}
      />
    </div>
  );
}
```

---

## ✅ CHECKLIST THỰC HIỆN

### Trước khi bắt đầu:
- [ ] Đọc Entity mới:  `entity/{EntityName}.java`
- [ ] Đọc DTO mới (nếu có): `dto/{EntityName}Dto.java`
- [ ] Tham khảo mẫu: DepartmentController, DepartmentService, etc. 

### Backend:
- [ ] Tạo `dto/search/Search{EntityName}Dto.java` - đầy đủ filter fields
- [ ] Tạo `specification/{EntityName}Specification.java` - đầy đủ predicates
- [ ] Tạo/Sửa `repository/{EntityName}Repository.java` - thêm JpaSpecificationExecutor
- [ ] Tạo `service/{EntityName}Service.java` - interface
- [ ] Tạo `service/impl/{EntityName}ServiceImpl.java` - đầy đủ CRUD + validation
- [ ] Tạo `controller/{EntityName}Controller.java` - đầy đủ endpoints
- [ ] Test với Postman/Swagger

### Frontend:
- [ ] Tạo `types/{entityName}. ts` - đầy đủ interfaces
- [ ] Tạo `services/{entityName}Api.ts` - đầy đủ API methods
- [ ] Tạo `hooks/use{EntityName}s.ts` - hook quản lý state
- [ ] Tạo `components/modals/{EntityName}FormModal. tsx` - form create/update
- [ ] Tạo `pages/manager/{EntityName}Management.tsx` - trang quản lý
- [ ] Định nghĩa columns đầy đủ với sort/filter
- [ ] Test UI:  CRUD, sort, filter, pagination

---

## 📝 LƯU Ý QUAN TRỌNG

1. **BẮT BUỘC đọc Entity**: AI phải đọc file Entity để biết TẤT CẢ các fields
2. **BẮT BUỘC đọc DTO**:  Nếu có DTO riêng, phải đọc để map đúng fields
3. **Tham khảo mẫu**: Luôn tham khảo Department hoặc Position đã hoàn thành
4. **Không thiếu fields**: Mỗi field trong Entity cần có filter/sort/display tương ứng
5. **Validation**: Backend phải có validation cho required fields và unique constraints
6. **Error handling**: Xử lý lỗi đầy đủ ở cả backend và frontend
7. **Backward compatible**: Giữ endpoint `/paging` cũ với SearchDto

---

