# PROMPT:  Áp Dụng JPA Specification Pattern Cho Entity Mới

## 📋 CONTEXT

Dự án đã có sẵn các thành phần sau (lấy từ màn hình Department làm mẫu):

### Backend đã có:
- `BaseSpecification. java` - Class base với các helper methods
- `PageResponse.java` - Response wrapper cho pagination
- `SearchDto.java` - Base DTO cho search (class gốc từ frontend)

### Frontend đã có:
- `DataTable` component với sort và filter
- `useDepartments` hook làm mẫu
- `departmentService` làm mẫu
- Types chuẩn cho pagination

---

## 🎯 YÊU CẦU

Áp dụng Specification Pattern cho entity **`{TÊN_ENTITY}`** theo đúng cấu trúc đã làm với Department.

---

## 📁 BACKEND - CÁC FILE CẦN TẠO/SỬA

### 1. TẠO:  `Search{EntityName}Dto.java`

```java
package com.{package}.dto.search;

import com.{package}.dto.SearchDto;
import lombok.*;
import java.util.UUID;

/**
 * DTO tìm kiếm cho {EntityName}
 * Extends SearchDto để kế thừa các field cơ bản: 
 * - pageIndex, pageSize, keyword, fromDate, toDate
 * - voided, orderBy, parentId, exportExcel
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Search{EntityName}Dto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER ĐẶC THÙ CHO {EntityName} =====
    // TODO: Thêm các field filter dựa trên các cột của entity
    // Ví dụ: 
    // private UUID departmentId;
    // private String status;
    // private Boolean isActive;
    // private String code;
    // private String name;

    /**
     * Tạo từ SearchDto cơ bản (backward compatible)
     */
    public static Search{EntityName}Dto fromSearchDto(SearchDto dto) {
        Search{EntityName}Dto result = new Search{EntityName}Dto();
        if (dto != null) {
            result. setId(dto.getId());
            result.setOwnerId(dto.getOwnerId());
            result.setPageIndex(dto.getPageIndex());
            result.setPageSize(dto.getPageSize());
            result.setKeyword(dto.getKeyword());
            result. setFromDate(dto.getFromDate());
            result.setToDate(dto. getToDate());
            result.setVoided(dto. getVoided());
            result.setOrderBy(dto. getOrderBy());
            result.setParentId(dto. getParentId());
            result.setExportExcel(dto.getExportExcel());

            // Map orderBy sang sortDirection
            if (dto.getOrderBy() != null) {
                result.setSortDirection(dto. getOrderBy() ?  "ASC" :  "DESC");
            }
        }
        return result;
    }
}
```

### 2. TẠO: `{EntityName}Specification.java`

```java
package com. {package}.specification;

import com.{package}.dto.search.Search{EntityName}Dto;
import com. {package}.entity. {EntityName};
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework. stereotype.Component;
import org.springframework.util. StringUtils;

import javax.persistence. criteria.*;
import java.util.*;

@Component
public class {EntityName}Specification extends BaseSpecification<{EntityName}> {

    // Whitelist các field được phép sort
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "code", "name", "createdAt", "modifiedAt"
            // TODO: Thêm các field khác của entity
    );

    /**
     * Tạo Specification từ DTO
     */
    public Specification<{EntityName}> getSpecification(Search{EntityName}Dto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tránh duplicate khi JOIN
            query.distinct(true);

            // ===== 1. VOIDED =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                predicates. add(cb.or(
                        likePredicate(cb, root.get("name"), keyword),
                        likePredicate(cb, root.get("code"), keyword)
                        // TODO: Thêm các field khác cần search
                ));
            }

            // ===== 3. FILTER THEO ID =====
            if (dto.getId() != null) {
                predicates. add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 4. FILTER THEO PARENT =====
            if (dto.getParentId() != null) {
                predicates.add(cb. equal(root.get("parent").get("id"), dto.getParentId()));
            }

            // ===== 5. DATE RANGE =====
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate()
            );
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // TODO:  THÊM CÁC ĐIỀU KIỆN FILTER KHÁC
            // Ví dụ: 
            // if (dto.getDepartmentId() != null) {
            //     predicates. add(cb.equal(root.get("department").get("id"), dto.getDepartmentId()));
            // }
            // if (dto.getStatus() != null) {
            //     predicates. add(cb.equal(root.get("status"), dto.getStatus()));
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
            direction = dto.getOrderBy() ? Sort.Direction. ASC : Sort. Direction.DESC;
        } else {
            direction = Sort. Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    /**
     * Tạo Pageable
     */
    public Pageable getPageable(Search{EntityName}Dto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto. getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
```

### 3. SỬA: `{EntityName}Repository.java`

```java
@Repository
public interface {EntityName}Repository extends
        JpaRepository<{EntityName}, UUID>,
        JpaSpecificationExecutor<{EntityName}> {  // <-- THÊM DÒNG NÀY

    // Giữ lại các method đơn giản
    // XÓA các method @Query phức tạp dùng cho paging
}
```

