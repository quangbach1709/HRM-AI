package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchDepartmentDto;
import com.hrm.backend.entity.Department;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Specification cho Department entity
 * Xử lý tất cả logic filter và sort động
 */
@Component
public class DepartmentSpecification extends BaseSpecification<Department> {

    // Danh sách các field được phép sort (whitelist để bảo mật)
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "code", "name", "createdAt", "updatedAt", "description");

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
                        likePredicate(cb, root.get("code"), keyword),
                        likePredicate(cb, root.get("description"), keyword));
                predicates.add(keywordPredicate);
            }

            // ===== 3. LỌC THEO CODE (filter riêng theo cột) =====
            if (StringUtils.hasText(dto.getCode())) {
                predicates.add(likePredicate(cb, root.get("code"), dto.getCode()));
            }

            // ===== 4. LỌC THEO NAME (filter riêng theo cột) =====
            if (StringUtils.hasText(dto.getName())) {
                predicates.add(likePredicate(cb, root.get("name"), dto.getName()));
            }

            // ===== 5. LỌC THEO PARENT (phòng ban cha) =====
            if (dto.getParentId() != null) {
                predicates.add(cb.equal(root.get("parent").get("id"), dto.getParentId()));
            }

            // ===== 6. LỌC THEO ID CỤ THỂ =====
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 7. LỌC THEO KHOẢNG THỜI GIAN TẠO =====
            Predicate datePredicate = dateRangePredicate(
                    cb,
                    root.get("createdAt"),
                    dto.getFromDate(),
                    dto.getToDate());
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
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
        } else if (dto.getOrderBy() != null) {
            // Backward compatible với field orderBy cũ
            direction = dto.getOrderBy() ? Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    /**
     * Tạo Pageable từ DTO
     */
    public Pageable getPageable(SearchDepartmentDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

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
