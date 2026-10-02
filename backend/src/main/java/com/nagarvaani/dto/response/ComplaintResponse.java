package com.nagarvaani.dto.response;

import lombok.Builder;
import lombok.Data;

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

    private String message;
    private String resolutionNotes;
    private String afterPhotoUrl;
}