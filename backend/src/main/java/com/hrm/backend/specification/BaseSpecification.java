package com.hrm.backend.specification;

import jakarta.persistence.criteria.*;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Base class chứa các method helper cho Specification
 * Tất cả Specification khác sẽ extends class này
 */
public abstract class BaseSpecification<T> {

    /**
     * Tạo predicate LIKE cho tìm kiếm text (case-insensitive)
     * Ví dụ: LOWER(name) LIKE '%keyword%'
     */
    protected Predicate likePredicate(CriteriaBuilder cb, Expression<String> field, String value) {
        if (!StringUtils.hasText(value))
            return null;
        return cb.like(cb.lower(field), "%" + value.toLowerCase().trim() + "%");
    }

    /**
     * Tạo predicate EQUAL với null-safe
     */
    protected <V> Predicate equalPredicate(CriteriaBuilder cb, Expression<V> field, V value) {
        if (value == null)
            return null;
        return cb.equal(field, value);
    }

    /**
     * Tạo predicate cho khoảng thời gian (fromDate - toDate)
     */
    protected Predicate dateRangePredicate(
            CriteriaBuilder cb,
            Expression<? extends Date> field,
            Date fromDate,
            Date toDate) {

        List<Predicate> predicates = new ArrayList<>();

        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(field, fromDate));
        }
        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(field, toDate));
        }

        if (predicates.isEmpty())
            return null;
        return cb.and(predicates.toArray(new Predicate[0]));
    }

    /**
     * Tạo predicate cho Boolean field với null handling
     */
    protected Predicate booleanPredicate(CriteriaBuilder cb, Expression<Boolean> field, Boolean value) {
        if (value == null)
            return null;
        return value ? cb.isTrue(field) : cb.isFalse(field);
    }

    /**
     * Tạo predicate cho voided/soft-delete
     * Mặc định: lấy records chưa bị xóa (voided = false hoặc null)
     */
    protected Predicate voidedPredicate(CriteriaBuilder cb, Expression<Boolean> field, Boolean voided) {
        if (voided != null && voided) {
            return cb.isTrue(field); // Lấy records đã xóa
        }
        // Mặc định: lấy records chưa xóa
        return cb.or(cb.isNull(field), cb.isFalse(field));
    }

    /**
     * Tạo predicate IN cho danh sách values
     */
    protected <V> Predicate inPredicate(Expression<V> field, Collection<V> values) {
        if (values == null || values.isEmpty())
            return null;
        return field.in(values);
    }

    /**
     * Combine nhiều predicates với AND (bỏ qua null predicates)
     */
    protected Predicate andPredicates(CriteriaBuilder cb, List<Predicate> predicates) {
        List<Predicate> validPredicates = new ArrayList<>();
        for (Predicate p : predicates) {
            if (p != null)
                validPredicates.add(p);
        }

        if (validPredicates.isEmpty()) {
            return cb.conjunction(); // Trả về TRUE
        }
        return cb.and(validPredicates.toArray(new Predicate[0]));
    }

    /**
     * Combine nhiều predicates với OR (bỏ qua null predicates)
     */
    protected Predicate orPredicates(CriteriaBuilder cb, List<Predicate> predicates) {
        List<Predicate> validPredicates = new ArrayList<>();
        for (Predicate p : predicates) {
            if (p != null)
                validPredicates.add(p);
        }

        if (validPredicates.isEmpty()) {
            return cb.conjunction();
        }
        return cb.or(validPredicates.toArray(new Predicate[0]));
    }
}
