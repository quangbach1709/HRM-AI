package com.hrm.backend.controller;

import com.hrm.backend.dto.DepartmentDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.service.impl.DepartmentServiceImpl;
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

    private final DepartmentServiceImpl departmentService;

    @Autowired
    public  DepartmentController(DepartmentServiceImpl departmentService) {
        this.departmentService = departmentService;
    }

    // GET /api/departments - Get all departments as flat list
    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    // GET /api/departments/tree - Get departments as tree structure
    @GetMapping("/tree")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTree() {
        List<DepartmentDto> tree = departmentService.getDepartmentTree();
        return ResponseEntity.ok(tree);
    }

    // POST /api/departments/search - Search with SearchDto
    @PostMapping("/search")
    public ResponseEntity<List<DepartmentDto>> searchDepartments(@RequestBody SearchDto searchDto) {
        List<DepartmentDto> result = departmentService.searchByKeyword(searchDto);
        return ResponseEntity.ok(result);
    }

    // GET /api/departments/{id} - Get department by ID
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable UUID id) {
        DepartmentDto department = departmentService.getById(id);
        return ResponseEntity.ok(department);
    }

    // POST /api/departments - Create new department
    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        DepartmentDto created = departmentService.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/departments/{id} - Update department
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentDto dto) {
        dto.setId(id);
        DepartmentDto updated = departmentService.saveOrUpdate(dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/departments/{id} - Soft delete department
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa phòng ban thành công");
        return ResponseEntity.ok(response);
    }

    // Exception Handlers
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
