package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryResultItemDto;
import com.hrm.backend.entity.SalaryResultItem;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class SalaryResultItemSpecification extends BaseSpecification<SalaryResultItem> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt");

    public Specification<SalaryResultItem> getSpecification(SearchSalaryResultItemDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Filter by SalaryResult
            if (dto.getSalaryResultId() != null) {
                predicates.add(cb.equal(root.get("salaryResult").get("id"), dto.getSalaryResultId()));
            }

            // Filter by Staff ID
            if (dto.getStaffId() != null) {
                predicates.add(cb.equal(root.get("staff").get("id"), dto.getStaffId()));
            }

            // Filter by Staff Code
            if (StringUtils.hasText(dto.getStaffCode())) {
                predicates.add(likePredicate(cb, root.get("staff").get("staffCode"), dto.getStaffCode()));
            }

            // Filter by Staff Name / Keyword
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(likePredicate(cb, root.get("staff").get("staffCode"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("staff").get("displayName"), keyword));
                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // Filter by Staff Name explicitly
            if (StringUtils.hasText(dto.getStaffName())) {
                predicates.add(likePredicate(cb, root.get("staff").get("displayName"), dto.getStaffName()));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchSalaryResultItemDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort.Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    public Pageable getPageable(SearchSalaryResultItemDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
