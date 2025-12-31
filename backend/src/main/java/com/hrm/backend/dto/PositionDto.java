package com.hrm.backend.dto;


import com.hrm.backend.entity.Position;

import java.util.UUID;

public class PositionDto extends BaseObjectDto {
    private DepartmentDto department;
    private UUID departmentId;
    private StaffDto staff;
    private UUID staffId;
    private Boolean isMain;

    public PositionDto() {
    }

    public PositionDto(Position entity, Boolean isGetDepartment, Boolean isGetStaff) {
        super(entity);
        if (entity != null) {
            if (isGetDepartment && entity.getDepartment() != null) {
                this.department = new DepartmentDto(entity.getDepartment(), false, false, false);
                this.departmentId = entity.getDepartment().getId();
            }
            if (isGetStaff && entity.getStaff() != null) {
                this.staff = new StaffDto(entity.getStaff(), false);
                this.staffId = entity.getStaff().getId();
            }
            this.isMain = entity.getIsMain();
        }
    }

    public DepartmentDto getDepartment() {
        return department;
    }

    public void setDepartment(DepartmentDto department) {
        this.department = department;
    }

    public StaffDto getStaff() {
        return staff;
    }

    public void setStaff(StaffDto staff) {
        this.staff = staff;
    }

    public Boolean getIsMain() {
        return isMain;
    }

    public void setIsMain(Boolean main) {
        isMain = main;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

}
