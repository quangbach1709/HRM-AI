package com.hrm.backend.entity;

import jakarta.persistence.*;

@Table(name = "tbl_salary_template_item")
@Entity
public class SalaryTemplateItem extends AuditableEntity {
    @Column(name = "code")
    private String code;
    @Column(name = "name")
    private String name;
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder; // Thứ tự hiển thị

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_template_id", nullable = false)
    private SalaryTemplate salaryTemplate; // thuộc mẫu bang luong nao

    @Column(name = "salary_item_type")
    private Integer salaryItemType; // DatnConstants.SalaryItemType

    @Column(name = "default_amount")
    private Double defaultAmount;

    @Column(name = "formula", columnDefinition = "TEXT")
    private String formula; // nếu type là USING_FORMULA thì lưu công thức

    public SalaryTemplateItem() {
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

    public SalaryTemplate getSalaryTemplate() {
        return salaryTemplate;
    }

    public void setSalaryTemplate(SalaryTemplate salaryTemplate) {
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
