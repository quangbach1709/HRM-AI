# PROMPT:  Chuyển Đổi Hệ Thống Paging Sang JPA Specification Pattern

## 📋 THÔNG TIN DỰ ÁN HIỆN TẠI

### SearchDto hiện tại (Base class):
```java
public class SearchDto {
    public UUID id;
    public UUID ownerId;
    public Integer pageIndex;
    public Integer pageSize;
    public String keyword;
    public Date fromDate;
    public Date toDate;
    public Boolean voided;
    public Boolean orderBy; // mặc định là DESC của trường createdAt
    public UUID roleId;
    public UUID parentId;
    public Boolean exportExcel;
}
```

### Entity đã hoàn thành:  Department
### Cách đang dùng: @Query annotation trong Repository

---

## 🎯 MỤC TIÊU REFACTOR

Chuyển đổi từ `@Query` sang **JPA Specification Pattern** để hỗ trợ: 
1. ✅ Dynamic filtering - lọc động theo nhiều điều kiện
2. ✅ Sortable columns - click vào header bảng để sắp xếp theo cột bất kỳ
3. ✅ Column-level filtering - lọc riêng theo từng cột
4. ✅ Pagination ở database level - hiệu năng tốt
5. ✅ Dễ mở rộng thêm điều kiện filter mới

---

## 📁 BACKEND - CẤU TRÚC THƯ MỤC

```
src/main/java/com/{package}/
├── specification/
│   ├── BaseSpecification.java          # Class base helper
│   └── DepartmentSpecification. java    # Specification cho Department
├── dto/
│   ├── SearchDto. java                  # GIỮ NGUYÊN - Base class hiện tại
│   ├── search/
│   │   └── SearchDepartmentDto.java    # MỞ RỘNG từ SearchDto
│   └── response/
│       └── PageResponse.java           # Response wrapper
├── repository/
│   └── DepartmentRepository.java       # Thêm JpaSpecificationExecutor
├── service/
│   └── impl/
│       └── DepartmentServiceImpl.java  # Sử dụng Specification
└── controller/
    └── DepartmentController. java       # Cập nhật endpoint
```

---

## 🔧 BACKEND - CHI TIẾT IMPLEMENTATION

### BƯỚC 1: Tạo BaseSpecification. java

```java
package com.{package}.specification;

import org.springframework.data. jpa.domain. Specification;
import org.springframework.util.StringUtils;

import javax.persistence. criteria.*;
import java.util.*;
import java.time.LocalDateTime;

/**
 * Base class chứa các method helper cho Specification
 * Tất cả Specification khác sẽ extends class này
 */
public abstract class BaseSpecification<T> {

    /**
     * Tạo predicate LIKE cho tìm kiếm text (case-insensitive)
     * Ví dụ:  LOWER(name) LIKE '%keyword%'
     */
    protected Predicate likePredicate(CriteriaBuilder cb, Expression<String> field, String value) {
        if (! StringUtils.hasText(value)) return null;
        return cb.like(cb. lower(field), "%" + value. toLowerCase().trim() + "%");
    }

    /**
     * Tạo predicate EQUAL với null-safe
     */
    protected <V> Predicate equalPredicate(CriteriaBuilder cb, Expression<V> field, V value) {
        if (value == null) return null;
        return cb.equal(field, value);
    }

    /**
     * Tạo predicate cho khoảng thời gian (fromDate - toDate)
     */
    protected Predicate dateRangePredicate(
            CriteriaBuilder cb,
            Expression<?  extends Date> field,
            Date fromDate,
            Date toDate) {

        List<Predicate> predicates = new ArrayList<>();

        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(field, fromDate));
        }
        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(field, toDate));
        }

        if (predicates.isEmpty()) return null;
        return cb.and(predicates.toArray(new Predicate[0]));
    }

    /**
     * Tạo predicate cho Boolean field với null handling
     */
    protected Predicate booleanPredicate(CriteriaBuilder cb, Expression<Boolean> field, Boolean value) {
        if (value == null) return null;
        return value ? cb.isTrue(field) : cb.isFalse(field);
    }

    /**
     * Tạo predicate cho voided/soft-delete
     * Mặc định:  lấy records chưa bị xóa (voided = false hoặc null)
     */
    protected Predicate voidedPredicate(CriteriaBuilder cb, Expression<Boolean> field, Boolean voided) {
        if (voided != null && voided) {
            return cb. isTrue(field); // Lấy records đã xóa
        }
        // Mặc định: lấy records chưa xóa
        return cb.or(cb.isNull(field), cb.isFalse(field));
    }

    /**
     * Tạo predicate IN cho danh sách values
     */
    protected <V> Predicate inPredicate(Expression<V> field, Collection<V> values) {
        if (values == null || values.isEmpty()) return null;
        return field.in(values);
    }

    /**
     * Combine nhiều predicates với AND (bỏ qua null predicates)
     */
    protected Predicate andPredicates(CriteriaBuilder cb, List<Predicate> predicates) {
        List<Predicate> validPredicates = new ArrayList<>();
        for (Predicate p : predicates) {
            if (p != null) validPredicates.add(p);
        }

        if (validPredicates.isEmpty()) {
            return cb.conjunction(); // Trả về TRUE
        }
        return cb.and(validPredicates.toArray(new Predicate[0]));
    }

    /**
     * Combine nhiều predicates với OR (bỏ qua null predicates)
     */
    protected Predicate orPredicates(CriteriaBuilder cb, List<Predicate> predicates) {
        List<Predicate> validPredicates = new ArrayList<>();
        for (Predicate p : predicates) {
            if (p != null) validPredicates.add(p);
        }

        if (validPredicates.isEmpty()) {
            return cb.conjunction();
        }
        return cb.or(validPredicates. toArray(new Predicate[0]));
    }
}
```

