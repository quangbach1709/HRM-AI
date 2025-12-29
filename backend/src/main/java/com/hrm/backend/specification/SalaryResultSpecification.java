package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryResultDto;
import com.hrm.backend.entity.SalaryResult;
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
public class SalaryResultSpecification extends BaseSpecification<SalaryResult> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "name");

    public Specification<SalaryResult> getSpecification(SearchSalaryResultDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Keyword (Name)
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                predicates.add(likePredicate(cb, root.get("name"), keyword));
            }

            // Name exact (if needed elsewhere) or specific filter
            if (StringUtils.hasText(dto.getName())) {
                predicates.add(likePredicate(cb, root.get("name"), dto.getName()));
            }

            // Salary Period
            if (dto.getSalaryPeriodId() != null) {
                predicates.add(cb.equal(root.get("salaryPeriod").get("id"), dto.getSalaryPeriodId()));
            }

            // Salary Template
            if (dto.getSalaryTemplateId() != null) {
                predicates.add(cb.equal(root.get("salaryTemplate").get("id"), dto.getSalaryTemplateId()));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchSalaryResultDto dto) {
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

    public Pageable getPageable(SearchSalaryResultDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
