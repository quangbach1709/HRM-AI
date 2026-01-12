package com.hrm.backend.dto;

import com.hrm.backend.entity.SystemConfig;

public class SystemConfigDto extends BaseObjectDto {
    private String configKey;
    private String configValue;
    private Integer numberOfZero;
    private String note;
    private Integer configType;

    public SystemConfigDto() {
    }

    public SystemConfigDto(SystemConfig entity) {
        super(entity);
        if (entity != null) {
            this.configKey = entity.getConfigKey();
            this.configValue = entity.getConfigValue();
            this.numberOfZero = entity.getNumberOfZero();
            this.note = entity.getNote();
            this.configType = entity.getConfigType();
        }
    }

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public Integer getNumberOfZero() {
        return numberOfZero;
    }

    public void setNumberOfZero(Integer numberOfZero) {
        this.numberOfZero = numberOfZero;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Integer getConfigType() {
        return configType;
    }

    public void setConfigType(Integer configType) {
        this.configType = configType;
    }
}
