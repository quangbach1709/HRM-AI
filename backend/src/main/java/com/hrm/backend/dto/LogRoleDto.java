package com.hrm.backend.dto;


import com.hrm.backend.entity.LogRole;

public class LogRoleDto extends AuditableDto {
    private String listRoleOle;
    private String listRoleNew;
    private String personChange;

    public LogRoleDto() {
    }


    public LogRoleDto(LogRole entity) {
        super(entity);
        this.listRoleOle = entity.getListRoleOle();
        this.listRoleNew = entity.getListRoleNew();
        this.personChange = entity.getPersonChange();
    }


    public String getListRoleOle() {
        return listRoleOle;
    }

    public void setListRoleOle(String listRoleOle) {
        this.listRoleOle = listRoleOle;
    }

    public String getListRoleNew() {
        return listRoleNew;
    }

    public void setListRoleNew(String listRoleNew) {
        this.listRoleNew = listRoleNew;
    }

    public String getPersonChange() {
        return personChange;
    }

    public void setPersonChange(String personChange) {
        this.personChange = personChange;
    }
}