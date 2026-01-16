package com.hrm.backend.service;

import com.hrm.backend.config.SystemConfigLoader;
import com.hrm.backend.repository.StaffWorkScheduleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Scheduled job service for attendance-related batch processing.
 * This service runs automated tasks to manage staff attendance records.
 * 
 * The cron expression is read from SystemConfig with key:
 * ATTENDANCE_ABSENT_CRON
 * Default: "0 0 0 * * ?" (midnight every day)
 */
@Service
public class AttendanceBatchJob implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AttendanceBatchJob.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * System config key for cron expression
     */
    public static final String CONFIG_KEY_ATTENDANCE_ABSENT_CRON = "ATTENDANCE_ABSENT_CRON";

    /**
     * Default cron: every day at midnight (00:00 AM)
     */
    public static final String DEFAULT_CRON = "0 0 0 * * ?";

    /**
     * Pattern to match time formats: 0h, 23h30, 12h10, 8h05, etc.
     * Also supports: 23:30, 12:10, 8:05, etc.
     */
    private static final Pattern TIME_PATTERN = Pattern.compile(
            "^(\\d{1,2})[hH:]?(\\d{2})?$");

    private final StaffWorkScheduleRepository staffWorkScheduleRepository;

    public AttendanceBatchJob(StaffWorkScheduleRepository staffWorkScheduleRepository) {
        this.staffWorkScheduleRepository = staffWorkScheduleRepository;
    }

    /**
     * Configure dynamic scheduled task with cron expression from SystemConfig.
     * The cron is read at application startup from database.
     */
    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        String cronExpression = getCronExpression();
        log.info("[AttendanceBatchJob] Registering scheduled task with cron: {}", cronExpression);

        taskRegistrar.addTriggerTask(
                this::markAbsentForLateStaff,
                triggerContext -> {
                    // Re-read cron expression each time to support dynamic updates
                    String cron = getCronExpression();
                    CronTrigger trigger = new CronTrigger(cron);
                    return trigger.nextExecution(triggerContext);
                });
    }

    /**
     * Get cron expression from SystemConfig, fallback to default if not found.
     * Supports both cron format and friendly time format (e.g., "23h30", "0h").
     * 
     * @return cron expression string
     */
    private String getCronExpression() {
        String cronFromConfig = SystemConfigLoader.getValue(CONFIG_KEY_ATTENDANCE_ABSENT_CRON);
        if (cronFromConfig != null && !cronFromConfig.trim().isEmpty()) {
            String trimmed = cronFromConfig.trim();

            // Check if it's already a cron expression (contains spaces)
            if (trimmed.contains(" ")) {
                return trimmed;
            }

            // Try to parse as friendly time format
            String converted = parseTimeToCron(trimmed);
            if (converted != null) {
                return converted;
            }

            // Fallback to original value (might be invalid cron, but let Spring handle it)
            return trimmed;
        }
        return DEFAULT_CRON;
    }

    /**
     * Parse user-friendly time format to cron expression.
     * 
     * Supported formats:
     * - "0h" or "0H" → "0 0 0 * * ?" (midnight)
     * - "23h30" → "0 30 23 * * ?" (11:30 PM)
     * - "12h10" → "0 10 12 * * ?" (12:10 PM)
     * - "8h05" → "0 5 8 * * ?" (8:05 AM)
     * - "23:30" → "0 30 23 * * ?"
     * - "8:05" → "0 5 8 * * ?"
     * 
     * @param timeInput User input like "0h", "23h30", "12:10"
     * @return Cron expression or null if parsing fails
     */
    public static String parseTimeToCron(String timeInput) {
        if (timeInput == null || timeInput.trim().isEmpty()) {
            return null;
        }

        String input = timeInput.trim().toLowerCase();
        Matcher matcher = TIME_PATTERN.matcher(input);

        if (!matcher.matches()) {
            return null;
        }

        try {
            // Extract hour
            int hour = Integer.parseInt(matcher.group(1));

            // Extract minute (default to 0 if not provided)
            int minute = 0;
            if (matcher.group(2) != null) {
                minute = Integer.parseInt(matcher.group(2));
            }

            // Validate hour and minute
            if (hour < 0 || hour > 23) {
                return null;
            }
            if (minute < 0 || minute > 59) {
                return null;
            }

            // Build cron expression: second minute hour day month dayOfWeek
            // Format: "0 {minute} {hour} * * ?"
            return String.format("0 %d %d * * ?", minute, hour);

        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Mark staff as ABSENT if they haven't checked in.
     * Since it runs at midnight (default), it marks absences for the PREVIOUS day.
     */
    @Transactional
    public void markAbsentForLateStaff() {
        LocalDateTime startTime = LocalDateTime.now();
        log.info("========================================");
        log.info("[AttendanceBatchJob] Job started at: {}", startTime.format(formatter));
        log.info("[AttendanceBatchJob] Using cron expression: {}", getCronExpression());

        // Get yesterday's date (since job typically runs at midnight, we mark absent
        // for the previous day)
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Date targetDate = Date.from(yesterday.atStartOfDay(ZoneId.systemDefault()).toInstant());

        log.info("[AttendanceBatchJob] Marking ABSENT for staff who haven't checked in on: {}", yesterday);

        try {
            int updatedCount = staffWorkScheduleRepository.markAbsentForStaffWithoutCheckIn(targetDate);
            log.info("[AttendanceBatchJob] Successfully marked {} record(s) as ABSENT", updatedCount);
        } catch (Exception e) {
            log.error("[AttendanceBatchJob] Error occurred while marking absent: {}", e.getMessage(), e);
        }

        LocalDateTime endTime = LocalDateTime.now();
        log.info("[AttendanceBatchJob] Job completed at: {}", endTime.format(formatter));
        log.info("[AttendanceBatchJob] Total execution time: {} ms",
                java.time.Duration.between(startTime, endTime).toMillis());
        log.info("========================================");
    }
}
