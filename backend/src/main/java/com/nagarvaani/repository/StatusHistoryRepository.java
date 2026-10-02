package com.nagarvaani.repository;

import com.nagarvaani.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusHistoryRepository
        extends JpaRepository<StatusHistory, Long> {
}