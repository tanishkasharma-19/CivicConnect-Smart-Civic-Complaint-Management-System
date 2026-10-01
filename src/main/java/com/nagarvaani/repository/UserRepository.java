package com.nagarvaani.repository;

import com.nagarvaani.enums.Role;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);
    long countByRole(Role role);

    // true if any user (officer) belongs to this department
    boolean existsByDepartmentId(Long departmentId);
}