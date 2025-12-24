package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryResultItem;
import com.hrm.backend.entity.SalaryResultItemDetail;

import java.util.ArrayList;
import java.util.List;

public class SalaryResultItemDto extends AuditableDto {
    private SalaryResultDto salaryResult;
    private StaffDto staff;
    private List<SalaryResultItemDetailDto> salaryResultItemDetails;

    public SalaryResultItemDto() {
    }

    public SalaryResultItemDto(SalaryResultItem entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            if (entity.getSalaryResult() != null) {
                this.salaryResult = new SalaryResultDto();
                this.salaryResult.setId(entity.getSalaryResult().getId());
                this.salaryResult.setName(entity.getSalaryResult().getName());
            }
            if (entity.getStaff() != null) {
                this.staff = new StaffDto();
                this.staff.setId(entity.getStaff().getId());
                this.staff.setStaffCode(entity.getStaff().getStaffCode());
                this.staff.setDisplayName(entity.getStaff().getDisplayName());
            }
            if (isGetFull) {
                if (entity.getSalaryResultItemDetails() != null && !entity.getSalaryResultItemDetails().isEmpty()) {
                    this.salaryResultItemDetails = new ArrayList<>();
                    for (SalaryResultItemDetail itemDetail : entity.getSalaryResultItemDetails()) {
                        this.salaryResultItemDetails.add(new SalaryResultItemDetailDto(itemDetail, false, true));
                    }
                    // Sắp xếp theo displayOrder của SalaryTemplateItem
                    this.salaryResultItemDetails.sort((d1, d2) -> {
                        Integer order1 = d1.getSalaryTemplateItem() != null ? d1.getSalaryTemplateItem().getDisplayOrder() : Integer.MAX_VALUE;
                        Integer order2 = d2.getSalaryTemplateItem() != null ? d2.getSalaryTemplateItem().getDisplayOrder() : Integer.MAX_VALUE;
                        return order1.compareTo(order2);
                    });
                }
            }
        }
    }

    public SalaryResultDto getSalaryResult() {
        return salaryResult;
    }

    public void setSalaryResult(SalaryResultDto salaryResult) {
        this.salaryResult = salaryResult;
    }

    public StaffDto getStaff() {
        return staff;
    }

    public void setStaff(StaffDto staff) {
        this.staff = staff;
    }

    public List<SalaryResultItemDetailDto> getSalaryResultItemDetails() {
        return salaryResultItemDetails;
    }

    public void setSalaryResultItemDetails(List<SalaryResultItemDetailDto> salaryResultItemDetails) {
        this.salaryResultItemDetails = salaryResultItemDetails;
    }
}
