package com.nagarvaani.repository;

import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByComplaintOrderByChangedAtAsc(Complaint complaint);

}