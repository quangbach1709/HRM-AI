package com.hrm.backend.dto;


import com.hrm.backend.entity.Position;

public class PositionDto extends BaseObjectDto {
    private DepartmentDto department;
    private StaffDto staff;
    private Boolean isMain;

    public PositionDto() {
    }

    public PositionDto(Position entity, Boolean isGetDepartment, Boolean isGetStaff) {
        super(entity);
        if (entity != null) {
            if (isGetDepartment && entity.getDepartment() != null) {
                this.department = new DepartmentDto(entity.getDepartment(), false, false, false);
            }
            if (isGetStaff && entity.getStaff() != null) {
                this.staff = new StaffDto(entity.getStaff(), false);
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

}
