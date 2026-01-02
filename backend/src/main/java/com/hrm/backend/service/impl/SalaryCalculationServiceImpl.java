package com.hrm.backend.service.impl;

import com.hrm.backend.dto.CalculateSalaryRequestDto;
import com.hrm.backend.dto.CalculateSalaryResponseDto;
import com.hrm.backend.dto.CalculateSalaryResponseDto.SalaryItemDetailDto;
import com.hrm.backend.entity.*;
import com.hrm.backend.repository.*;
import com.hrm.backend.service.SalaryCalculationService;
import com.hrm.backend.utils.FormulaEvaluator;
import com.hrm.backend.utils.HRConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of salary calculation service
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SalaryCalculationServiceImpl implements SalaryCalculationService {

    private final StaffRepository staffRepository;
    private final SalaryPeriodRepository salaryPeriodRepository;
    private final SalaryTemplateItemRepository salaryTemplateItemRepository;
    private final SalaryResultRepository salaryResultRepository;
    private final SalaryResultItemRepository salaryResultItemRepository;
    private final SalaryResultItemDetailRepository salaryResultItemDetailRepository;
    private final StaffWorkScheduleRepository staffWorkScheduleRepository;
    private final StaffLabourAgreementRepository staffLabourAgreementRepository;

    @Override
    public CalculateSalaryResponseDto calculate(CalculateSalaryRequestDto request) {
        // Validate request
        if (request.getStaffId() == null) {
            throw new IllegalArgumentException("Staff ID is required");
        }
        if (request.getSalaryPeriodId() == null) {
            throw new IllegalArgumentException("Salary Period ID is required");
        }

        // 1. Get Staff and validate
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + request.getStaffId()));

        // 2. Get Staff's salary template
        SalaryTemplate salaryTemplate = staff.getSalaryTemplate();
        if (salaryTemplate == null) {
            throw new IllegalArgumentException("Staff does not have a salary template assigned");
        }

        // 3. Get Salary Period
        SalaryPeriod salaryPeriod = salaryPeriodRepository.findById(request.getSalaryPeriodId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Salary Period not found: " + request.getSalaryPeriodId()));

        // 4. Get all template items ordered by displayOrder
        List<SalaryTemplateItem> templateItems = salaryTemplateItemRepository
                .findBySalaryTemplateIdOrderByDisplayOrderAsc(salaryTemplate.getId());

        if (templateItems.isEmpty()) {
            throw new IllegalArgumentException("Salary template has no items defined");
        }

        // 5. Collect all variable values
        Map<String, Double> variables = new HashMap<>();

        // Collect SYSTEM values first
        collectSystemValues(variables, staff, salaryPeriod);

        // 6. Calculate each item in order
        List<SalaryItemDetailDto> calculatedItems = new ArrayList<>();
        Double totalSalary = 0.0;

        for (SalaryTemplateItem item : templateItems) {
            Double value = calculateItemValue(item, variables);

            // Store the value with its code for use in later formulas
            if (item.getCode() != null && !item.getCode().isEmpty()) {
                variables.put(item.getCode(), value);
            }

            calculatedItems.add(new SalaryItemDetailDto(
                    item.getId(),
                    item.getCode(),
                    item.getName(),
                    item.getSalaryItemType(),
                    value,
                    item.getDisplayOrder()));

            // Consider the last item or item with specific code as total salary
            // You can customize this logic based on your requirements
            if (item.getCode() != null &&
                    (item.getCode().contains("TONG") || item.getCode().contains("TOTAL") ||
                            item.getCode().contains("THUC_LINH") || item.getCode().contains("NET"))) {
                totalSalary = value;
            }
        }

        // If no specific total found, use the last item's value
        if (totalSalary == 0.0 && !calculatedItems.isEmpty()) {
            totalSalary = calculatedItems.get(calculatedItems.size() - 1).getValue();
        }

        // 7. Save results to database
        SalaryResult salaryResult = getOrCreateSalaryResult(salaryPeriod, salaryTemplate, request.getSalaryResultId());
        SalaryResultItem salaryResultItem = getOrCreateSalaryResultItem(salaryResult, staff);

        // Save all detail items
        saveCalculatedDetails(salaryResultItem, templateItems, calculatedItems);

        // 8. Build and return response
        CalculateSalaryResponseDto response = new CalculateSalaryResponseDto();
        response.setSalaryResultId(salaryResult.getId());
        response.setSalaryResultItemId(salaryResultItem.getId());
        response.setStaffId(staff.getId());
        response.setStaffCode(staff.getStaffCode());
        response.setStaffName(staff.getDisplayName());
        response.setSalaryPeriodId(salaryPeriod.getId());
        response.setSalaryPeriodName(salaryPeriod.getName());
        response.setTotalSalary(totalSalary);
        response.setItems(calculatedItems);

        log.info("Calculated salary for staff {} in period {}: total = {}",
                staff.getStaffCode(), salaryPeriod.getName(), totalSalary);

        return response;
    }

    /**
     * Collect SYSTEM type values from various sources
     */
    private void collectSystemValues(Map<String, Double> variables, Staff staff, SalaryPeriod salaryPeriod) {
        // 1. Get standard working days from salary period
        Double standardWorkingDays = salaryPeriod.getEstimatedWorkingDays();
        if (standardWorkingDays == null) {
            standardWorkingDays = 22.0; // Default to 22 days
        }
        variables.put(HRConstants.SalaryTemplateItemSystem.STANDARD_NUMBER_OF_WORKING_DAYS.getCode(),
                standardWorkingDays);

        // 2. Get actual working days from work schedule
        Double actualWorkingDays = staffWorkScheduleRepository.calculateActualWorkingDays(
                staff.getId(),
                salaryPeriod.getStartDate(),
                salaryPeriod.getEndDate());
        if (actualWorkingDays == null) {
            actualWorkingDays = 0.0;
        }
        variables.put(HRConstants.SalaryTemplateItemSystem.ACTUAL_NUMBER_OF_WORKING_DAYS.getCode(), actualWorkingDays);

        // 3. Get basic salary from labour agreement
        Double basicSalary = 0.0;
        Optional<StaffLabourAgreement> agreementOpt = staffLabourAgreementRepository
                .findFirstByStaffIdAndAgreementStatusAndVoidedFalseOrderByStartDateDesc(
                        staff.getId(),
                        HRConstants.StaffLabourAgreementStatus.SIGNED.getValue());

        if (agreementOpt.isPresent() && agreementOpt.get().getSalary() != null) {
            basicSalary = agreementOpt.get().getSalary();
        }
        variables.put(HRConstants.SalaryTemplateItemSystem.BASIC_SALARY.getCode(), basicSalary);

        log.debug("System values collected: standardDays={}, actualDays={}, basicSalary={}",
                standardWorkingDays, actualWorkingDays, basicSalary);
    }

    /**
     * Calculate value for a single salary template item
     */
    private Double calculateItemValue(SalaryTemplateItem item, Map<String, Double> variables) {
        Integer itemType = item.getSalaryItemType();

        if (itemType == null) {
            return 0.0;
        }

        // Type 1: VALUE - Use default amount
        if (itemType.equals(HRConstants.SalaryItemType.VALUE.getValue())) {
            return item.getDefaultAmount() != null ? item.getDefaultAmount() : 0.0;
        }

        // Type 2: FORMULA - Evaluate the formula
        if (itemType.equals(HRConstants.SalaryItemType.FORMULA.getValue())) {
            if (item.getFormula() == null || item.getFormula().trim().isEmpty()) {
                return 0.0;
            }
            try {
                return FormulaEvaluator.evaluate(item.getFormula(), variables);
            } catch (Exception e) {
                log.error("Failed to evaluate formula '{}' for item '{}': {}",
                        item.getFormula(), item.getCode(), e.getMessage());
                return 0.0;
            }
        }

        // Type 3: SYSTEM - Get from pre-collected values
        if (itemType.equals(HRConstants.SalaryItemType.SYSTEM.getValue())) {
            if (item.getCode() != null && variables.containsKey(item.getCode())) {
                return variables.get(item.getCode());
            }
            return 0.0;
        }

        return 0.0;
    }

    /**
     * Get existing or create new SalaryResult
     */
    private SalaryResult getOrCreateSalaryResult(SalaryPeriod salaryPeriod, SalaryTemplate salaryTemplate,
            UUID existingResultId) {
        if (existingResultId != null) {
            return salaryResultRepository.findById(existingResultId)
                    .orElseThrow(() -> new EntityNotFoundException("SalaryResult not found: " + existingResultId));
        }

        // Check if result already exists for this period and template
        // For now, create a new one
        SalaryResult salaryResult = new SalaryResult();
        salaryResult.setSalaryPeriod(salaryPeriod);
        salaryResult.setSalaryTemplate(salaryTemplate);
        salaryResult.setName("Bảng lương " + salaryPeriod.getName());
        salaryResult.setCreatedAt(LocalDateTime.now());
        salaryResult.setVoided(false);

        return salaryResultRepository.save(salaryResult);
    }

    /**
     * Get existing or create new SalaryResultItem for a staff
     */
    private SalaryResultItem getOrCreateSalaryResultItem(SalaryResult salaryResult, Staff staff) {
        // Check if item already exists
        Optional<SalaryResultItem> existingItem = salaryResultItemRepository
                .findBySalaryResultIdAndStaffId(salaryResult.getId(), staff.getId());

        if (existingItem.isPresent()) {
            return existingItem.get();
        }

        SalaryResultItem item = new SalaryResultItem();
        item.setSalaryResult(salaryResult);
        item.setStaff(staff);
        item.setCreatedAt(LocalDateTime.now());
        item.setVoided(false);

        return salaryResultItemRepository.save(item);
    }

    /**
     * Save calculated details for each template item
     */
    private void saveCalculatedDetails(SalaryResultItem salaryResultItem,
            List<SalaryTemplateItem> templateItems,
            List<SalaryItemDetailDto> calculatedItems) {
        // Create a map for quick lookup
        Map<UUID, Double> valueMap = calculatedItems.stream()
                .collect(Collectors.toMap(
                        SalaryItemDetailDto::getSalaryTemplateItemId,
                        SalaryItemDetailDto::getValue));

        for (SalaryTemplateItem templateItem : templateItems) {
            Double value = valueMap.get(templateItem.getId());
            if (value == null) {
                value = 0.0;
            }

            // Check if detail already exists
            Optional<SalaryResultItemDetail> existingDetail = salaryResultItemDetailRepository
                    .findBySalaryResultItemIdAndSalaryTemplateItemId(
                            salaryResultItem.getId(), templateItem.getId());

            SalaryResultItemDetail detail;
            if (existingDetail.isPresent()) {
                detail = existingDetail.get();
                detail.setValue(value);
                detail.setUpdatedAt(LocalDateTime.now());
            } else {
                detail = new SalaryResultItemDetail();
                detail.setSalaryResultItem(salaryResultItem);
                detail.setSalaryTemplateItem(templateItem);
                detail.setValue(value);
                detail.setCreatedAt(LocalDateTime.now());
                detail.setVoided(false);
            }

            salaryResultItemDetailRepository.save(detail);
        }
    }
}
