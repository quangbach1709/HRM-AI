package com.hrm.backend.service.listener;

import com.hrm.backend.config.RabbitMQConfig;
import com.hrm.backend.dto.AttendanceResultMessage;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.entity.StaffWorkSchedule;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.repository.StaffWorkScheduleRepository;
import com.hrm.backend.service.DashboardStatService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

/**
 * Listener nhận message từ AI Service qua RabbitMQ sau khi AI xác thực khuôn mặt thành công.
 * Thực hiện check-in / check-out cho nhân viên dựa trên staffId và shiftWorkType.
 * Logic status được giữ nguyên từ StaffWorkScheduleServiceImpl.attendance().
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceResultListener {

    private final StaffWorkScheduleRepository scheduleRepository;
    private final StaffRepository staffRepository;
    private final DashboardStatService dashboardStatService;

    @RabbitListener(queues = RabbitMQConfig.ATTENDANCE_RESULT_QUEUE)
    @Transactional
    public void handleAttendanceResult(AttendanceResultMessage message) {
        log.info("Nhận kết quả chấm công từ AI Service: staffId={}, username={}, shiftWorkType={}",
                message.getStaffId(), message.getUsername(), message.getShiftWorkType());

        try {
            // 1. Resolve Staff entity
            if (message.getStaffId() == null) {
                log.error("Thiếu staffId trong message chấm công cho username={}", message.getUsername());
                return;
            }

            UUID staffId;
            try {
                staffId = UUID.fromString(message.getStaffId());
            } catch (IllegalArgumentException e) {
                log.error("staffId không hợp lệ: {}", message.getStaffId());
                return;
            }

            Staff staff = staffRepository.findById(staffId).orElse(null);
            if (staff == null) {
                log.error("Không tìm thấy Staff với id={}", staffId);
                return;
            }

            Integer shiftWorkType = message.getShiftWorkType();

            // 2. Tìm bản ghi chấm công hôm nay
            StaffWorkSchedule existing = scheduleRepository.findByStaffIdAndWorkingDate(staffId, new Date());

            if (existing == null) {
                // Case 1: Chưa có bản ghi -> Tạo mới, check-in
                StaffWorkSchedule entity = new StaffWorkSchedule();
                entity.setStaff(staff);
                entity.setCoordinator(null); // Không có security context trong async listener
                entity.setWorkingDate(new Date());
                entity.setShiftWorkStatus(HRConstants.ShiftWorkStatus.CHECKED_IN.getValue());
                entity.setShiftWorkType(shiftWorkType != null ? shiftWorkType : HRConstants.ShiftWorkType.FULL_DAY.getValue());
                entity.setCheckIn(new Date());
                entity.setCheckOut(null);
                entity.setCreatedAt(LocalDateTime.now());
                entity.setVoided(false);

                scheduleRepository.saveAndFlush(entity);
                log.info("Check-in mới cho staffId={} lúc {}", staffId, new Date());

            } else if (existing.getCheckIn() == null && existing.getCheckOut() == null) {
                // Case 2: HR đã tạo trước, checkIn null -> check-in
                existing.setShiftWorkStatus(HRConstants.ShiftWorkStatus.CHECKED_IN.getValue());
                existing.setCheckIn(new Date());
                existing.setCheckOut(null);
                if (shiftWorkType != null) {
                    existing.setShiftWorkType(shiftWorkType);
                }
                existing.setUpdatedAt(LocalDateTime.now());

                scheduleRepository.saveAndFlush(existing);
                log.info("Check-in (bản ghi HR tạo sẵn) cho staffId={} lúc {}", staffId, new Date());

            } else if (existing.getCheckOut() == null && existing.getCheckIn() != null) {
                // Case 3: Đã check-in, checkOut null -> check-out
                existing.setCheckOut(new Date());

                Integer shiftCheck = checkShiftWorkStatus(existing.getCheckIn(), existing.getCheckOut());
                existing.setShiftWorkStatus(HRConstants.ShiftWorkStatus.WORKED_FULL_HOURS.getValue());
                switch (shiftCheck) {
                    case 1:
                        existing.setShiftWorkType(HRConstants.ShiftWorkType.MORNING.getValue());
                        break;
                    case 2:
                        existing.setShiftWorkType(HRConstants.ShiftWorkType.AFTERNOON.getValue());
                        break;
                    case 3:
                        existing.setShiftWorkType(HRConstants.ShiftWorkType.FULL_DAY.getValue());
                        break;
                    case 0:
                        existing.setShiftWorkStatus(HRConstants.ShiftWorkStatus.INSUFFICIENT_HOURS.getValue());
                        break;
                    default:
                        break;
                }
                existing.setUpdatedAt(LocalDateTime.now());

                existing = scheduleRepository.saveAndFlush(existing);
                log.info("Check-out cho staffId={} lúc {}, status={}", staffId, new Date(), existing.getShiftWorkStatus());

                if (Objects.equals(existing.getShiftWorkStatus(), HRConstants.ShiftWorkStatus.WORKED_FULL_HOURS.getValue())) {
                    dashboardStatService.incrementCompletedAttendance(
                            dashboardStatService.generateMonthKey(LocalDateTime.now())
                    );
                }

            } else if (existing.getCheckIn() != null && existing.getCheckOut() != null) {
                // Đã chấm công đủ cả vào lẫn ra trong ngày
                log.warn("Nhân viên staffId={} đã chấm công đầy đủ trong ngày hôm nay, bỏ qua message.", staffId);
            }

        } catch (Exception e) {
            log.error("Lỗi khi xử lý message chấm công cho staffId={}: {}",
                    message.getStaffId(), e.getMessage(), e);
            // Không throw lại để tránh requeue loop vô hạn — log để xử lý thủ công nếu cần
        }
    }

    /**
     * Kiểm tra nhân viên làm đủ giờ ca nào.
     * Giữ nguyên logic từ StaffWorkScheduleServiceImpl.checkShiftWorkStatus().
     *
     * @return 1=Ca sáng, 2=Ca chiều, 3=Ca nguyên ngày, 0=Không đủ giờ
     */
    private Integer checkShiftWorkStatus(Date checkIn, Date checkOut) {
        if (checkIn == null || checkOut == null) {
            return 0;
        }

        int checkInMinutes = getMinutesOfDay(checkIn);
        int checkOutMinutes = getMinutesOfDay(checkOut);

        // Kiểm tra ca nguyên ngày trước (ưu tiên ca lớn hơn)
        HRConstants.ShiftWorkType fullDay = HRConstants.ShiftWorkType.FULL_DAY;
        if (checkInMinutes <= getMinutesOfDay(fullDay.getStartTime())
                && checkOutMinutes >= getMinutesOfDay(fullDay.getEndTime())) {
            return fullDay.getValue();
        }

        // Kiểm tra ca sáng
        HRConstants.ShiftWorkType morning = HRConstants.ShiftWorkType.MORNING;
        if (checkInMinutes <= getMinutesOfDay(morning.getStartTime())
                && checkOutMinutes >= getMinutesOfDay(morning.getEndTime())) {
            return morning.getValue();
        }

        // Kiểm tra ca chiều
        HRConstants.ShiftWorkType afternoon = HRConstants.ShiftWorkType.AFTERNOON;
        if (checkInMinutes <= getMinutesOfDay(afternoon.getStartTime())
                && checkOutMinutes >= getMinutesOfDay(afternoon.getEndTime())) {
            return afternoon.getValue();
        }

        return 0;
    }

    private int getMinutesOfDay(Date date) {
        if (date == null) return 0;
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);
    }
}
