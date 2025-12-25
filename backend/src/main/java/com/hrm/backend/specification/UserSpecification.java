package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchUserDto;
import com.hrm.backend.entity.User;
import com.hrm.backend.entity.UserRole;
import com.hrm.backend.entity.Role;
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
public class UserSpecification extends BaseSpecification<User> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "username", "email", "createdAt", "updatedAt", "lastLoginTime");

    public Specification<User> getSpecification(SearchUserDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Keyword (username, email, or person name)
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                keywordPredicates.add(likePredicate(cb, root.get("username"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("email"), keyword));

                // Join with Person to search by display name
                // Note: Person might be null, so use left join if needed, but typically User
                // has Person?
                // User entity defines @OneToOne private Person person;
                Join<Object, Object> personJoin = root.join("person", JoinType.LEFT);
                keywordPredicates.add(likePredicate(cb, personJoin.get("firstName"), keyword));
                keywordPredicates.add(likePredicate(cb, personJoin.get("lastName"), keyword));
                keywordPredicates.add(likePredicate(cb, personJoin.get("displayName"), keyword));
                keywordPredicates.add(likePredicate(cb, personJoin.get("phoneNumber"), keyword));

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // Specific Filters
            if (StringUtils.hasText(dto.getUsername())) {
                predicates.add(likePredicate(cb, root.get("username"), dto.getUsername()));
            }
            if (StringUtils.hasText(dto.getEmail())) {
                predicates.add(likePredicate(cb, root.get("email"), dto.getEmail()));
            }

            // Filter by ID
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // Date Range
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // Filter by Role ID
            if (dto.getRoleId() != null) {
                // Join User -> UserRole -> Role
                // User has `roles` (Set<UserRole>)
                Join<User, UserRole> userRolesJoin = root.join("roles", JoinType.INNER);
                Join<UserRole, Role> roleJoin = userRolesJoin.join("role", JoinType.INNER);
                predicates.add(cb.equal(roleJoin.get("id"), dto.getRoleId()));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchUserDto dto) {
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

    public Pageable getPageable(SearchUserDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;
        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
