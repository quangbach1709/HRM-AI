package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchSalaryResultItemDetailDto;
import com.hrm.backend.entity.SalaryResultItemDetail;
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
public class SalaryResultItemDetailSpecification extends BaseSpecification<SalaryResultItemDetail> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "value");

    public Specification<SalaryResultItemDetail> getSpecification(SearchSalaryResultItemDetailDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Filter by SalaryResultItem
            if (dto.getSalaryResultItemId() != null) {
                predicates.add(cb.equal(root.get("salaryResultItem").get("id"), dto.getSalaryResultItemId()));
            }

            // Filter by SalaryTemplateItem
            if (dto.getSalaryTemplateItemId() != null) {
                predicates.add(cb.equal(root.get("salaryTemplateItem").get("id"), dto.getSalaryTemplateItemId()));
            }

            // Filter by value range
            if (dto.getMinValue() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("value"), dto.getMinValue()));
            }
            if (dto.getMaxValue() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("value"), dto.getMaxValue()));
            }

            // Keyword search (search by template item name)
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                predicates.add(likePredicate(cb, root.get("salaryTemplateItem").get("name"), keyword));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchSalaryResultItemDetailDto dto) {
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

    public Pageable getPageable(SearchSalaryResultItemDetailDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
