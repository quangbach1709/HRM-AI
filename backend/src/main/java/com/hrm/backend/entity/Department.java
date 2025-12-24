package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "tbl_department")
public class Department extends BaseObject {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    private Department parent; // Phòng ban cha

    @OneToMany(mappedBy = "parent")
    private Set<Department> subDepartments; // Danh sách phòng ban con

    @ManyToOne
    @JoinColumn(name = "position_manager_id")
    private Position positionManager; // Vị trí quản lý


    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Position> positions; //

    public Department() {
    }

    public Department getParent() {
        return parent;
    }

    public void setParent(Department parent) {
        this.parent = parent;
    }

    public Set<Department> getSubDepartments() {
        return subDepartments;
    }

    public void setSubDepartments(Set<Department> subDepartments) {
        this.subDepartments = subDepartments;
    }

    public Position getPositionManager() {
        return positionManager;
    }

    public void setPositionManager(Position positionManager) {
        this.positionManager = positionManager;
    }

    public Set<Position> getPositions() {
        return positions;
    }

    public void setPositions(Set<Position> positions) {
        this.positions = positions;
    }
}
