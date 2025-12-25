package com.hrm.backend.controller;

import com.hrm.backend.dto.UserRoleDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchUserRoleDto;
import com.hrm.backend.service.UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user-roles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserRoleController {

    private final UserRoleService service;

    @PostMapping("/search")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<PageResponse<UserRoleDto>> search(@RequestBody SearchUserRoleDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @PostMapping("/paging")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<PageResponse<UserRoleDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @PostMapping
    @Secured("ROLE_ADMIN")
    public ResponseEntity<UserRoleDto> create(@RequestBody SearchUserRoleDto dto) {
        // We use SearchUserRoleDto as input DTO for creation to pass userId and roleId
        UserRoleDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
