package com.nagarvaani.service;

import com.nagarvaani.dto.request.LoginRequest;
import com.nagarvaani.dto.request.RegisterRequest;
import com.nagarvaani.dto.response.AuthResponse;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.UserRepository;
import com.nagarvaani.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CITIZEN)
                .isActive(true)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getRole().name(),
                user.getEmail()
        );
    }
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getRole().name(),
                user.getEmail()
        );
    }
}