### BƯỚC 2: Tạo SearchDepartmentDto.java (Mở rộng từ SearchDto)

```java
package com.{package}.dto.search;

import com.{package}.dto.SearchDto;
import lombok.*;

import java.util.UUID;

/**
 * DTO tìm kiếm cho Department
 * Extends SearchDto để kế thừa các field cơ bản
 * Thêm các field đặc thù cho Department
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchDepartmentDto extends SearchDto {

    // ===== SORTING MỞ RỘNG (hỗ trợ click header bảng) =====
    private String sortBy = "createdAt";      // Field để sort, mặc định createdAt
    private String sortDirection = "DESC";     // ASC hoặc DESC

    // ===== FILTER ĐẶC THÙ CHO DEPARTMENT =====
    private UUID organizationId;               // Lọc theo tổ chức
    private String code;                       // Lọc theo mã phòng ban
    private String name;                       // Lọc theo tên phòng ban
    private Boolean isActive;                  // Lọc theo trạng thái hoạt động
    private Integer level;                     // Lọc theo cấp độ phòng ban

    // ===== NESTED FILTER =====
    private UUID managerId;                    // Lọc theo người quản lý

    /**
     * Builder method để tạo từ SearchDto cơ bản
     */
    public static SearchDepartmentDto fromSearchDto(SearchDto dto) {
        SearchDepartmentDto result = new SearchDepartmentDto();
        if (dto != null) {
            result. setId(dto. getId());
            result.setOwnerId(dto.getOwnerId());
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result. setKeyword(dto.getKeyword());
            result.setFromDate(dto. getFromDate());
            result.setToDate(dto.getToDate());
            result.setVoided(dto.getVoided());
            result.setOrderBy(dto.getOrderBy());
            result.setParentId(dto. getParentId());
            result.setExportExcel(dto.getExportExcel());

            // Map orderBy sang sortDirection
            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto.getOrderBy() ?  "ASC" :  "DESC");
            }
        }
        return result;
    }
}
```

### BƯỚC 3: Tạo PageResponse.java

```java
package com. {package}.dto. response;

import lombok.*;
import org.springframework.data. domain.Page;

import java.util.List;

/**
 * Response wrapper cho pagination
 * Chuẩn hóa response trả về frontend
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {

    private List<T> content;          // Danh sách data
    private int pageNumber;           // Trang hiện tại (0-based)
    private int pageSize;             // Số lượng mỗi trang
    private long totalElements;       // Tổng số records
    private int totalPages;           // Tổng số trang
    private boolean first;            // Là trang đầu? 
    private boolean last;             // Là trang cuối? 
    private boolean hasNext;          // Có trang tiếp? 
    private boolean hasPrevious;      // Có trang trước?

    /**
     * Factory method tạo PageResponse từ Spring Page
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page. getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page. isFirst())
                .last(page. isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
```

### BƯỚC 4: Tạo DepartmentSpecification.java

