package com.nagarvaani.controller;


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
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }
    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }
}
