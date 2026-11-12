package com.nagarvaani.repository;

import com.nagarvaani.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PendingRegistrationRepository
        extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByEmail(String email);

    // Clean-up of sign-ups that were never verified
    void deleteByVerificationCodeExpiryBefore(LocalDateTime time);
}