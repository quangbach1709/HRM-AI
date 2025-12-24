package com.hrm.backend.entity;

import jakarta.persistence.*;

//Chi tiết từng khoản lương phần tử lương
@Entity
@Table(name = "tbl_salary_result_item_detail",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"salary_result_item_id", "salary_template_item_id"})
        }
)
public class SalaryResultItemDetail extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_result_item_id")
    private SalaryResultItem salaryResultItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_template_item_id")
    private SalaryTemplateItem salaryTemplateItem;

    @Column(name = "value")
    private Double value; // Giá trị của khoản lương này

    public SalaryResultItemDetail() {
    }

    public SalaryResultItem getSalaryResultItem() {
        return salaryResultItem;
    }

    public void setSalaryResultItem(SalaryResultItem salaryResultItem) {
        this.salaryResultItem = salaryResultItem;
    }

    public SalaryTemplateItem getSalaryTemplateItem() {
        return salaryTemplateItem;
    }

    public void setSalaryTemplateItem(SalaryTemplateItem salaryTemplateItem) {
        this.salaryTemplateItem = salaryTemplateItem;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }
}
