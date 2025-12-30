package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryTemplate;
import com.hrm.backend.entity.SalaryTemplateItem;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class SalaryTemplateDto extends BaseObjectDto {
    private List<SalaryTemplateItemDto> templateItems; // thành phần lương chính là các cột trong mẫu bảng lương

    public SalaryTemplateDto() {
    }

    public SalaryTemplateDto(SalaryTemplate entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            if (isGetFull) {
                if (entity.getTemplateItems() != null && !entity.getTemplateItems().isEmpty()) {
                    this.templateItems = new ArrayList<>();
                    for (SalaryTemplateItem item : entity.getTemplateItems()) {
                        this.templateItems.add(new SalaryTemplateItemDto(item, false));
                    }
                }
            }
        }
    }

    public static SalaryTemplate toEntity(SalaryTemplateDto dto){
        SalaryTemplate entity = new SalaryTemplate();
        if(dto.getId() != null){
            entity.setId(dto.getId());
        }
        if (StringUtils.hasText(dto.getCode())) {
            entity.setCode(dto.getCode().trim());
        }
        if (StringUtils.hasText(dto.getName())) {
            entity.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        return entity;
    }

    public List<SalaryTemplateItemDto> getTemplateItems() {
        return templateItems;
    }

    public void setTemplateItems(List<SalaryTemplateItemDto> templateItems) {
        this.templateItems = templateItems;
    }
}
