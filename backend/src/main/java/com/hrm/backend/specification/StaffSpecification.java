package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchStaffDto;
import com.hrm.backend.entity.Staff;
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
public class StaffSpecification extends BaseSpecification<Staff> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt",
            "firstName", "lastName", "displayName",
            "staffCode", "recruitmentDate", "startDate",
            "employeeStatus", "staffPhase");

    public Specification<Staff> getSpecification(SearchStaffDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            // 1. Base Voided
            predicates.add(voidedPredicate(cb, root.get("voided"), dto.getVoided()));

            // 2. Keyword Search
            if (StringUtils.hasText(dto.getKeyword())) {
                String keyword = dto.getKeyword().trim();
                List<Predicate> keywordPredicates = new ArrayList<>();

                // Staff Code
                keywordPredicates.add(likePredicate(cb, root.get("staffCode"), keyword));

                // Person Fields
                keywordPredicates.add(likePredicate(cb, root.get("displayName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("lastName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("firstName"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("email"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("phoneNumber"), keyword));
                keywordPredicates.add(likePredicate(cb, root.get("idNumber"), keyword));

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // 3. Staff Specific Filters
            if (StringUtils.hasText(dto.getStaffCode())) {
                predicates.add(likePredicate(cb, root.get("staffCode"), dto.getStaffCode()));
            }
            if (dto.getEmployeeStatus() != null) {
                predicates.add(cb.equal(root.get("employeeStatus"), dto.getEmployeeStatus()));
            }
            if (dto.getStaffPhase() != null) {
                predicates.add(cb.equal(root.get("staffPhase"), dto.getStaffPhase()));
            }
            if (dto.getSalaryTemplateId() != null) {
                predicates.add(cb.equal(root.get("salaryTemplate").get("id"), dto.getSalaryTemplateId()));
            }
            if (dto.getRequireAttendance() != null) {
                predicates.add(cb.equal(root.get("requireAttendance"), dto.getRequireAttendance()));
            }
            if (dto.getAllowExternalIpTimekeeping() != null) {
                predicates.add(cb.equal(root.get("allowExternalIpTimekeeping"), dto.getAllowExternalIpTimekeeping()));
            }

            // 4. Person Filters
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

            // 5. Date Range (using recruitmentDate or createdAt?)
            // SearchDto typically uses fromDate/toDate for createdAt, but SearchPersonDto
            // defines fromBirthDate/toBirthDate.
            // Let's handle createdAt from Base SearchDto
            Predicate datePredicate = dateRangePredicate(cb, root.get("createdAt"), dto.getFromDate(), dto.getToDate());
            if (datePredicate != null) {
                predicates.add(datePredicate);
            }

            // Birth Date Range
            Predicate birthDatePredicate = dateRangePredicate(cb, root.get("birthDate"), dto.getFromBirthDate(),
                    dto.getToBirthDate());
            if (birthDatePredicate != null) {
                predicates.add(birthDatePredicate);
            }

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchStaffDto dto) {
        String sortBy = StringUtils.hasText(dto.getSortBy()) ? dto.getSortBy() : "createdAt";
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort.Direction direction = Sort.Direction.DESC;
        if (StringUtils.hasText(dto.getSortDirection())) {
            direction = "ASC".equalsIgnoreCase(dto.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        }

        return Sort.by(new Sort.Order(direction, sortBy));
    }

    public Pageable getPageable(SearchStaffDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;
        return PageRequest.of(Math.max(0, pageIndex), Math.min(Math.max(1, pageSize), 100), getSort(dto));
    }
}
