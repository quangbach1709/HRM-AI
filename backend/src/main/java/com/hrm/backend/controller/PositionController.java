package com.hrm.backend.controller;

import com.hrm.backend.dto.PositionDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchPositionDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.service.PositionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/positions")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class PositionController {

    @Autowired
    private PositionService positionService;

    /**
     * API phân trang MỚI - Hỗ trợ đầy đủ filter và sort động
     * POST /api/positions/search
     */
    @PostMapping("/search")
    public ResponseEntity<PageResponse<PositionDto>> searchPositions(
            @RequestBody SearchPositionDto dto) {
        PageResponse<PositionDto> response = positionService.searchPositions(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * API phân trang CŨ - BACKWARD COMPATIBLE
     * POST /api/positions/paging
     */
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<PositionDto>> pagingPositions(
            @RequestBody SearchDto dto) {
        PageResponse<PositionDto> response = positionService.pagingPositions(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * API GET với query params
     * GET /api/positions
     */
    @GetMapping
    public ResponseEntity<PageResponse<PositionDto>> getPositions(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isMain,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        SearchPositionDto dto = new SearchPositionDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setDepartmentId(departmentId);
        dto.setCode(code);
        dto.setName(name);
        dto.setIsMain(isMain);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        return ResponseEntity.ok(positionService.searchPositions(dto));
    }

    // GET /api/positions/all - Lấy tất cả
    @GetMapping("/all")
    public ResponseEntity<List<PositionDto>> getAllPositions() {
        List<PositionDto> positions = positionService.getAllPositions();
        return ResponseEntity.ok(positions);
    }

    // GET /api/positions/department/{departmentId}
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<PositionDto>> getPositionsByDepartment(@PathVariable UUID departmentId) {
        return ResponseEntity.ok(positionService.getPositionsByDepartment(departmentId));
    }

    // GET /api/positions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PositionDto> getById(@PathVariable UUID id) {
        PositionDto position = positionService.getById(id);
        return ResponseEntity.ok(position);
    }

    // POST /api/positions
    @PostMapping
    public ResponseEntity<PositionDto> create(@Valid @RequestBody PositionDto dto) {
        PositionDto created = positionService.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/positions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PositionDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody PositionDto dto) {
        dto.setId(id);
        PositionDto updated = positionService.saveOrUpdate(dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/positions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        positionService.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa vị trí thành công");
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
