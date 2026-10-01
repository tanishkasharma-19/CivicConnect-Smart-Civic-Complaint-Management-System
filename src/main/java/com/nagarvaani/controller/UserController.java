package com.nagarvaani.controller;

import com.nagarvaani.dto.request.CreateOfficerRequest;
import com.nagarvaani.dto.response.UserResponse;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.UserRepository;
import com.nagarvaani.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @PostMapping("/officer")
    public ResponseEntity<String> createOfficer(
            @RequestBody CreateOfficerRequest request) {

        return ResponseEntity.ok(
                authService.createOfficer(request)
        );
    }

    @GetMapping("/officers")
    public ResponseEntity<List<UserResponse>> getAllOfficers() {

        List<UserResponse> officers =
                userRepository.findByRole(Role.OFFICER)
                        .stream()
                        .map(this::toUserResponse)
                        .toList();

        return ResponseEntity.ok(officers);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users =
                userRepository.findAll()
                        .stream()
                        .map(this::toUserResponse)
                        .toList();

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException(
                    "Admin accounts cannot be deactivated");
        }

        if (user.getEmail().equals(authentication.getName())) {
            throw new RuntimeException(
                    "You cannot deactivate your own account");
        }

        user.setIsActive(false);

        userRepository.save(user);

        return ResponseEntity.ok(
                "User deactivated successfully"
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                toUserResponse(user)
        );
    }

    private UserResponse toUserResponse(User user) {

        UserResponse.DepartmentSummary department = null;

        if (user.getDepartment() != null) {
            department =
                    UserResponse.DepartmentSummary.builder()
                            .id(user.getDepartment().getId())
                            .name(user.getDepartment().getName())
                            .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .designation(user.getDesignation())
                .ward(user.getWard())
                .department(department)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}