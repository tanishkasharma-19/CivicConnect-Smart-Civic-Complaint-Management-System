package com.nagarvaani.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String message;
    private String type;
    private Boolean isRead;
    private Long complaintId;
    private LocalDateTime createdAt;
}