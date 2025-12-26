package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchStaffLabourAgreementDto;
import com.hrm.backend.entity.StaffLabourAgreement;
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
public class StaffLabourAgreementSpecification extends BaseSpecification<StaffLabourAgreement> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "labourAgreementNumber", "startDate", "endDate", "signedDate", "salary");

    public Specification<StaffLabourAgreement> getSpecification(SearchStaffLabourAgreementDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // Keyword
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(likePredicate(cb, root.get("labourAgreementNumber"), keyword));

                // Join staff to search by staff name/code if needed?
                // For now, simple search on agreement number

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // ID
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // Staff ID
            if (dto.getStaffId() != null) {
                predicates.add(cb.equal(root.get("staff").get("id"), dto.getStaffId()));
            }

            // Agreement Number (Exact match if specific filter provided separately from
            // keyword)
            if (StringUtils.hasText(dto.getLabourAgreementNumber())) {
                predicates.add(likePredicate(cb, root.get("labourAgreementNumber"), dto.getLabourAgreementNumber()));
            }

            // Contract Type
            if (dto.getContractType() != null) {
                predicates.add(cb.equal(root.get("contractType"), dto.getContractType()));
            }

            // Status
            if (dto.getAgreementStatus() != null) {
                predicates.add(cb.equal(root.get("agreementStatus"), dto.getAgreementStatus()));
            }

            // Start Date Range
            Predicate startDatePredicate = dateRangePredicate(cb, root.get("startDate"), dto.getFromStartDate(),
                    dto.getToStartDate());
            if (startDatePredicate != null)
                predicates.add(startDatePredicate);

            // End Date Range
            Predicate endDatePredicate = dateRangePredicate(cb, root.get("endDate"), dto.getFromEndDate(),
                    dto.getToEndDate());
            if (endDatePredicate != null)
                predicates.add(endDatePredicate);

            // Signed Date Range
            Predicate signedDatePredicate = dateRangePredicate(cb, root.get("signedDate"), dto.getFromSignedDate(),
                    dto.getToSignedDate());
            if (signedDatePredicate != null)
                predicates.add(signedDatePredicate);

            // Created Date Range (from base SearchDto)
            Predicate createdDatePredicate = dateRangePredicate(cb, root.get("createdAt"), dto.getFromDate(),
                    dto.getToDate());
            if (createdDatePredicate != null)
                predicates.add(createdDatePredicate);

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchStaffLabourAgreementDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort.Direction direction;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        } else if (dto.getOrderBy() != null) {
            direction = dto.getOrderBy() ? Sort.Direction.ASC : Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    public Pageable getPageable(SearchStaffLabourAgreementDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;
        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
