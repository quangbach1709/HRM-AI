package com.hrm.backend.dto;

import java.util.List;
import java.util.UUID;

/**
 * Response DTO for salary calculation result
 */
public class CalculateSalaryResponseDto {
    private UUID salaryResultId;
    private UUID salaryResultItemId;
    private UUID staffId;
    private String staffCode;
    private String staffName;
    private UUID salaryPeriodId;
    private String salaryPeriodName;
    private Double totalSalary;
    private List<SalaryItemDetailDto> items;

    public CalculateSalaryResponseDto() {
    }

    // Nested class for item details
    public static class SalaryItemDetailDto {
        private UUID salaryTemplateItemId;
        private String code;
        private String name;
        private Integer salaryItemType;
        private Double value;
        private Integer displayOrder;

        public SalaryItemDetailDto() {
        }

        public SalaryItemDetailDto(UUID salaryTemplateItemId, String code, String name,
                Integer salaryItemType, Double value, Integer displayOrder) {
            this.salaryTemplateItemId = salaryTemplateItemId;
            this.code = code;
            this.name = name;
            this.salaryItemType = salaryItemType;
            this.value = value;
            this.displayOrder = displayOrder;
        }

        public UUID getSalaryTemplateItemId() {
            return salaryTemplateItemId;
        }

        public void setSalaryTemplateItemId(UUID salaryTemplateItemId) {
            this.salaryTemplateItemId = salaryTemplateItemId;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getSalaryItemType() {
            return salaryItemType;
        }

        public void setSalaryItemType(Integer salaryItemType) {
            this.salaryItemType = salaryItemType;
        }

        public Double getValue() {
            return value;
        }

        public void setValue(Double value) {
            this.value = value;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
        }
    }

    // Getters and Setters

    public UUID getSalaryResultId() {
        return salaryResultId;
    }

    public void setSalaryResultId(UUID salaryResultId) {
        this.salaryResultId = salaryResultId;
    }

    public UUID getSalaryResultItemId() {
        return salaryResultItemId;
    }

    public void setSalaryResultItemId(UUID salaryResultItemId) {
        this.salaryResultItemId = salaryResultItemId;
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public UUID getSalaryPeriodId() {
        return salaryPeriodId;
    }

    public void setSalaryPeriodId(UUID salaryPeriodId) {
        this.salaryPeriodId = salaryPeriodId;
    }

    public String getSalaryPeriodName() {
        return salaryPeriodName;
    }

    public void setSalaryPeriodName(String salaryPeriodName) {
        this.salaryPeriodName = salaryPeriodName;
    }

    public Double getTotalSalary() {
        return totalSalary;
    }

    public void setTotalSalary(Double totalSalary) {
        this.totalSalary = totalSalary;
    }

    public List<SalaryItemDetailDto> getItems() {
        return items;
    }

    public void setItems(List<SalaryItemDetailDto> items) {
        this.items = items;
    }
}
