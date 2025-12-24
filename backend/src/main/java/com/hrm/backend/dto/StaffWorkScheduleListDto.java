package com.hrm.backend.dto;

import java.util.Date;
import java.util.List;

public class StaffWorkScheduleListDto extends AuditableDto {
    //Phân ca cho nhiều người
    private List<Integer> shiftWorkTypeList;
    private List<StaffDto> staffs;
    private Date fromWorkingDate;
    private Date toWorkingDate;
    // Danh sách các thứ trong tuần áp dụng (1 = Monday, ..., 7 = Sunday)
    private List<Integer> weekdays;

    public StaffWorkScheduleListDto() {
    }

    public List<Integer> getShiftWorkTypeList() {
        return shiftWorkTypeList;
    }

    public void setShiftWorkTypeList(List<Integer> shiftWorkTypeList) {
        this.shiftWorkTypeList = shiftWorkTypeList;
    }

    public List<StaffDto> getStaffs() {
        return staffs;
    }

    public void setStaffs(List<StaffDto> staffs) {
        this.staffs = staffs;
    }

    public Date getFromWorkingDate() {
        return fromWorkingDate;
    }

    public void setFromWorkingDate(Date fromWorkingDate) {
        this.fromWorkingDate = fromWorkingDate;
    }

    public Date getToWorkingDate() {
        return toWorkingDate;
    }

    public void setToWorkingDate(Date toWorkingDate) {
        this.toWorkingDate = toWorkingDate;
    }

    public List<Integer> getWeekdays() {
        return weekdays;
    }

    public void setWeekdays(List<Integer> weekdays) {
        this.weekdays = weekdays;
    }
}
