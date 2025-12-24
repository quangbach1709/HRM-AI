package com.hrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

//Kỳ lương (VD: tháng 5/2025, tháng 6/2025...)
@Entity
@Table(name = "tbl_salary_period")
public class SalaryPeriod extends BaseObject {
    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;

    @Column(name = "status")
    private Integer salaryPeriodStatus;//Xem status: DatnConstants.SalaryPeriodStatus

    @Column(name = "estimated_working_days")
    private Double estimatedWorkingDays; // Số ngày làm việc ước tính

    public SalaryPeriod() {
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Integer getSalaryPeriodStatus() {
        return salaryPeriodStatus;
    }

    public void setSalaryPeriodStatus(Integer salaryPeriodStatus) {
        this.salaryPeriodStatus = salaryPeriodStatus;
    }

    public Double getEstimatedWorkingDays() {
        return estimatedWorkingDays;
    }

    public void setEstimatedWorkingDays(Double estimatedWorkingDays) {
        this.estimatedWorkingDays = estimatedWorkingDays;
    }
}
