package com.nagarvaani.repository;

import com.nagarvaani.model.PasswordResetToken;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // Latest reset link that has not been used yet (used for the resend cooldown)
    Optional<PasswordResetToken> findFirstByUserAndUsedFalseOrderByExpiryDateDesc(User user);

    void deleteByUser(User user);
}