```java
package com. {package}.specification;

import com.{package}.dto.search.SearchDepartmentDto;
import com.{package}.entity.Department;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org. springframework.stereotype.Component;
import org.springframework. util.StringUtils;

import javax.persistence. criteria.*;
import java.util.*;

/**
 * Specification cho Department entity
 * Xử lý tất cả logic filter và sort động
 */
@Component
public class DepartmentSpecification extends BaseSpecification<Department> {

    // Danh sách các field được phép sort (whitelist để bảo mật)
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "code", "name", "createdAt", "modifiedAt", "level", "displayOrder"
    );

    /**
     * Tạo Specification từ SearchDepartmentDto
     * Đây là method chính xử lý tất cả điều kiện filter
     */
    public Specification<Department> getSpecification(SearchDepartmentDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ===== DISTINCT để tránh duplicate khi JOIN =====
            query.distinct(true);

            // ===== 1. ĐIỀU KIỆN VOIDED (soft delete) =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. TÌM KIẾM KEYWORD (tìm trong nhiều fields) =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                Predicate keywordPredicate = cb.or(
                        likePredicate(cb, root.get("name"), keyword),
                        likePredicate(cb, root. get("code"), keyword),
                        likePredicate(cb, root.get("description"), keyword)
                );
                predicates.add(keywordPredicate);
            }

            // ===== 3. LỌC THEO CODE (filter riêng theo cột) =====
            if (StringUtils.hasText(dto.getCode())) {
                predicates.add(likePredicate(cb, root.get("code"), dto.getCode()));
            }

            // ===== 4. LỌC THEO NAME (filter riêng theo cột) =====
            if (StringUtils.hasText(dto.getName())) {
                predicates. add(likePredicate(cb, root.get("name"), dto.getName()));
            }

            // ===== 5. LỌC THEO PARENT (phòng ban cha) =====
            if (dto. getParentId() != null) {
                predicates.add(cb.equal(root. get("parent").get("id"), dto.getParentId()));
            }

            // ===== 6. LỌC THEO ORGANIZATION =====
            if (dto.getOrganizationId() != null) {
                predicates.add(cb.equal(root.get("organization").get("id"), dto.getOrganizationId()));
            }

            // ===== 7. LỌC THEO ID CỤ THỂ =====
            if (dto. getId() != null) {
                predicates.add(cb. equal(root.get("id"), dto.getId()));
            }

            // ===== 8. LỌC THEO OWNER =====
            if (dto.getOwnerId() != null) {
                predicates.add(cb.equal(root. get("owner").get("id"), dto.getOwnerId()));
            }

            // ===== 9. LỌC THEO MANAGER =====
            if (dto.getManagerId() != null) {
                predicates.add(cb.equal(root. get("manager").get("id"), dto.getManagerId()));
            }

            // ===== 10. LỌC THEO TRẠNG THÁI ACTIVE =====
            Predicate activePredicate = booleanPredicate(cb, root. get("isActive"), dto.getIsActive());
            if (activePredicate != null) {
                predicates.add(activePredicate);
            }

            // ===== 11. LỌC THEO LEVEL =====
            if (dto.getLevel() != null) {
                predicates.add(cb. equal(root.get("level"), dto.getLevel()));
            }

            // ===== 12. LỌC THEO KHOẢNG THỜI GIAN TẠO =====
            Predicate datePredicate = dateRangePredicate(
                    cb,
                    root.get("createdAt"),
                    dto.getFromDate(),
                    dto.getToDate()
            );
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // ===== COMBINE TẤT CẢ PREDICATES =====
            return andPredicates(cb, predicates);
        };
    }

    /**
     * Tạo Sort object từ DTO
     * Hỗ trợ click vào header bảng để sort
     */
    public Sort getSort(SearchDepartmentDto dto) {
        // Lấy field sort, mặc định là createdAt
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";

        // Validate field được phép sort (bảo mật)
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        // Xác định direction
        Sort.Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection())
                    ? Sort.Direction. ASC
                    : Sort.Direction. DESC;
        } else if (dto.getOrderBy() != null) {
            // Backward compatible với field orderBy cũ
            direction = dto.getOrderBy() ?  Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    /**
     * Tạo Pageable từ DTO
     */
    public Pageable getPageable(SearchDepartmentDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto. getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto. getPageSize() : 10;

        // Validate và giới hạn
        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100); // Min 1, Max 100

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }

    /**
     * Tạo Pageable không giới hạn (cho export Excel)
     */
    public Pageable getUnpagedWithSort(SearchDepartmentDto dto) {
        return PageRequest.of(0, Integer.MAX_VALUE, getSort(dto));
    }
}
```

### BƯỚC 5: Cập nhật DepartmentRepository.java

```java
package com.{package}.repository;

import com.{package}.entity.Department;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework. stereotype.Repository;

import java.util.*;

@Repository
public interface DepartmentRepository extends
        JpaRepository<Department, UUID>,
        JpaSpecificationExecutor<Department> {  // <-- THÊM INTERFACE NÀY

    // ===== GIỮ LẠI các method đơn giản =====
    Optional<Department> findByCode(String code);

    Optional<Department> findByCodeAndVoidedFalse(String code);

    List<Department> findByParentIdAndVoidedFalse(UUID parentId);

    boolean existsByCode(String code);

    // ===== XÓA BỎ method @Query phức tạp dùng cho paging =====
    // @Query("SELECT d FROM Department d WHERE d.voided = false AND ...")
    // Page<Department> searchByKeyword(... );  <-- XÓA METHOD NÀY
}
```

### BƯỚC 6: Cập nhật DepartmentServiceImpl.java

