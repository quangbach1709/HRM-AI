package com.hrm.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Message nhận từ AI Service qua RabbitMQ sau khi AI xác thực khuôn mặt thành công.
 * Backend Java sẽ dùng thông tin này để thực hiện check-in / check-out cho nhân viên.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AttendanceResultMessage {

    /** UUID của nhân viên (Staff.id) */
    private String staffId;

    /** Username của nhân viên (bằng person_id trong AI DB) */
    private String username;

    /** Ca làm việc: 1=Ca sáng, 2=Ca chiều, 3=Ca nguyên ngày */
    private Integer shiftWorkType;

    public AttendanceResultMessage() {}

    public AttendanceResultMessage(String staffId, String username, Integer shiftWorkType) {
        this.staffId = staffId;
        this.username = username;
        this.shiftWorkType = shiftWorkType;
    }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getShiftWorkType() { return shiftWorkType; }
    public void setShiftWorkType(Integer shiftWorkType) { this.shiftWorkType = shiftWorkType; }
}
