package com.nagarvaani.controller;

import com.nagarvaani.dto.request.AssignOfficerRequest;
import com.nagarvaani.dto.request.CreateOfficerRequest;
import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.UserRepository;
import com.nagarvaani.service.AuthService;
import com.nagarvaani.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @PutMapping("/complaints/{id}/verify")
    public ResponseEntity<ComplaintResponse> verifyComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.updateStatus(
                        id,
                        ComplaintStatus.VERIFIED,
                        authentication.getName()));
    }

    @PutMapping("/complaints/{id}/close")
    public ResponseEntity<ComplaintResponse> closeComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.updateStatus(
                        id,
                        ComplaintStatus.CLOSED,
                        authentication.getName()));
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignOfficer(
            @PathVariable Long id,
            @RequestBody AssignOfficerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.assignOfficer(
                        id,
                        request,
                        authentication.getName()));
    }

    @GetMapping("/officers")
    public List<User> getAllOfficers() {
        return userRepository.findByRole(Role.OFFICER);
    }

    @PostMapping("/officers")
    public ResponseEntity<String> createOfficer(
            @RequestBody CreateOfficerRequest request) {

        return ResponseEntity.ok(
                authService.createOfficer(request)
        );
    }
}