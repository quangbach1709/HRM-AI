package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryPeriodDto;
import com.hrm.backend.entity.SalaryPeriod;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class SalaryPeriodSpecification extends BaseSpecification<SalaryPeriod> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "code", "name", "startDate", "endDate", "salaryPeriodStatus");

    public Specification<SalaryPeriod> getSpecification(SearchSalaryPeriodDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // ===== 1. VOIDED =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                keywordPredicates.add(likePredicate(cb, root.get("code"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("name"), keyword));

                if (!keywordPredicates.isEmpty()) {
                    predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            // ===== 3. FILTER BY DETAILS =====
            if (StringUtils.hasText(dto.getCode())) {
                predicates.add(likePredicate(cb, root.get("code"), dto.getCode()));
            }
            if (StringUtils.hasText(dto.getName())) {
                predicates.add(likePredicate(cb, root.get("name"), dto.getName()));
            }
            if (dto.getSalaryPeriodStatus() != null) {
                predicates.add(cb.equal(root.get("salaryPeriodStatus"), dto.getSalaryPeriodStatus()));
            }

            // ===== 4. DATE RANGE =====
            // Created At range
            Predicate createdAtPredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (createdAtPredicate != null) {
                predicates.add(createdAtPredicate);
            }

            // Start Date range
            Predicate startDatePredicate = dateRangePredicate(
                    cb, root.get("startDate"), dto.getStartDateFrom(), dto.getStartDateTo());
            if (startDatePredicate != null) {
                predicates.add(startDatePredicate);
            }

            // End Date range
            Predicate endDatePredicate = dateRangePredicate(
                    cb, root.get("endDate"), dto.getEndDateFrom(), dto.getEndDateTo());
            if (endDatePredicate != null) {
                predicates.add(endDatePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchSalaryPeriodDto dto) {
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

    public Pageable getPageable(SearchSalaryPeriodDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
