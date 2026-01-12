package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSystemConfigDto;
import com.hrm.backend.entity.SystemConfig;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Specification cho SystemConfig entity
 * Xử lý tất cả logic filter và sort động
 */
@Component
public class SystemConfigSpecification extends BaseSpecification<SystemConfig> {

    // Danh sách các field được phép sort (whitelist để bảo mật)
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "code", "name", "configKey", "configValue", "configType", "createdAt", "updatedAt");

    /**
     * Tạo Specification từ SearchSystemConfigDto
     */
    public Specification<SystemConfig> getSpecification(SearchSystemConfigDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // DISTINCT để tránh duplicate
            query.distinct(true);

            // 1. ĐIỀU KIỆN VOIDED (soft delete)
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // 2. TÌM KIẾM KEYWORD
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                Predicate keywordPredicate = cb.or(
                        likePredicate(cb, root.get("name"), keyword),
                        likePredicate(cb, root.get("code"), keyword),
                        likePredicate(cb, root.get("configKey"), keyword),
                        likePredicate(cb, root.get("configValue"), keyword),
                        likePredicate(cb, root.get("note"), keyword),
                        likePredicate(cb, root.get("description"), keyword));
                predicates.add(keywordPredicate);
            }

            // 3. LỌC THEO CONFIG KEY
            if (StringUtils.hasText(dto.getConfigKey())) {
                predicates.add(likePredicate(cb, root.get("configKey"), dto.getConfigKey()));
            }

            // 4. LỌC THEO CONFIG TYPE
            if (dto.getConfigType() != null) {
                predicates.add(cb.equal(root.get("configType"), dto.getConfigType()));
            }

            // 5. LỌC THEO ID CỤ THỂ
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // 6. LỌC THEO KHOẢNG THỜI GIAN TẠO
            Predicate datePredicate = dateRangePredicate(
                    cb,
                    root.get("createdAt"),
                    dto.getFromDate(),
                    dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    /**
     * Tạo Sort object từ DTO
     */
    public Sort getSort(SearchSystemConfigDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";

        // Validate field được phép sort
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
     * Tạo Pageable từ DTO
     */
    public Pageable getPageable(SearchSystemConfigDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }

    /**
     * Tạo Pageable không giới hạn (cho export Excel)
     */
    public Pageable getUnpagedWithSort(SearchSystemConfigDto dto) {
        return PageRequest.of(0, Integer.MAX_VALUE, getSort(dto));
    }
}
