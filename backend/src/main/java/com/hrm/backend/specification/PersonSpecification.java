package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchPersonDto;
import com.hrm.backend.entity.Person;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class PersonSpecification extends BaseSpecification<Person> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "firstName", "lastName", "displayName",
            "birthDate", "email", "phoneNumber", "idNumber", "taxCode");

    public Specification<Person> getSpecification(SearchPersonDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // ===== 1. VOIDED =====
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // ===== 2. KEYWORD SEARCH =====
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(likePredicate(cb, root.get("firstName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("lastName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("displayName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("email"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("phoneNumber"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("idNumber"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("taxCode"), keyword));

                if (!keywordPredicates.isEmpty()) {
                    predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            // ===== 3. ID =====
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // ===== 4. SPECIFIC FIELDS =====
            if (StringUtils.hasText(dto.getFirstName())) {
                predicates.add(likePredicate(cb, root.get("firstName"), dto.getFirstName()));
            }
            if (StringUtils.hasText(dto.getLastName())) {
                predicates.add(likePredicate(cb, root.get("lastName"), dto.getLastName()));
            }
            if (StringUtils.hasText(dto.getDisplayName())) {
                predicates.add(likePredicate(cb, root.get("displayName"), dto.getDisplayName()));
            }
            if (StringUtils.hasText(dto.getEmail())) {
                predicates.add(likePredicate(cb, root.get("email"), dto.getEmail()));
            }
            if (StringUtils.hasText(dto.getPhoneNumber())) {
                predicates.add(likePredicate(cb, root.get("phoneNumber"), dto.getPhoneNumber()));
            }
            if (StringUtils.hasText(dto.getIdNumber())) {
                predicates.add(likePredicate(cb, root.get("idNumber"), dto.getIdNumber()));
            }
            if (StringUtils.hasText(dto.getTaxCode())) {
                predicates.add(likePredicate(cb, root.get("taxCode"), dto.getTaxCode()));
            }

            if (dto.getGender() != null) {
                predicates.add(cb.equal(root.get("gender"), dto.getGender()));
            }
            if (dto.getMaritalStatus() != null) {
                predicates.add(cb.equal(root.get("maritalStatus"), dto.getMaritalStatus()));
            }
            if (dto.getEducationLevel() != null) {
                predicates.add(cb.equal(root.get("educationLevel"), dto.getEducationLevel()));
            }

            // ===== 5. DATE RANGE =====
            Predicate createdAtPredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (createdAtPredicate != null) {
                predicates.add(createdAtPredicate);
            }

            Predicate birthDatePredicate = dateRangePredicate(
                    cb, root.get("birthDate"), dto.getFromBirthDate(), dto.getToBirthDate());
            if (birthDatePredicate != null) {
                predicates.add(birthDatePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchPersonDto dto) {
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

    public Pageable getPageable(SearchPersonDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
