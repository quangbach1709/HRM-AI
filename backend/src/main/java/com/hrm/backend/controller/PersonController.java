package com.hrm.backend.controller;

import com.hrm.backend.dto.PersonDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchPersonDto;
import com.hrm.backend.service.PersonService;
import com.hrm.backend.utils.HRConstants;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonController {

    private final PersonService service;

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<PersonDto>> search(@RequestBody SearchPersonDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<PersonDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping
    public ResponseEntity<PageResponse<PersonDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            // Filter fields
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String idNumber,
            @RequestParam(required = false) String taxCode,
            @RequestParam(required = false) Integer gender,
            @RequestParam(required = false) Integer maritalStatus,
            @RequestParam(required = false) Integer educationLevel) {
        SearchPersonDto dto = new SearchPersonDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setEmail(email);
        dto.setPhoneNumber(phoneNumber);
        dto.setIdNumber(idNumber);
        dto.setTaxCode(taxCode);
        dto.setGender(gender);
        dto.setMaritalStatus(maritalStatus);
        dto.setEducationLevel(educationLevel);

        return ResponseEntity.ok(service.search(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<PersonDto> create(@RequestBody PersonDto dto) {
        PersonDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<PersonDto> update(@PathVariable UUID id, @RequestBody PersonDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADDITIONAL ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/all")
    public ResponseEntity<List<PersonDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/export")
    public ResponseEntity<List<PersonDto>> export(@RequestBody SearchPersonDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
