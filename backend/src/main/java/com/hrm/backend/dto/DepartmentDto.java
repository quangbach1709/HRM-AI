package com.hrm.backend.dto;

import com.hrm.backend.entity.Department;
import com.hrm.backend.entity.Position;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DepartmentDto extends BaseObjectDto {
    private DepartmentDto parent; // Phòng ban cha
    private UUID parentId; // ID phòng ban cha
    private List<DepartmentDto> subRows; // Danh sách phòng ban con
    private PositionDto positionManager; // Người phụ trách phòng ban
    private List<PositionDto> positions; //

    public DepartmentDto() {
    }

    public DepartmentDto(Department entity, Boolean isGetParent, Boolean isGetSub, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.parentId = entity.getParent() != null ? entity.getParent().getId() : null;
            if (entity.getPositionManager() != null) {
                this.positionManager = new PositionDto(entity.getPositionManager(), false, true);
            }
            if (isGetParent && entity.getParent() != null) {
                this.parent = new DepartmentDto(entity.getParent(), false, false, isGetFull);
            }

            if (isGetSub && entity.getSubDepartments() != null) {
                this.subRows = new ArrayList<>();
                for (Department sub : entity.getSubDepartments()) {
                    this.subRows.add(new DepartmentDto(sub, false, true, isGetFull));
                }
            }
            if (entity.getPositions() != null && !entity.getPositions().isEmpty()) {
                this.positions = new ArrayList<>();
                for (Position position : entity.getPositions()) {
                    PositionDto positionDto = new PositionDto();
                    positionDto.setId(position.getId());
                    positionDto.setName(position.getName());
                    positionDto.setCode(position.getCode());
                    positionDto.setDescription(position.getDescription());
                    positionDto.setIsMain(position.getIsMain());

                    if (position.getStaff() != null) {
                        StaffDto staffDto = new StaffDto();
                        staffDto.setId(position.getStaff().getId());
                        staffDto.setStaffCode(position.getStaff().getStaffCode());
                        staffDto.setDisplayName(position.getStaff().getDisplayName());
                        positionDto.setStaff(staffDto);
                    }
                    this.positions.add(positionDto);
                }
            }
        }
    }

    public DepartmentDto getParent() {
        return parent;
    }

    public void setParent(DepartmentDto parent) {
        this.parent = parent;
    }

    public UUID getParentId() {
        return parentId;
    }

    public void setParentId(UUID parentId) {
        this.parentId = parentId;
    }

    public List<DepartmentDto> getSubRows() {
        return subRows;
    }

    public void setSubRows(List<DepartmentDto> subRows) {
        this.subRows = subRows;
    }

    public PositionDto getPositionManager() {
        return positionManager;
    }

    public void setPositionManager(PositionDto positionManager) {
        this.positionManager = positionManager;
    }

    public List<PositionDto> getPositions() {
        return positions;
    }

    public void setPositions(List<PositionDto> positions) {
        this.positions = positions;
    }
}
