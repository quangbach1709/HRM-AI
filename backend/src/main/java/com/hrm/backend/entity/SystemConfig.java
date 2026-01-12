package com.hrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;


@Table(name = "tbl_system_config")
@Entity

public class SystemConfig extends BaseObject {
    private static final long serialVersionUID = 1L;

    @Column(name = "config_key")
    private String configKey;

    @Column(name = "config_value", length = 2222)
    private String configValue;

    @Column(name = "number_of_zero")
    private Integer numberOfZero;

    @Column(name = "note", length = 2222)
    private String note;// ghi chú

    @Column(name = "config_type")
    private Integer configType; // Loại cấu hình. Chi tiết: HrConstants.SystemConfigType

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
