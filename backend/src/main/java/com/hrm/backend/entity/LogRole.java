package com.hrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_log_role")
public class LogRole extends AuditableEntity {
    @Column(name = "list_role_old")
    private String listRoleOle;
    @Column(name = "list_role_new")
    private String listRoleNew;
    @Column(name = "person_change")
    private String personChange;

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
