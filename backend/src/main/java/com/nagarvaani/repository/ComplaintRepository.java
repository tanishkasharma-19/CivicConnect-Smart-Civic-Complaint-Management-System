package com.nagarvaani.repository;

import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    long countByStatus(ComplaintStatus status);

    // true if any complaint uses this department
    boolean existsByDepartmentId(Long departmentId);
    List<Complaint> findByReportedBy(User user);

    List<Complaint> findByAssignedTo(User user);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByCategory(ComplaintCategory category);


    List<Complaint> findByDeadlineBeforeAndStatusNot(
            LocalDateTime deadline,
            ComplaintStatus status);
    List<Complaint> findByStatusNot(ComplaintStatus status);
    @Query(value = """
            SELECT *
            FROM complaints c
            WHERE c.latitude BETWEEN :minLat AND :maxLat
              AND c.longitude BETWEEN :minLng AND :maxLng
              AND c.category = :category
            """, nativeQuery = true)
    List<Complaint> findNearbyComplaints(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng,
            @Param("category") String category
    );

}