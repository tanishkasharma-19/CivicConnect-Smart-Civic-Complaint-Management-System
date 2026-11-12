package com.nagarvaani.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/*
 * A sign-up that is waiting for its email code.
 * The person is NOT in the "users" table until the code is entered correctly.
 */
@Entity
@Table(name = "pending_registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 15)
    private String phone;

    // BCrypt hash (never the plain password)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // Only the SHA-256 hash of the 6-digit code is stored
    @Column(name = "verification_code_hash", length = 64)
    private String verificationCodeHash;

    @Column(name = "verification_code_expiry")
    private LocalDateTime verificationCodeExpiry;

    @Column(name = "verification_attempts")
    private Integer verificationAttempts;

    @Column(name = "verification_sent_at")
    private LocalDateTime verificationSentAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}