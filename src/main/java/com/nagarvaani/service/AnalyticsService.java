package com.nagarvaani.service;

import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.repository.ComplaintRepository;
import com.nagarvaani.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public AnalyticsService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getDashboardStats() {

        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put(
                "totalComplaints",
                complaintRepository.count()
        );

        stats.put(
                "reportedComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.REPORTED)
        );

        stats.put(
                "verifiedComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.VERIFIED)
        );

        stats.put(
                "assignedComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.ASSIGNED)
        );

        stats.put(
                "inProgressComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.IN_PROGRESS)
        );

        stats.put(
                "resolvedComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.RESOLVED)
        );

        stats.put(
                "closedComplaints",
                complaintRepository.countByStatus(
                        ComplaintStatus.CLOSED)
        );

        stats.put(
                "totalUsers",
                userRepository.count()
        );

        stats.put(
                "totalOfficers",
                userRepository.countByRole(
                        com.nagarvaani.enums.Role.OFFICER)
        );

        return stats;
    }
}