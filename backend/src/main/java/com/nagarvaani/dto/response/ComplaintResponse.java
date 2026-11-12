package com.nagarvaani.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {

    private Long id;

    private String title;

    private String description;

    private String category;

    private String status;

    private String address;

    private Double latitude;

    private Double longitude;

    private String beforePhotoUrl;

    private Integer upvoteCount;

    // upvotes + days open + category weight (calculated fresh on every read)
    private Integer priorityScore;

    private String department;

    // Date the complaint was reported (shown on the citizen detail page)
    private LocalDateTime createdAt;

    // Assigned officer. The NAME is visible to every logged-in user.
    // Email and phone are filled ONLY for the citizen who filed the complaint.
    private String officerName;

    private String officerEmail;

    private String officerPhone;

    private String message;
    private String resolutionNotes;
    private String afterPhotoUrl;

    // true when the person viewing this complaint has already upvoted it
    private Boolean upvotedByMe;
}