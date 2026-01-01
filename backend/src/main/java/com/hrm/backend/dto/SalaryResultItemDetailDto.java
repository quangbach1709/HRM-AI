package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryResultItemDetail;

public class SalaryResultItemDetailDto extends AuditableDto {
    private SalaryResultItemDto salaryResultItem;
    private SalaryTemplateItemDto salaryTemplateItem;
    private Double value; // Giá trị của khoản lương này

    public SalaryResultItemDetailDto() {
    }

    public SalaryResultItemDetailDto(SalaryResultItemDetail entity, Boolean isGetSalaryResultItem, Boolean isGetSalaryTemplateItem) {
        super(entity);
        if (entity != null) {
            if (isGetSalaryResultItem) {
                this.salaryResultItem = new SalaryResultItemDto(entity.getSalaryResultItem(), false);
            }
            if (isGetSalaryTemplateItem) {
                this.salaryTemplateItem = new SalaryTemplateItemDto(entity.getSalaryTemplateItem(), false);
            }
            this.value = entity.getValue();
        }
    }

    public static SalaryResultItemDetail toEntity(SalaryResultItemDetailDto dto) {
        if (dto == null) {
            return null;
        }
        SalaryResultItemDetail entity = new SalaryResultItemDetail();
        entity.setId(dto.getId());
        entity.setSalaryResultItem(SalaryResultItemDto.toEntity(dto.getSalaryResultItem()));
        entity.setSalaryTemplateItem(SalaryTemplateItemDto.toEntity(dto.getSalaryTemplateItem()));
        entity.setValue(dto.getValue());
        return entity;
    }

    public SalaryResultItemDto getSalaryResultItem() {
        return salaryResultItem;
    }

    public void setSalaryResultItem(SalaryResultItemDto salaryResultItem) {
        this.salaryResultItem = salaryResultItem;
    }

    public SalaryTemplateItemDto getSalaryTemplateItem() {
        return salaryTemplateItem;
    }

    public void setSalaryTemplateItem(SalaryTemplateItemDto salaryTemplateItem) {
        this.salaryTemplateItem = salaryTemplateItem;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }
}
