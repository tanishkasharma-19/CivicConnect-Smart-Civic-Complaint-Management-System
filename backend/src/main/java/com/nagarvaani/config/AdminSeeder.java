package com.nagarvaani.config;

import com.nagarvaani.enums.Role;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/*
 * Creates the FIRST admin account on a brand-new (empty) database.
 *
 * It runs at every start, but only does something when:
 *   - the environment variables ADMIN_EMAIL and ADMIN_PASSWORD are set, and
 *   - no user with that email exists yet.
 *
 * On your laptop these variables are not set, so nothing happens.
 * The password is stored encoded (BCrypt), exactly like normal registration.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }

        String email = adminEmail.trim();

        if (userRepository.findByEmail(email).isPresent()) {
            log.info("Admin account already exists, nothing to create");
            return;
        }

        if (adminPassword.length() < 8) {
            log.error("ADMIN_PASSWORD must be at least 8 characters. Admin was not created.");
            return;
        }

        User admin = User.builder()
                .name("Administrator")
                .email(email)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .isActive(true)
                .emailVerified(true)
                .build();

        userRepository.save(admin);

        log.info("First admin account created for {}", email);
    }
}