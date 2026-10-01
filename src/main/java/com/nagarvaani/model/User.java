package com.nagarvaani.model;


import com.nagarvaani.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // Mobile number given at registration (10 digits)
    @Column(length = 15)
    private String phone;

    // null = old account created before email verification existed
    // (treated as verified). New sign-ups start with false.
    @Column(name = "email_verified")
    private Boolean emailVerified;

    // Only the SHA-256 hash of the 6-digit code is stored
    @JsonIgnore
    @Column(name = "verification_code_hash", length = 64)
    private String verificationCodeHash;

    @Column(name = "verification_code_expiry")
    private LocalDateTime verificationCodeExpiry;

    @Column(name = "verification_attempts")
    private Integer verificationAttempts;

    @Column(name = "verification_sent_at")
    private LocalDateTime verificationSentAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String ward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


}