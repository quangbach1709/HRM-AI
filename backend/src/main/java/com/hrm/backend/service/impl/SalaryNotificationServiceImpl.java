package com.hrm.backend.service.impl;

import com.hrm.backend.config.RabbitMQConfig;
import com.hrm.backend.dto.SalaryEmailMessage;
import com.hrm.backend.dto.SalaryResultItemDetailDto;
import com.hrm.backend.dto.SendSalaryEmailRequestDto;
import com.hrm.backend.dto.search.SearchSalaryResultItemDetailDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.entity.SalaryPeriod;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.repository.SalaryPeriodRepository;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.service.SalaryNotificationService;
import com.hrm.backend.service.SalaryResultItemDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class SalaryNotificationServiceImpl implements SalaryNotificationService {

    private final RabbitTemplate rabbitTemplate;
    private final SalaryResultItemDetailService salaryResultItemDetailService;
    private final StaffRepository staffRepository;
    private final SalaryPeriodRepository salaryPeriodRepository;

    @Override
    public void sendSalaryNotification(SalaryEmailMessage msg) {
        log.info("Sending salary notification to queue for: {}", msg.getRecipientEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.SALARY_EMAIL_ROUTING_KEY,
                msg);
        log.info("Salary notification queued successfully for: {}", msg.getRecipientEmail());
    }

    @Override
    public void sendSalaryEmailByRequest(SendSalaryEmailRequestDto request) {
        log.info("Processing salary email request: isAllStaff={}, staffId={}, salaryPeriodId={}",
                request.getIsAllStaff(), request.getStaffId(), request.getSalaryPeriodId());

        if (request.getSalaryPeriodId() == null) {
            log.error("SalaryPeriodId is required");
            throw new IllegalArgumentException("Kỳ lương là bắt buộc");
        }

        if (Boolean.TRUE.equals(request.getIsAllStaff())) {
            // Send email to all staff with salary data in this period
            sendEmailToAllStaff(request.getSalaryPeriodId());
        } else if (request.getStaffId() != null) {
            // Send email to single staff
            SalaryEmailMessage message = buildSalaryEmailMessage(request.getStaffId(), request.getSalaryPeriodId());
            if (message != null) {
                sendSalaryNotification(message);
            } else {
                log.warn("No salary data found for staff {} in period {}", request.getStaffId(),
                        request.getSalaryPeriodId());
            }
        } else {
            log.error("Either staffId or isAllStaff must be specified");
            throw new IllegalArgumentException("Vui lòng chọn nhân viên hoặc chọn gửi cho tất cả nhân viên");
        }
    }

    private void sendEmailToAllStaff(UUID salaryPeriodId) {
        // Get all staff with salary data in this period
        List<Staff> staffList = staffRepository.findAllByVoidedFalse();
        log.info("Sending salary email to {} staff members", staffList.size());

        for (Staff staff : staffList) {
            try {
                SalaryEmailMessage message = buildSalaryEmailMessage(staff.getId(), salaryPeriodId);
                if (message != null) {
                    sendSalaryNotification(message);
                }
            } catch (Exception e) {
                log.error("Failed to send email to staff {}: {}", staff.getId(), e.getMessage());
            }
        }
    }

    private SalaryEmailMessage buildSalaryEmailMessage(UUID staffId, UUID salaryPeriodId) {
        // Query salary details
        SearchSalaryResultItemDetailDto searchDto = new SearchSalaryResultItemDetailDto();
        searchDto.setStaffId(staffId);
        searchDto.setSalaryPeriodId(salaryPeriodId);
        searchDto.setPageSize(1000); // Get all items

        PageResponse<SalaryResultItemDetailDto> result = salaryResultItemDetailService.search(searchDto);

        if (result.getContent() == null || result.getContent().isEmpty()) {
            return null;
        }

        // Get staff info
        Staff staff = staffRepository.findById(staffId).orElse(null);
        if (staff == null || staff.getEmail() == null || staff.getEmail().isEmpty()) {
            log.warn("Staff {} not found or has no email", staffId);
            return null;
        }

        // Get salary period info
        SalaryPeriod period = salaryPeriodRepository.findById(salaryPeriodId).orElse(null);
        String monthStr = "N/A";
        if (period != null && period.getStartDate() != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("MM/yyyy");
            monthStr = sdf.format(period.getStartDate());
        }

        // Build salary details
        List<SalaryEmailMessage.SalaryDetailItem> salaryDetails = new ArrayList<>();
        Double totalIncome = null;

        // Các mã không phải tiền tệ (số ngày công, số lượng...)
        List<String> nonCurrencyCodes = List.of(
                "SO_NGAY_CONG_THUC_TE",
                "SO_NGAY_CONG_TIEU_CHUAN");

        // Mã của khoản "Tổng thu nhập" - sẽ không hiển thị trong chi tiết vì đã hiện ở
        // footer
        String totalIncomeCode = "TONG_THU_NHAP";

        for (SalaryResultItemDetailDto detail : result.getContent()) {
            String itemCode = detail.getSalaryTemplateItem() != null
                    ? detail.getSalaryTemplateItem().getCode()
                    : "";
            String itemName = detail.getSalaryTemplateItem() != null
                    ? detail.getSalaryTemplateItem().getName()
                    : "Khoản lương khác";
            Double value = detail.getValue() != null ? detail.getValue() : 0.0;

            // Nếu là mục Tổng thu nhập, lấy giá trị và không thêm vào danh sách chi tiết
            if (totalIncomeCode.equals(itemCode)) {
                totalIncome = value;
                continue; // Không thêm vào salaryDetails vì sẽ hiển thị ở footer
            }

            salaryDetails.add(new SalaryEmailMessage.SalaryDetailItem(itemCode, itemName, value));
        }

        // Nếu không tìm thấy mục TONG_THU_NHAP, tự tính toán (fallback)
        if (totalIncome == null) {
            totalIncome = 0.0;
            for (SalaryEmailMessage.SalaryDetailItem item : salaryDetails) {
                if (!nonCurrencyCodes.contains(item.getItemCode())) {
                    totalIncome += item.getValue();
                }
            }
        }

        // Build message
        SalaryEmailMessage message = new SalaryEmailMessage();
        message.setRecipientEmail(staff.getEmail());
        message.setStaffName(staff.getDisplayName());
        message.setMonth(monthStr);
        message.setTotalIncome(totalIncome);
        message.setSalaryDetails(salaryDetails);

        return message;
    }
}