```java
package com. {package}.service. impl;

import com.{package}.dto.DepartmentDto;
import com.{package}.dto.SearchDto;
import com. {package}.dto.response.PageResponse;
import com.{package}.dto.search.SearchDepartmentDto;
import com.{package}.entity.Department;
import com.{package}.repository.DepartmentRepository;
import com.{package}.service.DepartmentService;
import com.{package}.specification.DepartmentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data. domain.*;
import org.springframework.data.jpa.domain.Specification;
import org. springframework.stereotype.Service;
import org.springframework. transaction.annotation. Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentSpecification departmentSpecification;

    /**
     * Phân trang với filter động - PHƯƠNG THỨC MỚI
     * Sử dụng SearchDepartmentDto để hỗ trợ đầy đủ tính năng
     */
    @Override
    public PageResponse<DepartmentDto> searchDepartments(SearchDepartmentDto dto) {
        if (dto == null) {
            dto = new SearchDepartmentDto();
        }

        // Tạo Specification từ DTO
        Specification<Department> spec = departmentSpecification. getSpecification(dto);

        // Tạo Pageable với sort
        Pageable pageable = departmentSpecification.getPageable(dto);

        // Query database - PAGINATION XỬ LÝ Ở DATABASE LEVEL
        Page<Department> page = departmentRepository. findAll(spec, pageable);

        // Map Entity sang DTO
        Page<DepartmentDto> dtoPage = page.map(DepartmentDto::new);

        return PageResponse. of(dtoPage);
    }

    /**
     * Phân trang - BACKWARD COMPATIBLE với SearchDto cũ
     * Giữ lại để không break code cũ của frontend
     */
    @Override
    public PageResponse<DepartmentDto> pagingDepartments(SearchDto dto) {
        // Convert SearchDto sang SearchDepartmentDto
        SearchDepartmentDto searchDto = SearchDepartmentDto. fromSearchDto(dto);
        return searchDepartments(searchDto);
    }

    /**
     * Export Excel - lấy tất cả records theo filter (không phân trang)
     */
    @Override
    public List<DepartmentDto> exportToExcel(SearchDepartmentDto dto) {
        if (dto == null) {
            dto = new SearchDepartmentDto();
        }

        Specification<Department> spec = departmentSpecification.getSpecification(dto);
        Sort sort = departmentSpecification.getSort(dto);

        List<Department> departments = departmentRepository.findAll(spec, sort);

        return departments.stream()
                .map(DepartmentDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Export Excel - BACKWARD COMPATIBLE
     */
    @Override
    public List<DepartmentDto> exportToExcel(SearchDto dto) {
        SearchDepartmentDto searchDto = SearchDepartmentDto.fromSearchDto(dto);
        return exportToExcel(searchDto);
    }

    // ===== CÁC METHOD CRUD KHÁC GIỮ NGUYÊN =====

    @Override
    public DepartmentDto getById(UUID id) {
        return departmentRepository.findById(id)
                .map(DepartmentDto::new)
                .orElseThrow(() -> new RuntimeException("Department not found:  " + id));
    }

    @Override
    @Transactional
    public DepartmentDto save(DepartmentDto dto) {
        // Implementation giữ nguyên
        return null;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        department.setVoided(true);
        departmentRepository.save(department);
    }
}
```

### BƯỚC 7: Cập nhật DepartmentController.java

