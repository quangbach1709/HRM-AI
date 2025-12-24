package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

//Bảng lương tổng hợp theo kỳ lương
@Entity
@Table(name = "tbl_salary_result")
public class SalaryResult extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_period_id")
    private SalaryPeriod salaryPeriod;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_template_id")
    private SalaryTemplate salaryTemplate;

    @Column(name = "name")
    private String name; // "Lương tháng 5/2025"

    @OneToMany(mappedBy = "salaryResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SalaryResultItem> salaryResultItems;

    public SalaryResult() {
    }

    public SalaryPeriod getSalaryPeriod() {
        return salaryPeriod;
    }

    public void setSalaryPeriod(SalaryPeriod salaryPeriod) {
        this.salaryPeriod = salaryPeriod;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<SalaryResultItem> getSalaryResultItems() {
        return salaryResultItems;
    }

    public void setSalaryResultItems(Set<SalaryResultItem> salaryResultItems) {
        this.salaryResultItems = salaryResultItems;
    }

    public SalaryTemplate getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplate salaryTemplate) {
        this.salaryTemplate = salaryTemplate;
    }
}
