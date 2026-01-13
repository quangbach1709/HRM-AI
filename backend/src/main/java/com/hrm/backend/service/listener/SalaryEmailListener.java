package com.hrm.backend.service.listener;

import com.hrm.backend.config.RabbitMQConfig;
import com.hrm.backend.dto.SalaryEmailMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.util.Locale;

@Component
@RequiredArgsConstructor
@Slf4j
public class SalaryEmailListener {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.SALARY_EMAIL_QUEUE)
    public void handleSalaryNotification(SalaryEmailMessage message) {
        log.info("Received salary notification for: {}", message.getRecipientEmail());

        try {
            // Giả lập độ trễ 2s để thấy rõ tính năng bất đồng bộ
            Thread.sleep(2000);

            sendEmail(message);
            log.info("Successfully sent salary email to: {}", message.getRecipientEmail());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Thread interrupted while processing salary notification", e);
        } catch (Exception e) {
            log.error("Failed to send salary email to: {}. Error: {}", message.getRecipientEmail(), e.getMessage(), e);
        }
    }

    private void sendEmail(SalaryEmailMessage message) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(message.getRecipientEmail());
        helper.setSubject("THÔNG BÁO LƯƠNG THÁNG " + message.getMonth());
        helper.setText(buildEmailContent(message), true);

        mailSender.send(mimeMessage);
    }

    private String buildEmailContent(SalaryEmailMessage message) {
        NumberFormat currencyFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        NumberFormat numberFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        numberFormat.setMaximumFractionDigits(2);

        // Các mã không phải tiền tệ (số ngày công, số lượng...)
        java.util.Set<String> nonCurrencyCodes = java.util.Set.of(
                "SO_NGAY_CONG_THUC_TE",
                "SO_NGAY_CONG_TIEU_CHUAN");

        StringBuilder salaryRows = new StringBuilder();
        if (message.getSalaryDetails() != null) {
            for (SalaryEmailMessage.SalaryDetailItem detail : message.getSalaryDetails()) {
                String formattedValue;
                String unit;

                if (detail.getItemCode() != null && nonCurrencyCodes.contains(detail.getItemCode())) {
                    // Hiển thị như số lượng (ngày công)
                    formattedValue = numberFormat.format(detail.getValue());
                    unit = " ngày";
                } else {
                    // Hiển thị như tiền tệ
                    formattedValue = currencyFormat.format(detail.getValue());
                    unit = " VNĐ";
                }

                salaryRows.append(String.format(
                        """
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0;">%s</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 500;">%s%s</td>
                                </tr>
                                """,
                        detail.getItemName(), formattedValue, unit));
            }
        }

        String totalIncome = currencyFormat.format(message.getTotalIncome() != null ? message.getTotalIncome() : 0);

        return String.format(
                """
                        <!DOCTYPE html>
                        <html lang="vi">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📧 THÔNG BÁO LƯƠNG</h1>
                                    <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Tháng %s</p>
                                </div>

                                <!-- Content -->
                                <div style="padding: 30px;">
                                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                        Xin chào <strong>%s</strong>,
                                    </p>
                                    <p style="font-size: 15px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
                                        Công ty trân trọng gửi đến bạn thông tin chi tiết lương tháng <strong>%s</strong> như sau:
                                    </p>

                                    <!-- Salary Table -->
                                    <table style="width: 100%%; border-collapse: collapse; margin-bottom: 25px; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
                                        <thead>
                                            <tr style="background-color: #667eea; color: white;">
                                                <th style="padding: 15px; text-align: left; font-weight: 600;">Khoản mục</th>
                                                <th style="padding: 15px; text-align: right; font-weight: 600;">Số tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            %s
                                        </tbody>
                                        <tfoot>
                                            <tr style="background-color: #28a745; color: white;">
                                                <td style="padding: 15px; font-weight: bold; font-size: 16px;">💰 TỔNG THU NHẬP</td>
                                                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">%s VNĐ</td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    <!-- Wishes -->
                                    <div style="background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); padding: 20px; border-radius: 8px; text-align: center;">
                                        <p style="color: #ffffff; margin: 0; font-size: 15px; font-weight: 500;">
                                            🎉 Chúc bạn một ngày làm việc vui vẻ và hiệu quả!
                                        </p>
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0; font-size: 13px; color: #6c757d;">
                                        Email này được gửi tự động từ hệ thống HRM.<br>
                                        Vui lòng không trả lời email này.
                                    </p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                message.getMonth(), message.getStaffName(), message.getMonth(), salaryRows.toString(), totalIncome);
    }
}
