package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryTemplateDto;
import com.hrm.backend.entity.SalaryTemplate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class SalaryTemplateSpecification extends BaseSpecification<SalaryTemplate> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "code", "name", "description");

    /**
     * Tạo Specification từ SearchDto
     */
    public Specification<SalaryTemplate> getSpecification(SearchSalaryTemplateDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tránh duplicate khi có JOIN
            query.distinct(true);

            // ===== 1. VOIDED =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                keywordPredicates.add(likePredicate(cb, root.get("code"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("name"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("description"), keyword));

                if (!keywordPredicates.isEmpty()) {
                    predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            // ===== 3. FILTER BY ID =====
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 4. DATE RANGE =====
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // ===== 5. CÁC FILTER KHÁC =====
            if (StringUtils.hasText(dto.getCode())) {
                predicates.add(likePredicate(cb, root.get("code"), dto.getCode()));
            }
            if (StringUtils.hasText(dto.getName())) {
                predicates.add(likePredicate(cb, root.get("name"), dto.getName()));
            }
            if (StringUtils.hasText(dto.getDescription())) {
                predicates.add(likePredicate(cb, root.get("description"), dto.getDescription()));
            }

            return andPredicates(cb, predicates);
        };
    }

    /**
     * Tạo Sort
     */
    public Sort getSort(SearchSalaryTemplateDto dto) {
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
    public Pageable getPageable(SearchSalaryTemplateDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
