package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchStaffWorkScheduleDto;
import com.hrm.backend.entity.StaffWorkSchedule;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.*;
import java.util.*;

@Component
public class StaffWorkScheduleSpecification extends BaseSpecification<StaffWorkSchedule> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "modifiedAt", "checkIn", "checkOut", "workingDate", "shiftWorkType", "shiftWorkStatus");

    public Specification<StaffWorkSchedule> getSpecification(SearchStaffWorkScheduleDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Avoid duplicate when joining
            query.distinct(true);

            // 1. VOIDED (Inherited logic from BaseEntity usually handles soft delete if
            // applicable,
            // but here we check Voided field explicitly if BaseSpecification supports it)
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // 2. KEYWORD SEARCH
            // Search by Staff Name or Code?
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                // Search in Staff Code/Name
                Join<Object, Object> staffJoin = root.join("staff", JoinType.LEFT);
                keywordPredicates.add(likePredicate(cb, staffJoin.get("staffCode"), keyword));
                keywordPredicates.add(likePredicate(cb, staffJoin.get("displayName"), keyword));

                if (!keywordPredicates.isEmpty()) {
                    predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                }
            }

            // 3. FILTER BY ID
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // 4. DATE RANGE (Using checkIn as the Start Date of allocation)
            Predicate datePredicate = dateRangePredicate(
                    cb, root.get("checkIn"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // 5. OTHER FILTERS
            if (dto.getShiftWorkType() != null) {
                predicates.add(cb.equal(root.get("shiftWorkType"), dto.getShiftWorkType()));
            }
            if (dto.getShiftWorkStatus() != null) {
                predicates.add(cb.equal(root.get("shiftWorkStatus"), dto.getShiftWorkStatus()));
            }
            if (dto.getIsLocked() != null) {
                predicates.add(cb.equal(root.get("isLocked"), dto.getIsLocked()));
            }
            if (dto.getStaffId() != null) {
                predicates.add(cb.equal(root.get("staff").get("id"), dto.getStaffId()));
            }
            if (dto.getCoordinatorId() != null) {
                predicates.add(cb.equal(root.get("coordinator").get("id"), dto.getCoordinatorId()));
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchStaffWorkScheduleDto dto) {
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

    public Pageable getPageable(SearchStaffWorkScheduleDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
