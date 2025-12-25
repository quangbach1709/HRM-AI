package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "tbl_staff")
@PrimaryKeyJoinColumn(name = "id")
public class Staff extends Person {

    @Column(name = "staff_code", unique = true)
    private String staffCode;// Mã nhân viên
    @Column(name = "recruitment_date")
    private Date recruitmentDate; // Ngày tuyển dụng
    @Column(name = "start_date")
    private Date startDate; // Ngày bắt đầu chính thức
    @Column(name = "apprentice_days")
    private Integer apprenticeDays; // Số ngày học việc/thử việc
    @OneToMany(mappedBy = "staff", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StaffLabourAgreement> agreements;// Hợp đồng
    @Column(name = "employee_status")
    private Integer employeeStatus; //DatnConstants.EmployeeStatus
    @Column(name = "staff_phase")
    private Integer staffPhase; // Loại nhân viên. Chi tiết: DatnConstants.StaffPhase
    @Column(name = "require_attendance")
    private Boolean requireAttendance; //Nhân viên có cần chấm công không không
    @Column(name = "allow_external_ip_timekeeping")
    private Boolean allowExternalIpTimekeeping; // Cho phép chấm công ngoài
    @ManyToOne
    @JoinColumn(name = "salary_template_id")
    private SalaryTemplate salaryTemplate; //Mẫu bảng lương nhân viên sử dụng dùng để tính lương

    public Staff() {
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public Date getRecruitmentDate() {
        return recruitmentDate;
    }

    public void setRecruitmentDate(Date recruitmentDate) {
        this.recruitmentDate = recruitmentDate;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Integer getApprenticeDays() {
        return apprenticeDays;
    }

    public void setApprenticeDays(Integer apprenticeDays) {
        this.apprenticeDays = apprenticeDays;
    }

    public Set<StaffLabourAgreement> getAgreements() {
        return agreements;
    }

    public void setAgreements(Set<StaffLabourAgreement> agreements) {
        this.agreements = agreements;
    }

    public Integer getEmployeeStatus() {
        return employeeStatus;
    }

    public void setEmployeeStatus(Integer employeeStatus) {
        this.employeeStatus = employeeStatus;
    }

    public Integer getStaffPhase() {
        return staffPhase;
    }

    public void setStaffPhase(Integer staffPhase) {
        this.staffPhase = staffPhase;
    }

    public Boolean getRequireAttendance() {
        return requireAttendance;
    }

    public void setRequireAttendance(Boolean requireAttendance) {
        this.requireAttendance = requireAttendance;
    }

    public Boolean getAllowExternalIpTimekeeping() {
        return allowExternalIpTimekeeping;
    }

    public void setAllowExternalIpTimekeeping(Boolean allowExternalIpTimekeeping) {
        this.allowExternalIpTimekeeping = allowExternalIpTimekeeping;
    }

    public SalaryTemplate getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplate salaryTemplate) {
        this.salaryTemplate = salaryTemplate;
    }
}