```java
package com.{package}. controller;

import com.{package}.dto.DepartmentDto;
import com. {package}.dto. SearchDto;
import com.{package}. dto.response.PageResponse;
import com.{package}.dto.search.SearchDepartmentDto;
import com.{package}.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework. http.ResponseEntity;
import org.springframework.web. bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * API phân trang MỚI - Hỗ trợ đầy đủ filter và sort động
     * POST /api/departments/search
     */
    @PostMapping("/search")
    public ResponseEntity<PageResponse<DepartmentDto>> searchDepartments(
            @RequestBody SearchDepartmentDto dto) {
        PageResponse<DepartmentDto> response = departmentService.searchDepartments(dto);
        return ResponseEntity. ok(response);
    }

    /**
     * API phân trang CŨ - BACKWARD COMPATIBLE
     * POST /api/departments/paging
     * Giữ lại để không break frontend cũ
     */
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<DepartmentDto>> pagingDepartments(
            @RequestBody SearchDto dto) {
        PageResponse<DepartmentDto> response = departmentService. pagingDepartments(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * API GET với query params - cho filter đơn giản
     * GET /api/departments?pageIndex=0&pageSize=10&keyword=abc&sortBy=name&sortDirection=ASC
     */
    @GetMapping
    public ResponseEntity<PageResponse<DepartmentDto>> getDepartments(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID parentId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        SearchDepartmentDto dto = new SearchDepartmentDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setParentId(parentId);
        dto.setOrganizationId(organizationId);
        dto.setCode(code);
        dto.setName(name);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        return ResponseEntity.ok(departmentService.searchDepartments(dto));
    }

    /**
     * API Export Excel
     */
    @PostMapping("/export")
    public ResponseEntity<List<DepartmentDto>> exportDepartments(
            @RequestBody SearchDepartmentDto dto) {
        List<DepartmentDto> result = departmentService. exportToExcel(dto);
        return ResponseEntity.ok(result);
    }

    // ===== CÁC API CRUD KHÁC GIỮ NGUYÊN =====

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(departmentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DepartmentDto> create(@RequestBody DepartmentDto dto) {
        return ResponseEntity.ok(departmentService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> update(
            @PathVariable UUID id,
            @RequestBody DepartmentDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(departmentService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## ⚛️ FRONTEND REACTJS - CHI TIẾT IMPLEMENTATION

### CẤU TRÚC THƯ MỤC FRONTEND

```
src/
├── types/
│   ├── common.ts                    # Types chung
│   ├── department.ts                # Types cho Department
│   └── pagination.ts                # Types cho pagination
├── services/
│   ├── api.ts                       # Axios instance
│   └── departmentService.ts         # API service cho Department
├── hooks/
│   ├── useDebounce.ts              # Hook debounce
│   ├── useDepartments.ts           # Hook quản lý departments
│   └── useTableSort.ts             # Hook quản lý sort
├── components/
│   ├── common/
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx       # Component bảng chính
│   │   │   ├── TableHeader.tsx     # Header với sort
│   │   │   ├── TableFilter.tsx     # Filter row
│   │   │   ├── Pagination.tsx      # Pagination component
│   │   │   └── index.ts
│   │   └── SearchBox/
│   │       └── SearchBox.tsx       # Ô tìm kiếm
│   └── department/
│       └── DepartmentFilter.tsx    # Filter đặc thù cho Department
└── pages/
    └── department/
        └── DepartmentListPage.tsx  # Trang danh sách Department
```

### BƯỚC 1: Tạo Types

```typescript
// src/types/common. ts

// Search DTO cơ bản (tương ứng SearchDto backend)
export interface SearchDto {
  id?: string;
  ownerId?: string;
  pageIndex:  number;
  pageSize: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  voided?: boolean;
  orderBy?: boolean;  // true = ASC, false = DESC
  roleId?: string;
  parentId?: string;
  exportExcel?: boolean;
}

// Sort direction
export type SortDirection = 'ASC' | 'DESC';

// Base search với sort mở rộng
export interface BaseSearchDto extends SearchDto {
  sortBy?: string;
  sortDirection?:  SortDirection;
}
```

```typescript
// src/types/pagination.ts

// Response từ API
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize:  number;
  totalElements: number;
  totalPages: number;
  first:  boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Column definition cho table
export interface ColumnDef<T> {
  key: string;                              // Field key (có thể nested:  "department.name")
  header: string;                           // Tiêu đề hiển thị
  sortable?:  boolean;                       // Có thể sort không
  sortKey?: string;                         // Key gửi lên API khi sort (nếu khác key)
  filterable?: boolean;                     // Có thể filter không
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterKey?: string;                       // Key gửi lên API khi filter
  filterOptions?: { value: string; label: string }[];
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}
```

```typescript
// src/types/department.ts

import { BaseSearchDto } from './common';

// Department entity
export interface Department {
  id:  string;
  code: string;
  name: string;
  description?:  string;
  level?:  number;
  displayOrder?: number;
  voided:  boolean;
  isActive?:  boolean;
  createdAt: string;
  modifiedAt?:  string;
  parent?: {
    id: string;
    name:  string;
    code: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    displayName: string;
  };
}

// Search DTO cho Department
export interface SearchDepartmentDto extends BaseSearchDto {
  organizationId?: string;
  code?: string;
  name?: string;
  isActive?: boolean;
  level?: number;
  managerId?: string;
}

// Default values
export const defaultSearchDepartmentDto: SearchDepartmentDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};
```

### BƯỚC 2: Tạo API Service

```typescript
// src/services/api.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL:  API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - thêm token
api.interceptors. request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers. Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error. response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// src/services/departmentService.ts

import api from './api';
import { Department, SearchDepartmentDto } from '../types/department';
import { PageResponse } from '../types/pagination';
import { SearchDto } from '../types/common';

const ENDPOINT = '/departments';

