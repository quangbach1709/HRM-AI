package com.hrm.backend.dto;


import com.hrm.backend.entity.StaffLabourAgreement;
import jakarta.validation.Valid;

import java.util.Date;
import java.util.UUID;

@Valid
public class StaffLabourAgreementDto extends AuditableDto {
    private StaffDto staff;
    private UUID staffId;
    private Integer contractType; // 1: Thử việc, 2: Chính thức, 3: Thời vụ, 4: Xác định thời hạn, 5: Không xác định thời hạn
    private String labourAgreementNumber; // Số hợp đồng
    private Date startDate; // Ngày bắt đầu hiệu lực hợp đồng
    private Date endDate; // Ngày kết thúc hợp đồng (nếu có)
    private Integer durationMonths; // Số tháng hợp đồng (chỉ áp dụng với hợp đồng xác định thời hạn)
    private Double workingHour; // Giờ làm việc chuẩn mỗi ngày
    private Double workingHourWeekMin; // Số giờ làm việc tối thiểu mỗi tuần
    private Double salary; // Mức lương chính theo hợp đồng
    private Date signedDate; // Ngày ký hợp đồng

    private Integer agreementStatus; // Trạng thái hợp đồng. Xem DatnConstants.StaffLabourAgreementStatus

    public StaffLabourAgreementDto(StaffLabourAgreement entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            if (entity.getStaff() != null) {
                this.staff = new StaffDto(entity.getStaff(), false);
            }
            this.staffId = entity.getStaff() != null ? entity.getStaff().getId() : null;
            this.contractType = entity.getContractType();
            this.labourAgreementNumber = entity.getLabourAgreementNumber();
            this.startDate = entity.getStartDate();
            this.endDate = entity.getEndDate();
            this.durationMonths = entity.getDurationMonths();
            this.workingHour = entity.getWorkingHour();
            this.workingHourWeekMin = entity.getWorkingHourWeekMin();
            this.salary = entity.getSalary();
            this.signedDate = entity.getSignedDate();

            this.agreementStatus = entity.getAgreementStatus();

            if (Boolean.TRUE.equals(isGetFull)) {
                // TODO: Bổ sung lấy thêm các thông tin liên quan nếu cần
            }
        }
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public StaffDto getStaff() {
        return staff;
    }

    public void setStaff(StaffDto staff) {
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