### 4. SỬA: `{EntityName}ServiceImpl.java`

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class {EntityName}ServiceImpl implements {EntityName}Service {

    private final {EntityName}Repository repository;
    private final {EntityName}Specification specification;  // <-- THÊM

    /**
     * Phân trang MỚI với Specification
     */
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

    /**
     * Backward compatible với SearchDto cũ
     */
    @Override
    public PageResponse<{EntityName}Dto> paging(SearchDto dto) {
        Search{EntityName}Dto searchDto = Search{EntityName}Dto.fromSearchDto(dto);
        return search(searchDto);
    }

    /**
     * Export Excel
     */
    @Override
    public List<{EntityName}Dto> exportToExcel(Search{EntityName}Dto dto) {
        if (dto == null) dto = new Search{EntityName}Dto();

        Specification<{EntityName}> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map({EntityName}Dto::new)
                .collect(Collectors.toList());
    }

    // ...  các method CRUD khác giữ nguyên
}
```

### 5. SỬA: `{EntityName}Controller.java`

```java
@RestController
@RequestMapping("/api/{entities}")
@RequiredArgsConstructor
public class {EntityName}Controller {

    private final {EntityName}Service service;

    /**
     * API MỚI - full filter & sort
     */
    @PostMapping("/search")
    public ResponseEntity<PageResponse<{EntityName}Dto>> search(
            @RequestBody Search{EntityName}Dto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    /**
     * API CŨ - backward compatible
     */
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<{EntityName}Dto>> paging(
            @RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    /**
     * GET với query params
     */
    @GetMapping
    public ResponseEntity<PageResponse<{EntityName}Dto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
            // TODO: Thêm các @RequestParam filter khác
    ) {
        Search{EntityName}Dto dto = new Search{EntityName}Dto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        return ResponseEntity. ok(service.search(dto));
    }

    // ... các API CRUD khác giữ nguyên
}
```

---

## ⚛️ FRONTEND - CÁC FILE CẦN TẠO/SỬA

### 1. TẠO: `types/{entityName}.ts`

```typescript
import { BaseSearchDto } from './common';

// Entity type
export interface {EntityName} {
  id: string;
  code: string;
  name: string;
  // TODO: Thêm các field khác của entity
  voided: boolean;
  createdAt:  string;
  modifiedAt?:  string;
}

// Search DTO
export interface Search{EntityName}Dto extends BaseSearchDto {
  // TODO: Thêm các field filter đặc thù
  // Ví dụ:
  // departmentId?: string;
  // status?:  string;
  // isActive?: boolean;
}

// Default values
export const defaultSearch{EntityName}Dto: Search{EntityName}Dto = {
  pageIndex:  0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};
```

### 2. TẠO: `services/{entityName}Service.ts`

```typescript
import api from './api';
import { {EntityName}, Search{EntityName}Dto } from '../types/{entityName}';
import { PageResponse } from '../types/pagination';

const ENDPOINT = '/{entities}';  // TODO: Thay bằng endpoint thực

export const {entityName}Service = {
  async search(params: Search{EntityName}Dto): Promise<PageResponse<{EntityName}>> {
    const response = await api.post<PageResponse<{EntityName}>>(
      `${ENDPOINT}/search`,
      params
    );
    return response.data;
  },

  async getById(id: string): Promise<{EntityName}> {
    const response = await api.get<{EntityName}>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(data: Partial<{EntityName}>): Promise<{EntityName}> {
    const response = await api.post<{EntityName}>(ENDPOINT, data);
    return response.data;
  },

  async update(id: string, data: Partial<{EntityName}>): Promise<{EntityName}> {
    const response = await api.put<{EntityName}>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id:  string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  async export(params: Search{EntityName}Dto): Promise<{EntityName}[]> {
    const response = await api. post<{EntityName}[]>(`${ENDPOINT}/export`, params);
    return response.data;
  },
};
```

### 3. TẠO: `hooks/use{EntityName}s.ts`

```typescript
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  {EntityName},
  Search{EntityName}Dto,
  defaultSearch{EntityName}Dto,
} from '../types/{entityName}';
import { PageResponse } from '../types/pagination';
import { SortDirection } from '../types/common';
import { {entityName}Service } from '../services/{entityName}Service';
import { useDebounce } from './useDebounce';

export function use{EntityName}s(initialParams?:  Partial<Search{EntityName}Dto>) {
  const [data, setData] = useState<PageResponse<{EntityName}> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<Search{EntityName}Dto>({
    ...defaultSearch{EntityName}Dto,
    ...initialParams,
  });

  const debouncedKeyword = useDebounce(searchParams.keyword, 500);

  const apiParams = useMemo(
    () => ({ ...searchParams, keyword: debouncedKeyword }),
    [searchParams, debouncedKeyword]
  );

  const fetchData = useCallback(async (params: Search{EntityName}Dto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await {entityName}Service. search(params);
      setData(response);
    } catch (err:  any) {
      setError(err. response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(apiParams);
  }, [apiParams, fetchData]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setSearchParams((prev) => ({ ...prev, pageIndex }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, pageIndex: 0 }));
  }, []);

  const handleSort = useCallback((sortBy: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy,
      sortDirection:  prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      pageIndex: 0,
    }));
  }, []);

  const handleFilter = useCallback((filters: Partial<Search{EntityName}Dto>) => {
    setSearchParams((prev) => ({ ...prev, ...filters, pageIndex: 0 }));
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setSearchParams((prev) => ({ ...prev, keyword: keyword || undefined, pageIndex: 0 }));
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

### 4. TẠO: `pages/{entityName}/{EntityName}ListPage.tsx`

```tsx
import React, { useState, useCallback } from 'react';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { use{EntityName}s } from '../../hooks/use{EntityName}s';
import { {EntityName}, Search{EntityName}Dto } from '../../types/{entityName}';
import { ColumnDef } from '../../types/pagination';

// TODO: Định nghĩa columns cho bảng
const columns: ColumnDef<{EntityName}>[] = [
  {
    key: 'code',
    header:  'Mã',
    sortable: true,
    sortKey: 'code',
    filterable: true,
    filterType: 'text',
    filterKey: 'code',
    width: '120px',
  },
  {
    key: 'name',
    header:  'Tên',
    sortable: true,
    sortKey: 'name',
    filterable: true,
    filterType: 'text',
    filterKey: 'name',
    width: '200px',
  },
  // TODO: Thêm các cột khác
  {
    key:  'createdAt',
    header:  'Ngày tạo',
    sortable: true,
    sortKey:  'createdAt',
    width: '120px',
    render: (value) => value ?  new Date(value).toLocaleDateString('vi-VN') : '-',
  },
];

export function {EntityName}ListPage() {
  const [keyword, setKeyword] = useState('');

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

  const handleKeywordChange = useCallback(
    (e:  React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e. target.value);
      handleSearch(e. target.value);
    },
    [handleSearch]
  );

  const handleColumnFilter = useCallback(
    (filters: Record<string, any>) => {
      handleFilter(filters as Partial<Search{EntityName}Dto>);
    },
    [handleFilter]
  );

  const handleRowClick = useCallback((item: {EntityName}) => {
    console.log('Selected:', item);
  }, []);

  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  return (
    <div className="{entityName}-list-page">
      <div className="page-header">
        <h1>Quản lý {EntityName}</h1>
        <button className="btn btn-primary">+ Thêm mới</button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={refresh}>Thử lại</button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={handleKeywordChange}
            className="search-input"
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn-outline" onClick={handleResetClick}>Đặt lại</button>
          <button className="btn btn-outline" onClick={refresh}>↻ Làm mới</button>
        </div>
      </div>

      <DataTable<{EntityName}>
        data={data}
        columns={columns}
        loading={loading}
        sortBy={searchParams. sortBy || 'createdAt'}
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

## ✅ CHECKLIST THỰC HIỆN

### Backend:
- [ ] Tạo `Search{EntityName}Dto. java` extends SearchDto
- [ ] Tạo `{EntityName}Specification.java` extends BaseSpecification
- [ ] Thêm `JpaSpecificationExecutor` vào Repository
- [ ] Cập nhật Service với method `search()` và `paging()`
- [ ] Cập nhật Controller với endpoints `/search` và `/paging`
- [ ] Test API với Postman/Swagger

### Frontend:
- [ ] Tạo types trong `types/{entityName}.ts`
- [ ] Tạo service trong `services/{entityName}Service.ts`
- [ ] Tạo hook trong `hooks/use{EntityName}s. ts`
- [ ] Tạo page trong `pages/{entityName}/{EntityName}ListPage.tsx`
- [ ] Định nghĩa columns với sortable và filterable
- [ ] Test UI:  sort, filter, pagination

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Thay thế placeholder**: Thay `{EntityName}`, `{entityName}`, `{entities}`, `{package}` bằng tên thực
2. **Thêm filter fields**: Dựa vào các cột cần lọc của entity
3. **Thêm columns**: Dựa vào các field cần hiển thị
4. **Backward compatible**: Giữ endpoint `/paging` cũ để không break code hiện tại
5. **Test kỹ**:  Sort, filter, pagination, keyword search

---

## 🚀 VÍ DỤ ÁP DỤNG CHO ENTITY "Staff"

Thay thế trong prompt:
- `{EntityName}` → `Staff`
- `{entityName}` → `staff`
- `{entities}` → `staffs`
- `{package}` → `com.globits.hr`

Thêm filter fields:
```java
// SearchStaffDto.java
private UUID departmentId;
private UUID positionId;
private String email;
private String phone;
private Boolean isActive;
private String gender;
```

Thêm columns:
```typescript
// columns trong StaffListPage.tsx
{ key: 'displayName', header: 'Họ tên', sortable:  true, filterable: true },
{ key: 'email', header: 'Email', sortable: true, filterable: true },
{ key: 'department. name', header: 'Phòng ban', sortable: false },
{ key: 'position.name', header: 'Vị trí', sortable: false },
```