package com.nagarvaani.service;

import com.nagarvaani.dto.DuplicateComplaintResponse;
import com.nagarvaani.dto.request.AssignOfficerRequest;
import com.nagarvaani.dto.request.CreateComplaintRequest;
import com.nagarvaani.dto.request.UpdateComplaintRequest;
import com.nagarvaani.dto.request.VerifyComplaintRequest;
import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.dto.response.DuplicateCheckResponse;
import com.nagarvaani.dto.response.NearbyComplaintResponse;
import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.*;
import com.nagarvaani.repository.*;
import com.nagarvaani.util.ComplaintWorkflow;
import com.nagarvaani.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final FileUploadService fileUploadService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UpvoteRepository upvoteRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    public ComplaintResponse createComplaint(
            CreateComplaintRequest request,
            String email) {

        String imageUrl = null;

        if (request.getBeforePhoto() != null &&
                !request.getBeforePhoto().isEmpty()) {

            imageUrl =
                    fileUploadService.uploadFile(
                            request.getBeforePhoto());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Department department =
                departmentRepository
                        .findByCategoryType(request.getCategory())
                        .orElseThrow(() ->
                                new RuntimeException("Department not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(ComplaintStatus.REPORTED)
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .department(department)
                .reportedBy(user)
                .beforePhotoUrl(imageUrl)
                .build();

        complaintRepository.save(complaint);

        complaint.setPriorityScore(0);
        complaintRepository.save(complaint);

        notificationService.notifyNewComplaint(complaint);

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(complaint.getStatus().name())
                .department(department.getName())
                .message("Complaint submitted successfully")
                .build();
    }

    public DuplicateCheckResponse checkDuplicate(
            Double latitude,
            Double longitude) {

        List<Complaint> complaints =
                complaintRepository.findByStatusNot(
                        ComplaintStatus.CLOSED);

        List<NearbyComplaintResponse> nearby =
                new ArrayList<>();

        for (Complaint complaint : complaints) {

            if (complaint.getLatitude() == null ||
                    complaint.getLongitude() == null) {
                continue;
            }

            double distance = GeoUtil.distance(
                    latitude,
                    longitude,
                    complaint.getLatitude(),
                    complaint.getLongitude());

            if (distance <= 100) {

                nearby.add(
                        NearbyComplaintResponse.builder()
                                .complaintId(complaint.getId())
                                .title(complaint.getTitle())
                                .status(complaint.getStatus().name())
                                .address(complaint.getAddress())
                                .distanceInMeters(distance)
                                .build());
            }
        }

        return DuplicateCheckResponse.builder()
                .duplicateFound(!nearby.isEmpty())
                .nearbyComplaints(nearby)
                .build();
    }

    public String upvoteComplaint(
            Long complaintId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException("Complaint not found"));

        if (upvoteRepository.existsByUserAndComplaint(
                user,
                complaint)) {

            throw new RuntimeException(
                    "You have already upvoted this complaint");
        }

        Upvote upvote = Upvote.builder()
                .user(user)
                .complaint(complaint)
                .build();

        upvoteRepository.save(upvote);

        complaint.setUpvoteCount(
                (int) upvoteRepository.countByComplaint(
                        complaint));
        calculatePriorityScore(complaint);

        complaintRepository.save(complaint);

        return "Complaint upvoted successfully";
    }
    public List<ComplaintResponse> getAllComplaints() {

        List<Complaint> complaints = complaintRepository.findAll();

        return complaints.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ComplaintResponse getComplaintById(Long id) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        return mapToResponse(complaint);
    }

    public List<ComplaintResponse> getMyComplaints(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return complaintRepository.findByReportedBy(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ComplaintResponse> getComplaintsByStatus(
            ComplaintStatus status) {

        return complaintRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ComplaintResponse> getComplaintsByCategory(
            ComplaintCategory category) {

        return complaintRepository.findByCategory(category)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ComplaintResponse mapToResponse(
            Complaint complaint) {

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory().name())
                .status(complaint.getStatus().name())
                .address(complaint.getAddress())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .beforePhotoUrl(complaint.getBeforePhotoUrl())
                .resolutionNotes(complaint.getResolutionNotes())
                .afterPhotoUrl(complaint.getAfterPhotoUrl())
                .upvoteCount(complaint.getUpvoteCount())
                .priorityScore(computePriorityScore(complaint))
                .department(
                        complaint.getDepartment() != null
                                ? complaint.getDepartment().getName()
                                : null)
                .message(null)
                .build();
    }
    // An officer may only work on complaints assigned to them
    private void checkOfficerOwnsComplaint(User changedBy, Complaint complaint) {

        if (changedBy.getRole() == Role.OFFICER
                && (complaint.getAssignedTo() == null
                || !complaint.getAssignedTo().getId().equals(changedBy.getId()))) {

            throw new RuntimeException(
                    "This complaint is not assigned to you");
        }
    }

    public ComplaintResponse updateStatus(
            Long complaintId,
            ComplaintStatus newStatus,
            String changedByEmail) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        User changedBy = userRepository.findByEmail(changedByEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        checkOfficerOwnsComplaint(changedBy, complaint);

        if (newStatus == ComplaintStatus.RESOLVED &&
                changedBy.getRole() != Role.OFFICER) {

            throw new RuntimeException(
                    "Only an officer can resolve a complaint");
        }

        if (newStatus == ComplaintStatus.CLOSED &&
                changedBy.getRole() != Role.ADMIN) {

            throw new RuntimeException(
                    "Only an admin can close a complaint");
        }

        if (!ComplaintWorkflow.isValidTransition(
                complaint.getStatus(),
                newStatus)) {

            throw new RuntimeException(
                    "Invalid status transition");
        }

        ComplaintStatus oldStatus =
                complaint.getStatus();

        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(
                    LocalDateTime.now());
        }
        if (changedBy.getRole() == Role.OFFICER) {
            notificationService.notifyOfficerStatusChangeToAdmins(
                    complaint,
                    newStatus.name()
            );
        }

        complaintRepository.save(complaint);

        StatusHistory history =
                StatusHistory.builder()
                        .complaint(complaint)
                        .oldStatus(oldStatus)
                        .newStatus(newStatus)
                        .changedAt(
                                LocalDateTime.now())
                        .changedBy(changedBy)
                        .build();

        statusHistoryRepository.save(history);
        if (newStatus == ComplaintStatus.VERIFIED) {
            notificationService.notifyComplaintVerified(complaint);
        } else if (newStatus == ComplaintStatus.RESOLVED) {
            notificationService.notifyComplaintResolved(complaint);
        } else {
            notificationService.notifyComplaintStatusChange(
                    complaint,
                    newStatus.name()
            );
        }

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(complaint.getStatus().name())
                .message(
                        "Status updated successfully")
                .build();
    }
    public ComplaintResponse assignOfficer(
            Long complaintId,
            AssignOfficerRequest request,
            String changedByEmail) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Complaint not found"));
        if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                complaint.getStatus() == ComplaintStatus.CLOSED) {

            throw new RuntimeException(
                    "Completed complaints cannot be assigned again");
        }

        User officer = userRepository.findById(
                        request.getOfficerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Officer not found"));

        User changedBy = userRepository.findByEmail(
                        changedByEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new RuntimeException(
                    "Selected user is not an officer");
        }

        ComplaintStatus oldStatus =
                complaint.getStatus();

        if (!ComplaintWorkflow.isValidTransition(
                oldStatus,
                ComplaintStatus.ASSIGNED)) {

            throw new RuntimeException(
                    "Complaint must be verified before assigning an officer");
        }

        complaint.setAssignedTo(officer);
        complaint.setStatus(
                ComplaintStatus.ASSIGNED);

        StatusHistory history =
                StatusHistory.builder()
                        .complaint(complaint)
                        .oldStatus(oldStatus)
                        .newStatus(
                                ComplaintStatus.ASSIGNED)
                        .changedAt(
                                LocalDateTime.now())
                        .changedBy(changedBy)
                        .build();

        statusHistoryRepository.save(history);
        notificationService.notifyComplaintAssigned(complaint);

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(
                        complaint.getStatus().name())
                .message(
                        "Officer assigned successfully")
                .build();
    }
    /*
     * PRIORITY SCORE = upvotes + days open + category weight
     *
     *  - upvotes        : 1 point per citizen upvote
     *  - days open      : 1 point per full day since the complaint was filed
     *                     (stops counting once it is Resolved / Closed)
     *  - category weight: +5 for ELECTRICITY and WATER (safety / essential services)
     *
     * It is calculated every time a complaint is read, so it is never out of date.
     */
    public int computePriorityScore(Complaint complaint) {

        int score = complaint.getUpvoteCount() == null
                ? 0
                : complaint.getUpvoteCount();

        if (complaint.getCreatedAt() != null) {

            boolean finished =
                    complaint.getStatus() == ComplaintStatus.RESOLVED
                            || complaint.getStatus() == ComplaintStatus.CLOSED;

            LocalDateTime end =
                    finished && complaint.getResolvedAt() != null
                            ? complaint.getResolvedAt()
                            : LocalDateTime.now();

            long days = java.time.Duration
                    .between(complaint.getCreatedAt(), end)
                    .toDays();

            score += (int) Math.max(days, 0);
        }

        if (complaint.getCategory() == ComplaintCategory.ELECTRICITY
                || complaint.getCategory() == ComplaintCategory.WATER) {
            score += 5;
        }

        return score;
    }

    // Saves the score in the database column as well
    public int calculatePriorityScore(Complaint complaint) {

        int score = computePriorityScore(complaint);

        complaint.setPriorityScore(score);
        complaintRepository.save(complaint);

        return score;
    }
    public ComplaintResponse updateComplaint(
            Long complaintId,
            UpdateComplaintRequest request,
            String changedByEmail) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        User changedBy = userRepository.findByEmail(changedByEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        checkOfficerOwnsComplaint(changedBy, complaint);

        if (request.getAfterPhoto() != null &&
                !request.getAfterPhoto().isEmpty()) {

            String imageUrl =
                    fileUploadService.uploadFile(
                            request.getAfterPhoto());

            complaint.setAfterPhotoUrl(imageUrl);
        }

        if (request.getResolutionNotes() != null) {
            complaint.setResolutionNotes(
                    request.getResolutionNotes());
        }

        if (request.getStatus() != null) {

            ComplaintStatus oldStatus =
                    complaint.getStatus();

            if (!ComplaintWorkflow.isValidTransition(
                    oldStatus,
                    request.getStatus())) {

                throw new RuntimeException(
                        "Invalid status transition");
            }

            /*
             * Resolution notes are mandatory
             * when the officer resolves a complaint.
             */
            if (request.getStatus() ==
                    ComplaintStatus.RESOLVED &&
                    (request.getResolutionNotes() == null ||
                            request.getResolutionNotes()
                                    .trim()
                                    .isEmpty())) {

                throw new RuntimeException(
                        "Resolution notes are required before resolving the complaint");
            }
            if (request.getStatus() ==
                    ComplaintStatus.RESOLVED &&
                    changedBy.getRole() != Role.OFFICER) {

                throw new RuntimeException(
                        "Only an officer can resolve a complaint");
            }

            /*
             * Only Admin can perform the final CLOSE.
             */
            if (request.getStatus() ==
                    ComplaintStatus.CLOSED &&
                    changedBy.getRole() != Role.ADMIN) {

                throw new RuntimeException(
                        "Only an admin can close a complaint");
            }

            complaint.setStatus(
                    request.getStatus());

            if (request.getStatus() ==
                    ComplaintStatus.RESOLVED) {

                complaint.setResolvedAt(
                        LocalDateTime.now());
            }

            StatusHistory history =
                    StatusHistory.builder()
                            .complaint(complaint)
                            .oldStatus(oldStatus)
                            .newStatus(
                                    request.getStatus())
                            .changedAt(
                                    LocalDateTime.now())
                            .changedBy(changedBy)
                            .build();

            statusHistoryRepository.save(history);

            if (request.getStatus() ==
                    ComplaintStatus.RESOLVED) {

                notificationService.notifyComplaintResolved(
                        complaint);

            } else {

                notificationService.notifyComplaintStatusChange(
                        complaint,
                        request.getStatus().name());
            }
        }

        complaintRepository.save(complaint);

        return mapToResponse(complaint);
    }
    public String removeUpvote(Long complaintId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Upvote upvote = upvoteRepository.findByUserAndComplaint(user, complaint)
                .orElseThrow(() ->
                        new RuntimeException("You haven't upvoted this complaint"));

        upvoteRepository.delete(upvote);

        complaint.setUpvoteCount(
                (int) upvoteRepository.countByComplaint(complaint)
        );
        calculatePriorityScore(complaint);

        complaintRepository.save(complaint);

        return "Upvote removed successfully";
    }
    public ComplaintResponse verifyComplaint(
            Long complaintId,
            VerifyComplaintRequest request) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();

        if (!request.isVerified()) {
            throw new RuntimeException(
                    "Complaint cannot be closed during verification");
        }

        complaint.setStatus(
                ComplaintStatus.VERIFIED);
//
        StatusHistory history = StatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(complaint.getStatus())
                .changedAt(LocalDateTime.now())
                .build();
//
        statusHistoryRepository.save(history);
//
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(complaint.getStatus().name())
                .message("Complaint verification completed")
                .build();
    }
    public List<ComplaintResponse> getAssignedComplaints(String email) {

        User officer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Officer not found"));

        List<Complaint> complaints =
                complaintRepository.findByAssignedTo(officer);

        return complaints.stream()
                .map(this::mapToResponse)
                .toList();
    }
    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {

        final double EARTH_RADIUS = 6371000;

        double latDistance =
                Math.toRadians(lat2 - lat1);

        double lonDistance =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latDistance / 2)
                        * Math.sin(latDistance / 2)
                        +
                        Math.cos(Math.toRadians(lat1))
                                * Math.cos(Math.toRadians(lat2))
                                *
                                Math.sin(lonDistance / 2)
                                * Math.sin(lonDistance / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS * c;
    }
    public List<DuplicateComplaintResponse> findDuplicateComplaints(
            Double latitude,
            Double longitude,
            ComplaintCategory category,
            Double radiusMeters
    ) {

        // Default radius = 200 meters
        if (radiusMeters == null || radiusMeters <= 0) {
            radiusMeters = 200.0;
        }

        /*
         * Approximate conversion:
         * 1 degree latitude ≈ 111,000 meters
         */
        double latDifference = radiusMeters / 111000.0;

        /*
         * Longitude distance depends on latitude.
         */
        double lngDifference =
                radiusMeters /
                        (111000.0 * Math.cos(Math.toRadians(latitude)));

        double minLat = latitude - latDifference;
        double maxLat = latitude + latDifference;

        double minLng = longitude - lngDifference;
        double maxLng = longitude + lngDifference;

        List<Complaint> nearbyComplaints =
                complaintRepository.findNearbyComplaints(
                        minLat,
                        maxLat,
                        minLng,
                        maxLng,
                        category.name()
                );

        final Double searchRadius = radiusMeters;
        return nearbyComplaints.stream()
                .map(complaint -> {

                    double distance = calculateDistance(
                            latitude,
                            longitude,
                            complaint.getLatitude(),
                            complaint.getLongitude()
                    );



                    return DuplicateComplaintResponse.builder()
                            .complaintId(complaint.getId())
                            .title(complaint.getTitle())
                            .description(complaint.getDescription())
                            .category(complaint.getCategory())
                            .status(complaint.getStatus())
                            .latitude(complaint.getLatitude())
                            .longitude(complaint.getLongitude())
                            .address(complaint.getAddress())
                            .upvoteCount(complaint.getUpvoteCount())
                            .distanceMeters(
                                    Math.round(distance * 100.0) / 100.0
                            )
                            .build();
                })
                .filter(response ->
                        response.getDistanceMeters() <= searchRadius
                )
                .sorted(
                        Comparator.comparing(
                                DuplicateComplaintResponse::getDistanceMeters
                        )
                )
                .toList();
    }

}