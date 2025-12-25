package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryTemplateItemDto;
import com.hrm.backend.entity.SalaryTemplateItem;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class SalaryTemplateItemSpecification extends BaseSpecification<SalaryTemplateItem> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "code", "name", "displayOrder", "salaryItemType", "defaultAmount");

    public Specification<SalaryTemplateItem> getSpecification(SearchSalaryTemplateItemDto dto) {
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
            if (dto.getSalaryItemType() != null) {
                predicates.add(cb.equal(root.get("salaryItemType"), dto.getSalaryItemType()));
            }

            // Filter by SalaryTemplate
            if (dto.getSalaryTemplateId() != null) {
                predicates.add(cb.equal(root.get("salaryTemplate").get("id"), dto.getSalaryTemplateId()));
            }

            // ===== 4. DATE RANGE =====
            Predicate createdAtPredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (createdAtPredicate != null) {
                predicates.add(createdAtPredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchSalaryTemplateItemDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "displayOrder";

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "displayOrder";
        }

        Sort.Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
        } else if (dto.getOrderBy() != null) {
            direction = dto.getOrderBy() ? Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            // Default sort ASC for displayOrder
            direction = "displayOrder".equals(sortBy) ? Sort.Direction.ASC : Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    public Pageable getPageable(SearchSalaryTemplateItemDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
