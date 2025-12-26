package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;

@Table(name = "tbl_staff_labour_agreement")
@Entity
public class StaffLabourAgreement extends AuditableEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    private Integer contractType;//ContractType thu viec, chinh thuc, thoi vu, xac dinh thoi han, khong xac dinh thoi han

    @Column(name = "labour_agreement_number", unique = true)
    private String labourAgreementNumber;// so hop dong

    @Column(name = "start_date")
    private Date startDate; // ngay bat dau hieu luc

    @Column(name = "end_date")
    private Date endDate;// ngay ap dung cuoi cung

    @Column(name = "duration_months")
    private Integer durationMonths; // số tháng hợp đồng (chỉ áp dụng khi loại hợp đồng là xác định thời hạn)

    @Column(name = "working_hour")
    private Double workingHour;// gio cong chuan 1 ngay

    @Column(name = "working_hour_week_min")
    private Double workingHourWeekMin;// gio cong toi thieu 1 tuan

    @Column(name = "salary")
    private Double salary;// muc luong

    @Column(name = "signed_date")
    private Date signedDate;// Ngày ký

    @Column(name = "agreement_status")
    private Integer agreementStatus; // Trạng thái hợp đồng. Chi tiết HRConstants.StaffLabourAgreementStatus;

    public StaffLabourAgreement() {
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public Integer getContractType() {
        return contractType;
    }

    public void setContractType(Integer contractType) {
        this.contractType = contractType;
    }

    public String getLabourAgreementNumber() {
        return labourAgreementNumber;
    }

    public void setLabourAgreementNumber(String labourAgreementNumber) {
        this.labourAgreementNumber = labourAgreementNumber;
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

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public Double getWorkingHour() {
        return workingHour;
    }

    public void setWorkingHour(Double workingHour) {
        this.workingHour = workingHour;
    }

    public Double getWorkingHourWeekMin() {
        return workingHourWeekMin;
    }

    public void setWorkingHourWeekMin(Double workingHourWeekMin) {
        this.workingHourWeekMin = workingHourWeekMin;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public Date getSignedDate() {
        return signedDate;
    }

    public void setSignedDate(Date signedDate) {
        this.signedDate = signedDate;
    }

    public Integer getAgreementStatus() {
        return agreementStatus;
    }

    public void setAgreementStatus(Integer agreementStatus) {
        this.agreementStatus = agreementStatus;
    }
}
