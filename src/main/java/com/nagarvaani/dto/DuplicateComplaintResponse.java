package com.nagarvaani.dto;

import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DuplicateComplaintResponse {

    private Long complaintId;

    private String title;

    private String description;

    private ComplaintCategory category;

    private ComplaintStatus status;

    private Double latitude;

    private Double longitude;

    private String address;

    private Integer upvoteCount;

    private Double distanceMeters;
}