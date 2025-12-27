package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchCandidateDto;
import com.hrm.backend.entity.Candidate;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class CandidateSpecification extends BaseSpecification<Candidate> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "candidateCode", "submissionDate", "interviewDate");

    public Specification<Candidate> getSpecification(SearchCandidateDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Keyword (candidateCode, displayName, email, phoneNumber)
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                keywordPredicates.add(likePredicate(cb, root.get("candidateCode"), keyword));

                // Fields form parent (Person) - Candidate extends Person
                // Because Candidate extends Person using InheritanceType.JOINED (usually),
                // fields are accessible directly?
                // Checking Entity: @PrimaryKeyJoinColumn(name = "id") extends Person.
                // So properties of Person are properties of Candidate entity object.
                keywordPredicates.add(likePredicate(cb, root.get("displayName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("email"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("phoneNumber"), keyword));

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // Filters
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            if (StringUtils.hasText(dto.getCandidateCode())) {
                predicates.add(likePredicate(cb, root.get("candidateCode"), dto.getCandidateCode()));
            }

            if (dto.getPositionId() != null) {
                predicates.add(cb.equal(root.get("position").get("id"), dto.getPositionId()));
            }

            if (dto.getCandidateStatus() != null) {
                predicates.add(cb.equal(root.get("candidateStatus"), dto.getCandidateStatus()));
            }

            if (dto.getRecruitmentRequestId() != null) {
                predicates.add(cb.equal(root.get("recruitmentRequest").get("id"), dto.getRecruitmentRequestId()));
            }

            if (dto.getIntroducerId() != null) {
                predicates.add(cb.equal(root.get("introducer").get("id"), dto.getIntroducerId()));
            }

            // Date range (createdAt or submissionDate? typically createdAt for generic
            // search, use specific for others)
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchCandidateDto dto) {
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

    public Pageable getPageable(SearchCandidateDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
