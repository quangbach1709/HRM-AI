package com.hrm.backend.service.impl;

import com.hrm.backend.dto.StaffWorkScheduleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffWorkScheduleDto;
import com.hrm.backend.entity.Staff;
import com.hrm.backend.entity.StaffWorkSchedule;
import com.hrm.backend.repository.StaffRepository;
import com.hrm.backend.repository.StaffWorkScheduleRepository;
import com.hrm.backend.service.StaffService;
import com.hrm.backend.service.StaffWorkScheduleService;
import com.hrm.backend.service.UserService;
import com.hrm.backend.specification.StaffWorkScheduleSpecification;
import com.hrm.backend.utils.HRConstants;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffWorkScheduleServiceImpl implements StaffWorkScheduleService {

    private final StaffWorkScheduleRepository repository;
    private final StaffWorkScheduleSpecification specification;
    private final StaffRepository staffRepository;
    private final StaffService staffService;

    // ==================== PAGINATION ====================

    @Override
    public PageResponse<StaffWorkScheduleDto> search(SearchStaffWorkScheduleDto dto) {
        if (dto == null) {
            dto = new SearchStaffWorkScheduleDto();
        }

        Specification<StaffWorkSchedule> spec = specification.getSpecification(dto);
        Pageable pageable = specification.getPageable(dto);

        Page<StaffWorkSchedule> page = repository.findAll(spec, pageable);
        // Using explicit mapping via DTO constructor
        Page<StaffWorkScheduleDto> dtoPage = page.map(entity -> new StaffWorkScheduleDto(entity, false));

        return PageResponse.of(dtoPage);
    }

    // ==================== GET ====================

    @Override
    public StaffWorkScheduleDto getById(UUID id) {
        return repository.findById(id)
                .map(entity -> new StaffWorkScheduleDto(entity, true))
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));
    }

    @Override
    public List<StaffWorkScheduleDto> getAll() {
        return repository.findAll().stream()
                .filter(e -> e.getVoided() == null || !e.getVoided())
                .map(entity -> new StaffWorkScheduleDto(entity, false))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public StaffWorkScheduleDto create(StaffWorkScheduleDto dto) {
        validateForCreate(dto);

        StaffWorkSchedule entity = new StaffWorkSchedule();
        mapDtoToEntity(dto, entity);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setVoided(false);

        entity = repository.save(entity);
        return new StaffWorkScheduleDto(entity, true);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public StaffWorkScheduleDto update(UUID id, StaffWorkScheduleDto dto) {
        StaffWorkSchedule entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));

        validateForUpdate(dto, entity);

        mapDtoToEntity(dto, entity);

        entity.setUpdatedAt(LocalDateTime.now());

        entity = repository.save(entity);
        return new StaffWorkScheduleDto(entity, true);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(UUID id) {
        StaffWorkSchedule entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("StaffWorkSchedule not found: " + id));

        entity.setVoided(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    // ==================== EXPORT ====================

    @Override
    public List<StaffWorkScheduleDto> exportToExcel(SearchStaffWorkScheduleDto dto) {
        if (dto == null) {
            dto = new SearchStaffWorkScheduleDto();
        }

        Specification<StaffWorkSchedule> spec = specification.getSpecification(dto);
        Sort sort = specification.getSort(dto);

        return repository.findAll(spec, sort).stream()
                .map(entity -> new StaffWorkScheduleDto(entity, false))
                .collect(Collectors.toList());
    }

    /**
     * Unified attendance method for both check-in and check-out.
     * Logic:
     * - If no StaffWorkSchedule exists for staff + today -> Create new (check-in)
     * - If exists but checkIn is null -> HR pre-created record, do check-in
     * - If exists and checkIn has value -> Do check-out
     */
    @Override
    @Transactional
    public StaffWorkScheduleDto attendance(StaffWorkScheduleDto dto) {
        if (dto.getStaffId() == null) {
            throw new IllegalArgumentException("Staff is required for attendance");
        }

        StaffWorkSchedule staffWorkSchedule = repository.findByStaffIdAndWorkingDate(
                dto.getStaffId(), new Date());

        if (staffWorkSchedule == null) {
            // Case 1: No record exists -> Create new and do check-in
            StaffWorkSchedule entity = new StaffWorkSchedule();
            mapDtoToEntity(dto, entity);
            entity.setWorkingDate(new Date());
            entity.setShiftWorkStatus(HRConstants.ShiftWorkStatus.CHECKED_IN.getValue());
            if (dto.getShiftWorkType() == null) {
                entity.setShiftWorkType(HRConstants.ShiftWorkType.FULL_DAY.getValue());
            }
            entity.setCheckIn(new Date());
            entity.setCheckOut(null);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setVoided(false);

            entity = repository.saveAndFlush(entity);
            return new StaffWorkScheduleDto(entity, true);

        } else if (staffWorkSchedule.getCheckIn() == null) {
            // Case 2: Record exists but checkIn is null -> HR pre-created, do check-in
            mapDtoToEntity(dto, staffWorkSchedule);
            staffWorkSchedule.setShiftWorkStatus(HRConstants.ShiftWorkStatus.CHECKED_IN.getValue());
            staffWorkSchedule.setCheckIn(new Date());
            staffWorkSchedule.setCheckOut(null);
            staffWorkSchedule.setUpdatedAt(LocalDateTime.now());

            staffWorkSchedule = repository.saveAndFlush(staffWorkSchedule);
            return new StaffWorkScheduleDto(staffWorkSchedule, true);

        } else {
            // Case 3: Record exists and checkIn has value -> Do check-out
            dto.setCheckIn(staffWorkSchedule.getCheckIn());
            mapDtoToEntity(dto, staffWorkSchedule);
            staffWorkSchedule.setCheckOut(new Date());

            Integer check = checkShiftWorkStatus(staffWorkSchedule.getCheckIn(), staffWorkSchedule.getCheckOut());
            staffWorkSchedule.setShiftWorkStatus(HRConstants.ShiftWorkStatus.WORKED_FULL_HOURS.getValue());
            switch (check) {
                case 1:
                    staffWorkSchedule.setShiftWorkType(HRConstants.ShiftWorkType.MORNING.getValue());
                    break;
                case 2:
                    staffWorkSchedule.setShiftWorkType(HRConstants.ShiftWorkType.AFTERNOON.getValue());
                    break;
                case 3:
                    staffWorkSchedule.setShiftWorkType(HRConstants.ShiftWorkType.FULL_DAY.getValue());
                    break;
                case 0:
                    staffWorkSchedule.setShiftWorkStatus(HRConstants.ShiftWorkStatus.INSUFFICIENT_HOURS.getValue());
                default:
                    break;
            }
            staffWorkSchedule.setUpdatedAt(LocalDateTime.now());

            staffWorkSchedule = repository.saveAndFlush(staffWorkSchedule);
            return new StaffWorkScheduleDto(staffWorkSchedule, true);
        }
    }

    // ==================== HELPERS ====================

    /**
     * Kiểm tra nhân viên làm đủ giờ ca nào
     * So sánh thời gian checkIn và checkOut với thời gian của từng ca làm việc
     *
     * @param checkIn  Thời gian vào làm
     * @param checkOut Thời gian ra về
     * @return Giá trị của ca làm việc nếu làm đủ giờ:
     *         - 1: Ca sáng (8:30 - 12:00)
     *         - 2: Ca chiều (13:30 - 17:30)
     *         - 3: Ca nguyên ngày (8:30 - 17:30)
     *         - 0: Không đủ giờ ca nào
     */
    private Integer checkShiftWorkStatus(Date checkIn, Date checkOut) {
        if (checkIn == null || checkOut == null) {
            return 0;
        }

        // Lấy thời gian giờ:phút của checkIn và checkOut để so sánh
        int checkInMinutes = getMinutesOfDay(checkIn);
        int checkOutMinutes = getMinutesOfDay(checkOut);

        // Kiểm tra ca nguyên ngày trước (ưu tiên ca lớn hơn)
        HRConstants.ShiftWorkType fullDay = HRConstants.ShiftWorkType.FULL_DAY;
        int fullDayStartMinutes = getMinutesOfDay(fullDay.getStartTime());
        int fullDayEndMinutes = getMinutesOfDay(fullDay.getEndTime());

        if (checkInMinutes <= fullDayStartMinutes && checkOutMinutes >= fullDayEndMinutes) {
            return fullDay.getValue();
        }

        // Kiểm tra ca sáng
        HRConstants.ShiftWorkType morning = HRConstants.ShiftWorkType.MORNING;
        int morningStartMinutes = getMinutesOfDay(morning.getStartTime());
        int morningEndMinutes = getMinutesOfDay(morning.getEndTime());

        if (checkInMinutes <= morningStartMinutes && checkOutMinutes >= morningEndMinutes) {
            return morning.getValue();
        }

        // Kiểm tra ca chiều
        HRConstants.ShiftWorkType afternoon = HRConstants.ShiftWorkType.AFTERNOON;
        int afternoonStartMinutes = getMinutesOfDay(afternoon.getStartTime());
        int afternoonEndMinutes = getMinutesOfDay(afternoon.getEndTime());

        if (checkInMinutes <= afternoonStartMinutes && checkOutMinutes >= afternoonEndMinutes) {
            return afternoon.getValue();
        }

        // Không đủ giờ ca nào
        return 0;
    }

    /**
     * Lấy số phút trong ngày từ Date object
     * Ví dụ: 8:30 -> 510 phút (8 * 60 + 30)
     */
    private int getMinutesOfDay(Date date) {
        if (date == null) {
            return 0;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        return calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE);
    }

    private void mapDtoToEntity(StaffWorkScheduleDto dto, StaffWorkSchedule entity) {
        if (dto.getShiftWorkType() != null) {
            entity.setShiftWorkType(dto.getShiftWorkType());
        }
        if (dto.getShiftWorkStatus() != null) {
            entity.setShiftWorkStatus(dto.getShiftWorkStatus());
        }

        // Dates
        if (dto.getWorkingDate() != null) {
            entity.setWorkingDate(dto.getWorkingDate());
        }
        if (dto.getCheckIn() != null) {
            entity.setCheckIn(dto.getCheckIn());
        }
        if (dto.getCheckOut() != null) {
            entity.setCheckOut(dto.getCheckOut());
        }
        if (dto.getLocked() != null) {
            entity.setIsLocked(dto.getLocked());
        }

        // Relations
        if (dto.getStaff() != null && dto.getStaff().getId() != null) {
            Staff staff = staffRepository.findById(dto.getStaff().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + dto.getStaff().getId()));
            entity.setStaff(staff);
        } else if (dto.getStaffId() != null) {
            Staff staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + dto.getStaffId()));
            entity.setStaff(staff);
        }

        if (dto.getCoordinator() != null && dto.getCoordinator().getId() != null) {
            Staff coordinator = staffRepository.findById(dto.getCoordinator().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Coordinator not found: " + dto.getCoordinator().getId()));
            entity.setCoordinator(coordinator);
        } else {
            Staff coordinator = staffService.getCurrentStaffEntity();
            entity.setCoordinator(coordinator);
        }
    }

    private void validateForCreate(StaffWorkScheduleDto dto) {
        if ((dto.getStaff() == null || dto.getStaff().getId() == null) && dto.getStaffId() == null) {
            throw new IllegalArgumentException("Staff is required");
            // Additional validations (e.g., locking checks) can be added here
        }
    }

    private void validateForUpdate(StaffWorkScheduleDto dto, StaffWorkSchedule existing) {
        if (existing.getIsLocked() != null && existing.getIsLocked()) {
            // If locked, restrict updates? Or allow admin Override?
            // For now, allow update but maybe warn. Or block if critical.
            // Assuming CRUD allows update unless specific rule blocks it.
        }
    }
}
