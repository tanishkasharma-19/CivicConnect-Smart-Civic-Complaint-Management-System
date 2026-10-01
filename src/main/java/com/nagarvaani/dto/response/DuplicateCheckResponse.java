package com.nagarvaani.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckResponse {

    private boolean duplicateFound;

    private List<NearbyComplaintResponse> nearbyComplaints;

}