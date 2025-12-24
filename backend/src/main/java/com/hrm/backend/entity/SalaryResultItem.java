package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

//Chi tiết bảng lương của từng nhân viên
@Entity
@Table(name = "tbl_salary_result_item",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"salary_result_id", "staff_id"})
        }
)
public class SalaryResultItem extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_result_id")
    private SalaryResult salaryResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @OneToMany(mappedBy = "salaryResultItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SalaryResultItemDetail> salaryResultItemDetails;

    public SalaryResultItem() {
    }

    public SalaryResult getSalaryResult() {
        return salaryResult;
    }

    public void setSalaryResult(SalaryResult salaryResult) {
        this.salaryResult = salaryResult;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public Set<SalaryResultItemDetail> getSalaryResultItemDetails() {
        return salaryResultItemDetails;
    }

    public void setSalaryResultItemDetails(Set<SalaryResultItemDetail> salaryResultItemDetails) {
        this.salaryResultItemDetails = salaryResultItemDetails;
    }
}
