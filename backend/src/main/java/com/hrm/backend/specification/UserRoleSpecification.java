package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchUserRoleDto;
import com.hrm.backend.entity.UserRole;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class UserRoleSpecification extends BaseSpecification<UserRole> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt");

    public Specification<UserRole> getSpecification(SearchUserRoleDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Filter by User ID
            if (dto.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), dto.getUserId()));
            }

            // Filter by Role ID
            if (dto.getRoleId() != null) {
                predicates.add(cb.equal(root.get("role").get("id"), dto.getRoleId()));
            }

            // Keyword (Search by User Name or Role Name)
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                keywordPredicates.add(likePredicate(cb, root.get("user").get("username"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("role").get("name"), keyword));

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchUserRoleDto dto) {
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

    public Pageable getPageable(SearchUserRoleDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;
        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
