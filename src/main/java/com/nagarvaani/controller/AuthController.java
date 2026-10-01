package com.nagarvaani.controller;

import com.nagarvaani.dto.request.ForgotPasswordRequest;
import com.nagarvaani.dto.request.ResendVerificationRequest;
import com.nagarvaani.dto.request.ResetPasswordRequest;
import com.nagarvaani.dto.request.VerifyEmailRequest;
import com.nagarvaani.dto.request.LoginRequest;
import com.nagarvaani.dto.request.RegisterRequest;
import com.nagarvaani.dto.response.AuthResponse;
import com.nagarvaani.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public String register(
            @Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        return authService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    public String resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {

        authService.resendVerification(request);

        return "If the account needs verification, a new code has been sent.";
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return "Password reset link sent";
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return "Password reset successfully";
    }
}