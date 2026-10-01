package com.nagarvaani.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyComplaintResponse {

    private Long complaintId;

    private String title;

    private String status;

    private String address;

    private Double distanceInMeters;

}