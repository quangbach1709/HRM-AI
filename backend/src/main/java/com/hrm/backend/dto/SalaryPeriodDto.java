package com.hrm.backend.dto;


import com.hrm.backend.entity.SalaryPeriod;
import jakarta.validation.Valid;
import org.springframework.util.StringUtils;

import java.util.Date;

@Valid
public class SalaryPeriodDto extends BaseObjectDto {
    private Date startDate;
    private Date endDate;
    private Integer salaryPeriodStatus;//Xem status: DatnConstants.SalaryPeriodStatus
    private Double estimatedWorkingDays; // Số ngày làm việc ước tính

    public SalaryPeriodDto() {
    }

    public SalaryPeriodDto(SalaryPeriod entity) {
        super(entity);
        if (entity != null) {
            this.startDate = entity.getStartDate();
            this.endDate = entity.getEndDate();
            this.salaryPeriodStatus = entity.getSalaryPeriodStatus();
            this.estimatedWorkingDays = entity.getEstimatedWorkingDays();
        }
    }

    public static SalaryPeriod toEntity(SalaryPeriodDto dto) {
        SalaryPeriod entity = new SalaryPeriod();
        if (dto != null) {
            if (dto.getId() != null)
                entity.setId(dto.getId());
            if (StringUtils.hasText(dto.getCode()))
                entity.setCode(dto.getCode().trim());
            if (StringUtils.hasText(dto.getName()))
                entity.setName(dto.getName().trim());
            if (dto.getDescription() != null)
                entity.setDescription(dto.getDescription());

            if (dto.getStartDate() != null)
                entity.setStartDate(dto.getStartDate());
            if (dto.getEndDate() != null)
                entity.setEndDate(dto.getEndDate());
            if (dto.getSalaryPeriodStatus() != null)
                entity.setSalaryPeriodStatus(dto.getSalaryPeriodStatus());
            if (dto.getEstimatedWorkingDays() != null)
                entity.setEstimatedWorkingDays(dto.getEstimatedWorkingDays());
        }
        return entity;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Integer getSalaryPeriodStatus() {
        return salaryPeriodStatus;
    }

    public void setSalaryPeriodStatus(Integer salaryPeriodStatus) {
        this.salaryPeriodStatus = salaryPeriodStatus;
    }

    public Double getEstimatedWorkingDays() {
        return estimatedWorkingDays;
    }

    public void setEstimatedWorkingDays(Double estimatedWorkingDays) {
        this.estimatedWorkingDays = estimatedWorkingDays;
    }
}
