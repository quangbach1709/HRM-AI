package com.hrm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendSalaryEmailRequestDto {
    private UUID staffId; // null nếu isAllStaff = true
    private UUID salaryPeriodId; // Bắt buộc
    private Boolean isAllStaff; // true = gửi cho tất cả nhân viên
}
