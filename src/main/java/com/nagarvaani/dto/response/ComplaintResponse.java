package com.nagarvaani.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ComplaintResponse {

    private Long id;

    private String title;

    private String status;

    private String department;

    private String message;
}