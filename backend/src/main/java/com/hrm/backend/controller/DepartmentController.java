package com.hrm.backend.controller;

import com.hrm.backend.dto.DepartmentDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDepartmentDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.service.DepartmentService;
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
@RequestMapping("/api/departments")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    /**
     * API phân trang MỚI - Hỗ trợ đầy đủ filter và sort động
     * POST /api/departments/search
     */
    @PostMapping("/search")
    public ResponseEntity<PageResponse<DepartmentDto>> searchDepartments(
            @RequestBody SearchDepartmentDto dto) {
        PageResponse<DepartmentDto> response = departmentService.searchDepartments(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * API phân trang CŨ - BACKWARD COMPATIBLE
     * POST /api/departments/paging
     */
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<DepartmentDto>> pagingDepartments(
            @RequestBody SearchDto dto) {
        PageResponse<DepartmentDto> response = departmentService.pagingDepartments(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * API GET với query params - cho filter đơn giản
     * GET
     * /api/departments?pageIndex=0&pageSize=10&keyword=abc&sortBy=name&sortDirection=ASC
     */
    @GetMapping
    public ResponseEntity<PageResponse<DepartmentDto>> getDepartments(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID parentId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        SearchDepartmentDto dto = new SearchDepartmentDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setParentId(parentId);
        dto.setCode(code);
        dto.setName(name);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        return ResponseEntity.ok(departmentService.searchDepartments(dto));
    }

    // GET /api/departments/all - Lấy tất cả (cho dropdown, select)
    @GetMapping("/all")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    // GET /api/departments/tree - Lấy dạng cây
    @GetMapping("/tree")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTree() {
        List<DepartmentDto> tree = departmentService.getDepartmentTree();
        return ResponseEntity.ok(tree);
    }

    // GET /api/departments/{id} - Lấy theo ID
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable UUID id) {
        DepartmentDto department = departmentService.getById(id);
        return ResponseEntity.ok(department);
    }

    // POST /api/departments - Thêm mới
    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        DepartmentDto created = departmentService.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/departments/{id} - Cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentDto dto) {
        dto.setId(id);
        DepartmentDto updated = departmentService.saveOrUpdate(dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/departments/{id} - Xóa (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa phòng ban thành công");
        return ResponseEntity.ok(response);
    }

    // ===== EXCEPTION HANDLERS =====

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
