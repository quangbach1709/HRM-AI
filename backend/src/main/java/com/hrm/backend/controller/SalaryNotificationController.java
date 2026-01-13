package com.hrm.backend.controller;

import com.hrm.backend.dto.SendSalaryEmailRequestDto;
import com.hrm.backend.service.SalaryNotificationService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/salary-notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SalaryNotificationController {

    private final SalaryNotificationService salaryNotificationService;

    /**
     * Send salary notification email
     * - If isAllStaff = true: send to all staff with salary data in the period
     * - If isAllStaff = false: send to single staff specified by staffId
     */
    @PostMapping("/send")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<String> sendSalaryEmail(@RequestBody SendSalaryEmailRequestDto request) {
        log.info("Received salary email request: {}", request);
        salaryNotificationService.sendSalaryEmailByRequest(request);
        return ResponseEntity.ok("Đã gửi yêu cầu thông báo lương thành công!");
    }
}
