package com.hrm.backend.controller;

import com.hrm.backend.dto.UserDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchUserDto;
import com.hrm.backend.service.UserService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    @PostMapping("/search")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<PageResponse<UserDto>> search(@RequestBody SearchUserDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @PostMapping("/paging")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<PageResponse<UserDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @GetMapping
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<PageResponse<UserDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UUID roleId,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        SearchUserDto dto = new SearchUserDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setUsername(username);
        dto.setEmail(email);
        dto.setRoleId(roleId);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        return ResponseEntity.ok(service.search(dto));
    }

    @GetMapping("/{id}")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<UserDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured("ROLE_ADMIN")
    public ResponseEntity<UserDto> create(@RequestBody UserDto dto) {
        UserDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured(HRConstants.ROLE_ADMIN)
    public ResponseEntity<UserDto> update(
            @PathVariable UUID id,
            @RequestBody UserDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<List<UserDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/export")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<List<UserDto>> export(@RequestBody SearchUserDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
