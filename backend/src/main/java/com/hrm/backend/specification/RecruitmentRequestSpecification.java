package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchRecruitmentRequestDto;
import com.hrm.backend.entity.RecruitmentRequest;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class RecruitmentRequestSpecification extends BaseSpecification<RecruitmentRequest> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "proposalDate", "code", "name");

    public Specification<RecruitmentRequest> getSpecification(SearchRecruitmentRequestDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // 1. Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // 2. Keyword
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(likePredicate(cb, root.get("code"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("name"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("request"), keyword));
                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // 3. ID
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // 4. Date Range (Proposal Date)
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("proposalDate"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // 5. Position
            if (dto.getPositionId() != null) {
                predicates.add(cb.equal(root.get("position").get("id"), dto.getPositionId()));
            }

            // 6. Proposer
            if (dto.getProposerId() != null) {
                predicates.add(cb.equal(root.get("proposer").get("id"), dto.getProposerId()));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchRecruitmentRequestDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "proposalDate";

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "proposalDate";
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

    public Pageable getPageable(SearchRecruitmentRequestDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
