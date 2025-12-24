package com.hrm.backend.dto;


import com.hrm.backend.entity.StaffWorkSchedule;

import java.util.Date;

public class StaffWorkScheduleDto extends AuditableDto {
    private Integer shiftWorkType; // Loại ca làm việc. Chi tiết: DatnConstants.ShiftWorkType
    private StaffDto staff; // Nhân viên được phân ca làm việc
    private Date workingDate; //Ngày làm việc
    private Date checkIn; // Thời gian bắt đầu làm việc
    private Date checkOut; // Thời gian kết thúc làm việc
    private Integer shiftWorkStatus; // Trạng thái ca làm việc. Chi tiết: DatnConstants.ShiftWorkStatus
    private StaffDto coordinator; // Người phân ca làm việc
    private Boolean isLocked;

    public StaffWorkScheduleDto() {
    }

    public StaffWorkScheduleDto(StaffWorkSchedule entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.shiftWorkType = entity.getShiftWorkType();
            if (entity.getStaff() != null) {
                this.staff = new StaffDto();
                this.staff.setId(entity.getStaff().getId());
                this.staff.setStaffCode(entity.getStaff().getStaffCode());
                this.staff.setDisplayName(entity.getStaff().getDisplayName());
            }
            this.workingDate = entity.getWorkingDate();
            this.checkIn = entity.getCheckIn();
            this.checkOut = entity.getCheckOut();
            this.shiftWorkStatus = entity.getShiftWorkStatus();
            if (entity.getCoordinator() != null) {
                this.coordinator = new StaffDto();
                this.coordinator.setId(entity.getCoordinator().getId());
                this.coordinator.setStaffCode(entity.getCoordinator().getStaffCode());
                this.coordinator.setDisplayName(entity.getCoordinator().getDisplayName());
            }
            this.isLocked = entity.getIsLocked();
            if (isGetFull) {
                //todo
            }
        }
    }

    public Integer getShiftWorkType() {
        return shiftWorkType;
    }

    public void setShiftWorkType(Integer shiftWorkType) {
        this.shiftWorkType = shiftWorkType;
    }

    public StaffDto getStaff() {
        return staff;
    }

    public void setStaff(StaffDto staff) {
        this.staff = staff;
    }

    public Date getWorkingDate() {
        return workingDate;
    }

    public void setWorkingDate(Date workingDate) {
        this.workingDate = workingDate;
    }

    public Date getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(Date checkIn) {
        this.checkIn = checkIn;
    }

    public Date getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(Date checkOut) {
        this.checkOut = checkOut;
    }

    public Integer getShiftWorkStatus() {
        return shiftWorkStatus;
    }

    public void setShiftWorkStatus(Integer shiftWorkStatus) {
        this.shiftWorkStatus = shiftWorkStatus;
    }

    public StaffDto getCoordinator() {
        return coordinator;
    }

    public void setCoordinator(StaffDto coordinator) {
        this.coordinator = coordinator;
    }

    public Boolean getLocked() {
        return isLocked;
    }

    public void setLocked(Boolean locked) {
        isLocked = locked;
    }
}
