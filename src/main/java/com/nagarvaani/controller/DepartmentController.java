package com.nagarvaani.controller;

import com.nagarvaani.model.Department;
import com.nagarvaani.repository.ComplaintRepository;
import com.nagarvaani.repository.DepartmentRepository;
import com.nagarvaani.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// All /api/departments/** endpoints are ADMIN only (see SecurityConfig)
@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {

        return ResponseEntity.ok(
                departmentRepository.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(
            @PathVariable Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        return ResponseEntity.ok(department);
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(
            @RequestBody Department department) {

        if (department.getName() == null
                || department.getName().trim().isEmpty()) {
            throw new RuntimeException("Department name is required");
        }

        if (department.getCategoryType() == null) {
            throw new RuntimeException("Please select a category");
        }

        if (departmentRepository
                .findByCategoryType(department.getCategoryType())
                .isPresent()) {
            throw new RuntimeException(
                    "A department for " + department.getCategoryType()
                            + " already exists. Each category can have only one "
                            + "department. Please edit the existing one instead.");
        }

        // Never let the request overwrite an existing row
        department.setId(null);
        department.setName(department.getName().trim());

        return ResponseEntity.ok(
                departmentRepository.save(department)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department updatedDepartment) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        if (updatedDepartment.getName() == null
                || updatedDepartment.getName().trim().isEmpty()) {
            throw new RuntimeException("Department name is required");
        }

        // The category is fixed: complaints are matched to departments by category
        if (updatedDepartment.getCategoryType() != null
                && updatedDepartment.getCategoryType() != department.getCategoryType()) {
            throw new RuntimeException(
                    "The category of a department cannot be changed.");
        }

        department.setName(updatedDepartment.getName().trim());
        department.setDescription(updatedDepartment.getDescription());
        department.setEmail(updatedDepartment.getEmail());
        department.setPhone(updatedDepartment.getPhone());

        return ResponseEntity.ok(
                departmentRepository.save(department)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDepartment(
            @PathVariable Long id) {

        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found");
        }

        if (complaintRepository.existsByDepartmentId(id)
                || userRepository.existsByDepartmentId(id)) {
            throw new RuntimeException(
                    "This department is used by complaints or officers, so it cannot be deleted.");
        }

        departmentRepository.deleteById(id);

        return ResponseEntity.ok(
                "Department deleted successfully"
        );
    }
}