package com.hrm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryEmailMessage {
    private String recipientEmail;
    private String staffName;
    private String month; // VD: "01/2026"
    private Double totalIncome;
    private List<SalaryDetailItem> salaryDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryDetailItem {
        private String itemCode; // Mã khoản lương (để xác định loại hiển thị)
        private String itemName;
        private Double value;
    }
}
