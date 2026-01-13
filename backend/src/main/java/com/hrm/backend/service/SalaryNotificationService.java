package com.hrm.backend.service;

import com.hrm.backend.dto.SalaryEmailMessage;
import com.hrm.backend.dto.SendSalaryEmailRequestDto;
import com.hrm.backend.entity.SalaryPeriod;

import java.util.List;
import java.util.UUID;

public interface SalaryNotificationService {
    void sendSalaryNotification(SalaryEmailMessage msg);

    /**
     * Send salary email notification based on request (single staff or all staff)
     */
    void sendSalaryEmailByRequest(SendSalaryEmailRequestDto request);
}
