package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchPositionDto;
import com.hrm.backend.entity.Position;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class PositionSpecification extends BaseSpecification<Position> {

    // Whitelist các field được phép sort
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "code", "name", "createdAt", "updatedAt", "isMain");

    /**
     * Tạo Specification từ DTO
     */
    public Specification<Position> getSpecification(SearchPositionDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tránh duplicate khi JOIN
            query.distinct(true);

            // ===== 1. VOIDED =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                predicates.add(cb.or(
                        likePredicate(cb, root.get("name"), keyword),
                        likePredicate(cb, root.get("code"), keyword)));
            }

            // ===== 3. FILTER THEO ID =====
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 4. FILTER THEO DEPARTMENT =====
            if (dto.getDepartmentId() != null) {
                predicates.add(cb.equal(root.get("department").get("id"), dto.getDepartmentId()));
            }

            // ===== 5. FILTER THEO STAFF =====
            if (dto.getStaffId() != null) {
                predicates.add(cb.equal(root.get("staff").get("id"), dto.getStaffId()));
            }

            // ===== 6. FILTER THEO IS_MAIN =====
            if (dto.getIsMain() != null) {
                predicates.add(cb.equal(root.get("isMain"), dto.getIsMain()));
            }

            // ===== 7. FILTER THEO CODE/NAME RIÊNG =====
            if (StringUtils.hasText(dto.getCode())) {
                predicates.add(likePredicate(cb, root.get("code"), dto.getCode()));
            }
            if (StringUtils.hasText(dto.getName())) {
                predicates.add(likePredicate(cb, root.get("name"), dto.getName()));
            }

            // ===== 8. DATE RANGE =====
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    /**
     * Tạo Sort
     */
    public Sort getSort(SearchPositionDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort.Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
        } else if (dto.getOrderBy() != null) {
            direction = dto.getOrderBy() ? Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    /**
     * Tạo Pageable
     */
    public Pageable getPageable(SearchPositionDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
