package com.hrm.backend.dto;


import com.hrm.backend.entity.Staff;
import com.hrm.backend.entity.StaffLabourAgreement;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Valid
public class StaffDto extends PersonDto {
    private String staffCode;// Mã nhân viên
    private Date recruitmentDate; // Ngày tuyển dụng
    private Date startDate; // Ngày bắt đầu chính thức
    private Integer apprenticeDays; // Số ngày học việc/thử việc
    private List<StaffLabourAgreementDto> agreements;// Hợp đồng
    private Integer employeeStatus; //DatnConstants.EmployeeStatus
    private Integer staffPhase; // Loại nhân viên. Chi tiết: DatnConstants.StaffPhase
    private Boolean requireAttendance; //Nhân viên có cần chấm công không không
    private Boolean allowExternalIpTimekeeping; // Cho phép chấm công ngoài
    private SalaryTemplateDto salaryTemplate; //Mẫu bảng lương nhân viên sử dụng dùng để tính lương

    public StaffDto() {
    }

    public StaffDto(UUID id, String staffCode, String displayName) {
        this.setId(id);
        this.setStaffCode(staffCode);
        this.setDisplayName(displayName);
    }
    public StaffDto(Staff entity, Boolean isGetFull) {
        super(entity, isGetFull);
        if (entity != null) {
            this.staffCode = entity.getStaffCode();
            this.recruitmentDate = entity.getRecruitmentDate();
            this.startDate = entity.getStartDate();
            this.apprenticeDays = entity.getApprenticeDays();
            this.employeeStatus = entity.getEmployeeStatus();
            this.staffPhase = entity.getStaffPhase();
            this.requireAttendance = entity.getRequireAttendance();
            this.allowExternalIpTimekeeping = entity.getAllowExternalIpTimekeeping();
            if (entity.getSalaryTemplate() != null) {
                this.salaryTemplate = new SalaryTemplateDto(entity.getSalaryTemplate(), false);
            }
            if (isGetFull) {
                if (entity.getAgreements() != null && !entity.getAgreements().isEmpty()) {
                    this.agreements = new ArrayList<>();
                    for (StaffLabourAgreement item : entity.getAgreements()) {
                        this.agreements.add(new StaffLabourAgreementDto(item, false));
                    }
                }
            }
        }
    }

    public static Staff toEntity(StaffDto dto) {
        if (dto == null) {
            return null;
        }
        Staff entity = new Staff();
        entity.setId(dto.getId());
        entity.setStaffCode(dto.getStaffCode());
        entity.setRecruitmentDate(dto.getRecruitmentDate());
        entity.setStartDate(dto.getStartDate());
        entity.setApprenticeDays(dto.getApprenticeDays());
        entity.setEmployeeStatus(dto.getEmployeeStatus());
        entity.setStaffPhase(dto.getStaffPhase());
        entity.setRequireAttendance(dto.getRequireAttendance());
        entity.setAllowExternalIpTimekeeping(dto.getAllowExternalIpTimekeeping());
        entity.setSalaryTemplate(SalaryTemplateDto.toEntity(dto.getSalaryTemplate()));
        return entity;
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

    public List<StaffLabourAgreementDto> getAgreements() {
        return agreements;
    }

    public void setAgreements(List<StaffLabourAgreementDto> agreements) {
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

    public SalaryTemplateDto getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplateDto salaryTemplate) {
        this.salaryTemplate = salaryTemplate;
    }
}