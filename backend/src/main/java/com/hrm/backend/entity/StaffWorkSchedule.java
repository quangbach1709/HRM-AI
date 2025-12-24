package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;

/*
 * Bảng phân công công việc, nhân viên nào sẽ làm việc vào giờ nào
 */
@Table(name = "tbl_staff_work_schedule")
@Entity
public class StaffWorkSchedule extends AuditableEntity {
    @Column(name = "shift_work_type")
    private Integer shiftWorkType; // Loại ca làm việc. Chi tiết: DatnConstants.ShiftWorkType

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff; // Nhân viên được phân ca làm việc

    @Column(name = "working_date")
    private Date workingDate; //Ngày làm việc

    @Column(name = "check_in")
    private Date checkIn; // Thời gian bắt đầu làm việc

    @Column(name = "check_out")
    private Date checkOut; // Thời gian kết thúc làm việc

    @Column(name = "shift_work_status")
    private Integer shiftWorkStatus; // Trạng thái ca làm việc. Chi tiết: DatnConstants.ShiftWorkStatus

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinator_id")
    private Staff coordinator; // Người phân ca làm việc

    // Ca làm việc này đã bị khóa hay chưa, nếu đã bị khóa thì không cho phép chấm công hay tính toán lại
    @Column(name = "is_locked")
    private Boolean isLocked;

    public StaffWorkSchedule() {
    }

    public Integer getShiftWorkType() {
        return shiftWorkType;
    }

    public void setShiftWorkType(Integer shiftWorkType) {
        this.shiftWorkType = shiftWorkType;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
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

    public Staff getCoordinator() {
        return coordinator;
    }

    public void setCoordinator(Staff coordinator) {
        this.coordinator = coordinator;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean locked) {
        isLocked = locked;
    }
}
