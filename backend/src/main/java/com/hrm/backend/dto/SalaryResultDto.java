package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryResult;
import com.hrm.backend.entity.SalaryResultItem;

import java.util.ArrayList;
import java.util.List;

public class SalaryResultDto extends AuditableDto {
    private SalaryPeriodDto salaryPeriod;
    private SalaryTemplateDto salaryTemplate;
    private String name; // "Lương tháng 5/2025"
    private List<SalaryResultItemDto> salaryResultItems;

    public SalaryResultDto() {
    }

    public SalaryResultDto(SalaryResult entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.salaryPeriod = new SalaryPeriodDto(entity.getSalaryPeriod());
            this.salaryTemplate = new SalaryTemplateDto(entity.getSalaryTemplate(), false);
            this.name = entity.getName();
            if (isGetFull) {
                if (entity.getSalaryResultItems() != null && !entity.getSalaryResultItems().isEmpty()) {
                    this.salaryResultItems = new ArrayList<>();
                    for (SalaryResultItem item : entity.getSalaryResultItems()) {
                        this.salaryResultItems.add(new SalaryResultItemDto(item, true));
                    }
                }
            }
        }
    }

    public SalaryPeriodDto getSalaryPeriod() {
        return salaryPeriod;
    }

    public void setSalaryPeriod(SalaryPeriodDto salaryPeriod) {
        this.salaryPeriod = salaryPeriod;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<SalaryResultItemDto> getSalaryResultItems() {
        return salaryResultItems;
    }

    public void setSalaryResultItems(List<SalaryResultItemDto> salaryResultItems) {
        this.salaryResultItems = salaryResultItems;
    }

    public SalaryTemplateDto getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplateDto salaryTemplate) {
        this.salaryTemplate = salaryTemplate;
    }
}