export const departmentService = {
  /**
   * API MỚI - Tìm kiếm với đầy đủ filter và sort
   */
  async search(params: SearchDepartmentDto): Promise<PageResponse<Department>> {
    const response = await api.post<PageResponse<Department>>(
      `${ENDPOINT}/search`,
      params
    );
    return response.data;
  },

  /**
   * API CŨ - Backward compatible với SearchDto
   */
  async paging(params: SearchDto): Promise<PageResponse<Department>> {
    const response = await api.post<PageResponse<Department>>(
      `${ENDPOINT}/paging`,
      params
    );
    return response.data;
  },

  /**
   * Lấy chi tiết
   */
  async getById(id:  string): Promise<Department> {
    const response = await api. get<Department>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Tạo mới
   */
  async create(data: Partial<Department>): Promise<Department> {
    const response = await api.post<Department>(ENDPOINT, data);
    return response. data;
  },

  /**
   * Cập nhật
   */
  async update(id: string, data:  Partial<Department>): Promise<Department> {
    const response = await api.put<Department>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Xóa (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Export Excel
   */
  async export(params: SearchDepartmentDto): Promise<Department[]> {
    const response = await api.post<Department[]>(`${ENDPOINT}/export`, params);
    return response.data;
  },
};
```

### BƯỚC 3: Tạo Custom Hooks

```typescript
// src/hooks/useDebounce. ts

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay:  number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// src/hooks/useDepartments. ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Department,
  SearchDepartmentDto,
  defaultSearchDepartmentDto,
} from '../types/department';
import { PageResponse } from '../types/pagination';
import { SortDirection } from '../types/common';
import { departmentService } from '../services/departmentService';
import { useDebounce } from './useDebounce';

interface UseDepartmentsReturn {
  // Data
  data: PageResponse<Department> | null;
  loading: boolean;
  error: string | null;

  // Search params
  searchParams:  SearchDepartmentDto;

  // Actions
  handlePageChange: (pageIndex: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSort: (sortBy: string) => void;
  handleFilter: (filters: Partial<SearchDepartmentDto>) => void;
  handleSearch: (keyword: string) => void;
  handleReset: () => void;
  refresh: () => void;
}

export function useDepartments(
  initialParams?:  Partial<SearchDepartmentDto>
): UseDepartmentsReturn {
  // State
  const [data, setData] = useState<PageResponse<Department> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchDepartmentDto>({
    ...defaultSearchDepartmentDto,
    ...initialParams,
  });

  // Debounce keyword để tránh gọi API liên tục
  const debouncedKeyword = useDebounce(searchParams. keyword, 500);

  // Params thực sự gửi lên API
  const apiParams = useMemo(
    () => ({
      ...searchParams,
      keyword:  debouncedKeyword,
    }),
    [searchParams, debouncedKeyword]
  );

  // Fetch data
  const fetchData = useCallback(async (params: SearchDepartmentDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await departmentService.search(params);
      setData(response);
    } catch (err:  any) {
      const message = err.response?. data?.message || err.message || 'Có lỗi xảy ra';
      setError(message);
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect:  fetch khi params thay đổi
  useEffect(() => {
    fetchData(apiParams);
  }, [apiParams, fetchData]);

  // === HANDLERS ===

  // Thay đổi trang
  const handlePageChange = useCallback((pageIndex: number) => {
    setSearchParams((prev) => ({ ...prev, pageIndex }));
  }, []);

  // Thay đổi số lượng mỗi trang
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageSize,
      pageIndex: 0, // Reset về trang đầu
    }));
  }, []);

  // CLICK VÀO HEADER ĐỂ SORT
  const handleSort = useCallback((sortBy:  string) => {
    setSearchParams((prev) => {
      // Toggle direction nếu click cùng cột
      const newDirection:  SortDirection =
        prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC';

      return {
        ...prev,
        sortBy,
        sortDirection: newDirection,
        pageIndex: 0, // Reset về trang đầu
      };
    });
  }, []);

  // LỌC THEO CỘT
  const handleFilter = useCallback((filters: Partial<SearchDepartmentDto>) => {
    setSearchParams((prev) => ({
      ...prev,
      ...filters,
      pageIndex: 0, // Reset về trang đầu
    }));
  }, []);

  // TÌM KIẾM KEYWORD
  const handleSearch = useCallback((keyword: string) => {
    setSearchParams((prev) => ({
      ...prev,
      keyword:  keyword || undefined,
      pageIndex: 0,
    }));
  }, []);

  // RESET TẤT CẢ FILTER
  const handleReset = useCallback(() => {
    setSearchParams(defaultSearchDepartmentDto);
  }, []);

  // REFRESH DATA
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

### BƯỚC 4: Tạo DataTable Component

```tsx
// src/components/common/DataTable/DataTable.tsx

import React, { useCallback } from 'react';
import { ColumnDef, PageResponse } from '../../../types/pagination';
import { SortDirection } from '../../../types/common';
import { TableHeader } from './TableHeader';
import { TableFilter } from './TableFilter';
import { Pagination } from './Pagination';
import './DataTable.css';

interface DataTableProps<T> {
  data: PageResponse<T> | null;
  columns: ColumnDef<T>[];
  loading: boolean;
  sortBy: string;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?:  (row: T) => void;
  rowKey?: keyof T | ((row: T) => string);
}

export function DataTable<T>({
  data,
  columns,
  loading,
  sortBy,
  sortDirection,
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  rowKey = 'id' as keyof T,
}: DataTableProps<T>) {
  // Lấy key cho row
  const getRowKey = useCallback(
    (row:  T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return String((row as any)[rowKey] || index);
    },
    [rowKey]
  );

  // Lấy giá trị từ nested object (e.g., "parent.name")
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="table-wrapper">
        <table className="data-table">
          {/* HEADER - CLICK ĐỂ SORT */}
          <thead>
            <TableHeader
              columns={columns}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            {/* FILTER ROW - LỌC THEO CỘT */}
            <TableFilter columns={columns} onFilter={onFilter} />
          </thead>

          {/* BODY */}
          <tbody>
            {loading ?  (
              <tr>
                <td colSpan={columns.length} className="loading-cell">
                  <div className="spinner"></div>
                </td>
              </tr>
            ) : ! data?. content?.length ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.content.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'clickable' : ''}
                >
                  {columns.map((column) => {
                    const value = getNestedValue(row, column. key);
                    return (
                      <td key={column.key} style={{ width: column.width }}>
                        {column.render ? column.render(value, row) : value ?? '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {data && (
        <Pagination
          pageNumber={data.pageNumber}
          pageSize={data.pageSize}
          totalElements={data.totalElements}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrevious={data.hasPrevious}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
```

```tsx
// src/components/common/DataTable/TableHeader. tsx

import React from 'react';
import { ColumnDef } from '../../../types/pagination';
import { SortDirection } from '../../../types/common';

interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sortBy:  string;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
}

export function TableHeader<T>({
  columns,
  sortBy,
  sortDirection,
  onSort,
}: TableHeaderProps<T>) {
  const getSortIcon = (column: ColumnDef<T>) => {
    if (! column.sortable) return null;

    const sortKey = column.sortKey || column.key;
    const isActive = sortBy === sortKey;

    return (
      <span className={`sort-icon ${isActive ? 'active' : ''}`}>
        {isActive ? (sortDirection === 'ASC' ? '↑' : '↓') : '↕'}
      </span>
    );
  };

  const handleClick = (column: ColumnDef<T>) => {
    if (!column.sortable) return;
    const sortKey = column. sortKey || column. key;
    onSort(sortKey);
  };

  return (
    <tr>
      {columns. map((column) => (
        <th
          key={column.key}
          style={{ width: column.width }}
          className={column.sortable ? 'sortable' :  ''}
          onClick={() => handleClick(column)}
        >
          <div className="th-content">
            <span>{column.header}</span>
            {getSortIcon(column)}
          </div>
        </th>
      ))}
    </tr>
  );
}
```

```tsx
// src/components/common/DataTable/TableFilter.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { ColumnDef } from '../../../types/pagination';
import { useDebounce } from '../../../hooks/useDebounce';

interface TableFilterProps<T> {
  columns: ColumnDef<T>[];
  onFilter:  (filters: Record<string, any>) => void;
}

export function TableFilter<T>({ columns, onFilter }: TableFilterProps<T>) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Debounce filters
  const debouncedFilters = useDebounce(filters, 500);

  // Gọi onFilter khi debounced filters thay đổi
  useEffect(() => {
    onFilter(debouncedFilters);
  }, [debouncedFilters, onFilter]);

  // Handle filter change
  const handleChange = useCallback((key: string, value:  any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  }, []);

  // Render filter input
  const renderFilter = (column: ColumnDef<T>) => {
    if (!column.filterable) return null;

    const filterKey = column.filterKey || column.key;
    const value = filters[filterKey] ?? '';

    switch (column.filterType) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(filterKey, e. target.value)}
            className="column-filter-select"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Tất cả</option>
            {column. filterOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => {
              const val = e.target. value;
              handleChange(filterKey, val === '' ? undefined : val === 'true');
            }}
            className="column-filter-select"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(filterKey, e.target.value)}
            className="column-filter-input"
            onClick={(e) => e.stopPropagation()}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(filterKey, e.target.value)}
            placeholder={`Lọc... `}
            className="column-filter-input"
            onClick={(e) => e.stopPropagation()}
          />
        );
    }
  };

  // Check if any column is filterable
  const hasFilterableColumns = columns.some((c) => c.filterable);
  if (!hasFilterableColumns) return null;

  return (
    <tr className="filter-row">
      {columns. map((column) => (
        <th key={`filter-${column. key}`}>{renderFilter(column)}</th>
      ))}
    </tr>
  );
}
```

```tsx
// src/components/common/DataTable/Pagination. tsx

import React from 'react';

interface PaginationProps {
  pageNumber:  number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange:  (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  pageNumber,
  pageSize,
  totalElements,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
}:  PaginationProps) {
  const from = pageNumber * pageSize + 1;
  const to = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="table-pagination">
      <div className="pagination-info">
        Hiển thị {totalElements > 0 ?  from :  0} - {to} / {totalElements} kết quả
      </div>

      <div className="pagination-controls">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="page-size-select"
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
          <option value={100}>100 / trang</option>
        </select>

        <div className="pagination-buttons">
          <button
            disabled={pageNumber === 0}
            onClick={() => onPageChange(0)}
            className="pagination-btn"
            title="Trang đầu"
          >
            ⟪
          </button>
          <button
            disabled={! hasPrevious}
            onClick={() => onPageChange(pageNumber - 1)}
            className="pagination-btn"
            title="Trang trước"
          >
            ⟨
          </button>

          <span className="page-info">
            Trang {pageNumber + 1} / {totalPages || 1}
          </span>

          <button
            disabled={!hasNext}
            onClick={() => onPageChange(pageNumber + 1)}
            className="pagination-btn"
            title="Trang sau"
          >
            ⟩
          </button>
          <button
            disabled={pageNumber >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            className="pagination-btn"
            title="Trang cuối"
          >
            ⟫
          </button>
        </div>
      </div>
    </div>
  );
}
```

### BƯỚC 5: Tạo DepartmentListPage

```tsx
// src/pages/department/DepartmentListPage.tsx

import React, { useMemo, useCallback, useState } from 'react';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { useDepartments } from '../../hooks/useDepartments';
import { Department, SearchDepartmentDto } from '../../types/department';
import { ColumnDef } from '../../types/pagination';
import './DepartmentListPage.css';

// Định nghĩa columns cho bảng Department
const columns: ColumnDef<Department>[] = [
  {
    key: 'code',
    header:  'Mã phòng ban',
    sortable: true,
    sortKey: 'code',        // Key gửi lên API
    filterable: true,
    filterType: 'text',
    filterKey: 'code',      // Key gửi lên API
    width: '120px',
  },
  {
    key: 'name',
    header:  'Tên phòng ban',
    sortable:  true,
    sortKey: 'name',
    filterable: true,
    filterType: 'text',
    filterKey: 'name',
    width:  '200px',
  },
  {
    key: 'parent. name',
    header: 'Phòng ban cha',
    sortable: false,
    filterable: false,
    width: '180px',
    render: (value) => value || <span className="text-muted">-</span>,
  },
  {
    key: 'level',
    header:  'Cấp độ',
    sortable: true,
    sortKey: 'level',
    filterable:  false,
    width:  '80px',
  },
  {
    key: 'isActive',
    header: 'Trạng thái',
    sortable:  false,
    filterable: true,
    filterType: 'boolean',
    filterKey: 'isActive',
    width: '100px',
    render: (value) => (
      <span className={`badge ${value ? 'badge-success' :  'badge-secondary'}`}>
        {value ? 'Hoạt động' : 'Ngưng'}
      </span>
    ),
  },
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
];

export function DepartmentListPage() {
  // State cho keyword search
  const [keyword, setKeyword] = useState('');

  // Custom hook quản lý departments
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
  } = useDepartments();

  // Handle keyword input change
  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  // Handle column filter (từ DataTable)
  const handleColumnFilter = useCallback(
    (filters: Record<string, any>) => {
      // Map trực tiếp sang SearchDepartmentDto vì filterKey đã đúng
      handleFilter(filters as Partial<SearchDepartmentDto>);
    },
    [handleFilter]
  );

  // Handle row click
  const handleRowClick = useCallback((department: Department) => {
    console.log('Selected:', department);
    // Navigate to detail page hoặc open modal
    // navigate(`/departments/${department.id}`);
  }, []);

  // Handle reset
  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  return (
    <div className="department-list-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Quản lý Phòng ban</h1>
        <button className="btn btn-primary" onClick={() => {}}>
          + Thêm phòng ban
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={refresh}>Thử lại</button>
        </div>
      )}

      {/* SEARCH & FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã phòng ban..."
            value={keyword}
            onChange={handleKeywordChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

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
      <DataTable<Department>
        data={data}
        columns={columns}
        loading={loading}
        sortBy={searchParams.sortBy || 'createdAt'}
        sortDirection={searchParams.sortDirection || 'DESC'}
        onSort={handleSort}
        onFilter={handleColumnFilter}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRowClick={handleRowClick}
        rowKey="id"
      />
    </div>
  );
}
```

---

## 🔄 QUY TRÌNH THỰC HIỆN

### BACKEND (Thực hiện theo thứ tự):

1. [ ] **Tạo `BaseSpecification. java`** trong `specification/`
2. [ ] **Tạo `PageResponse.java`** trong `dto/response/`
3. [ ] **Tạo `SearchDepartmentDto.java`** trong `dto/search/` (extends SearchDto)
4. [ ] **Tạo `DepartmentSpecification.java`** trong