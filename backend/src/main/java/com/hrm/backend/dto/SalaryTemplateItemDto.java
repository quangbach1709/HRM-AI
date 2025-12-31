package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.entity.SalaryTemplateItem;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.util.StringUtils;

@Valid
public class SalaryTemplateItemDto extends AuditableDto {
    private String code;
    private String name;
    @NotNull(message = "Thứ tự hiển thị không được để trống")
    @Min(value = 1, message = "Thứ tự hiển thị phải lớn hơn 0")
    private Integer displayOrder; // Thứ tự hiển thị
    private SalaryTemplateDto salaryTemplate; // thuộc mẫu bang luong nao
    private Integer salaryItemType; // DatnConstants.SalaryItemType
    private Double defaultAmount;
    private String formula; // nếu type là USING_FORMULA thì lưu công thức

    public SalaryTemplateItemDto() {
    }

    public SalaryTemplateItemDto(SalaryTemplateItem entity, Boolean isGetSalaryTemplate) {
        super(entity);
        if (entity != null) {
            this.code = entity.getCode();
            this.name = entity.getName();
            this.displayOrder = entity.getDisplayOrder();
            this.defaultAmount = entity.getDefaultAmount();
            this.salaryItemType = entity.getSalaryItemType();
            this.formula = entity.getFormula();

            if (isGetSalaryTemplate) {
                if (entity.getSalaryTemplate() != null) {
                    this.salaryTemplate = new SalaryTemplateDto(entity.getSalaryTemplate(), false);
                }
            }

        }
    }


    public static SalaryTemplateItem toEntity(SalaryTemplateItemDto dto){
        SalaryTemplateItem entity = new SalaryTemplateItem();
        if(dto.getId() != null){
            entity.setId(dto.getId());
        }
        if (StringUtils.hasText(dto.getCode()))
            entity.setCode(dto.getCode().trim());
        if (StringUtils.hasText(dto.getName()))
            entity.setName(dto.getName().trim());
        if (dto.getDisplayOrder() != null)
            entity.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getSalaryItemType() != null)
            entity.setSalaryItemType(dto.getSalaryItemType());
        if (dto.getDefaultAmount() != null)
            entity.setDefaultAmount(dto.getDefaultAmount());
        if (dto.getFormula() != null)
            entity.setFormula(dto.getFormula());

        if (dto.getSalaryTemplate() != null && dto.getSalaryTemplate().getId() != null) {
            entity.setSalaryTemplate(SalaryTemplateDto.toEntity(dto.getSalaryTemplate()));
        }
        return entity;
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public SalaryTemplateDto getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplateDto salaryTemplate) {
        this.salaryTemplate = salaryTemplate;
    }

    public Integer getSalaryItemType() {
        return salaryItemType;
    }

    public void setSalaryItemType(Integer salaryItemType) {
        this.salaryItemType = salaryItemType;
    }

    public Double getDefaultAmount() {
        return defaultAmount;
    }

    public void setDefaultAmount(Double defaultAmount) {
        this.defaultAmount = defaultAmount;
    }

    public String getFormula() {
        return formula;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }
}
