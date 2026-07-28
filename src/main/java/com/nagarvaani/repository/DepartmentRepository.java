package com.nagarvaani.repository;

import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCategoryType(ComplaintCategory categoryType);

}