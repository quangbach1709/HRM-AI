package com.hrm.backend.specification;

import com.hrm.backend.dto.search.SearchFaceEmbeddingDto;
import com.hrm.backend.entity.FaceEmbedding;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Specification cho FaceEmbedding entity
 */
@Component
public class FaceEmbeddingSpecification extends BaseSpecification<FaceEmbedding> {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "createdAt", "updatedAt", "isActive", "modelVersion");

    public Specification<FaceEmbedding> getSpecification(SearchFaceEmbeddingDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            // 1. Filter by personId
            if (dto.getPersonId() != null) {
                predicates.add(cb.equal(root.get("person").get("id"), dto.getPersonId()));
            }

            // 2. Filter by isActive
            if (dto.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), dto.getIsActive()));
            }

            // 3. Filter by modelVersion
            if (StringUtils.hasText(dto.getModelVersion())) {
                predicates.add(cb.equal(root.get("modelVersion"), dto.getModelVersion()));
            }

            // 4. Keyword search (optional, if needed? maybe ID?)
            if (StringUtils.hasText(dto.getKeyword())) {
                // Currently no specific text fields to search besides modelVersion or maybe
                // person name?
                // Keeping it simple for now as requested.
            }

            // 5. Filter by ID
            if (dto.getId() != null) {
                predicates.add(cb.equal(root.get("id"), dto.getId()));
            }

            // 6. Filter soft-deleted (voided)
            predicates.add(cb.or(cb.isNull(root.get("voided")), cb.isFalse(root.get("voided"))));

            return andPredicates(cb, predicates);
        };
    }

    public Sort getSort(SearchFaceEmbeddingDto dto) {
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

    public Pageable getPageable(SearchFaceEmbeddingDto dto) {
        int pageIndex = dto.getPageIndex() != null ? dto.getPageIndex() : 0;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 10;

        pageIndex = Math.max(0, pageIndex);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        return PageRequest.of(pageIndex, pageSize, getSort(dto));
    }
}
