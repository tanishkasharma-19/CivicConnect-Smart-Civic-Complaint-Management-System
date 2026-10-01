package com.nagarvaani.controller;

import com.nagarvaani.dto.response.NotificationResponse;
import com.nagarvaani.model.Notification;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.NotificationRepository;
import com.nagarvaani.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestParam String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<NotificationResponse> notifications =
                notificationRepository
                        .findByUserOrderByCreatedAtDesc(user)
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ResponseEntity.ok(notifications);
    }

    private NotificationResponse mapToResponse(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .complaintId(
                        notification.getComplaint() != null
                                ? notification.getComplaint().getId()
                                : null
                )
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(
                "Notification marked as read");
    }
}