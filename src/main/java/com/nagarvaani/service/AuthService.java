package com.nagarvaani.service;

import com.nagarvaani.dto.request.CreateOfficerRequest;
import com.nagarvaani.dto.request.ForgotPasswordRequest;
import com.nagarvaani.dto.request.LoginRequest;
import com.nagarvaani.dto.request.RegisterRequest;
import com.nagarvaani.dto.request.ResendVerificationRequest;
import com.nagarvaani.dto.request.ResetPasswordRequest;
import com.nagarvaani.dto.request.VerifyEmailRequest;
import com.nagarvaani.dto.response.AuthResponse;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.Department;
import com.nagarvaani.model.PasswordResetToken;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.DepartmentRepository;
import com.nagarvaani.repository.PasswordResetTokenRepository;
import com.nagarvaani.repository.UserRepository;
import com.nagarvaani.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    private static final int RESET_TOKEN_MINUTES = 15;
    // A new reset email can be sent only after this many minutes
    private static final int RESEND_COOLDOWN_MINUTES = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Email verification code settings
    private static final int VERIFICATION_CODE_MINUTES = 10;
    private static final int VERIFICATION_RESEND_SECONDS = 60;
    private static final int MAX_VERIFICATION_ATTEMPTS = 5;

    // ─────────────────────────────────────────────
    // REGISTER  (account is created UNVERIFIED, a 6-digit code is emailed)
    // ─────────────────────────────────────────────

    @Transactional
    public String register(RegisterRequest request) {

        String email = request.getEmail().trim();

        Optional<User> existing = userRepository.findByEmail(email);

        User user;

        if (existing.isPresent()) {

            user = existing.get();

            // A verified account already uses this email
            if (!Boolean.FALSE.equals(user.getEmailVerified())) {
                throw new RuntimeException("Email already exists");
            }

            // Earlier sign-up was never verified: let the person start again
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

        } else {

            user = User.builder()
                    .name(request.getName())
                    .email(email)
                    .phone(request.getPhone())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.CITIZEN)
                    .isActive(true)
                    .emailVerified(false)
                    .build();
        }

        userRepository.save(user);

        sendVerificationCode(user);

        return "Verification code sent";
    }

    // ─────────────────────────────────────────────
    // VERIFY EMAIL  (correct code -> verified + logged in)
    // ─────────────────────────────────────────────

    // noRollbackFor: a WRONG code must still save the increased attempt count
    @Transactional(noRollbackFor = RuntimeException.class)
    public AuthResponse verifyEmail(VerifyEmailRequest request) {

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() ->
                        new RuntimeException("Invalid verification code"));

        if (!Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("This email is already verified. Please sign in.");
        }

        if (user.getVerificationCodeHash() == null
                || user.getVerificationCodeExpiry() == null
                || user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This code has expired. Please request a new one.");
        }

        int attempts = user.getVerificationAttempts() == null
                ? 0
                : user.getVerificationAttempts();

        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
            throw new RuntimeException("Too many wrong attempts. Please request a new code.");
        }

        String enteredHash = hashToken(request.getCode().trim() + ":" + user.getEmail());

        boolean matches = MessageDigest.isEqual(
                enteredHash.getBytes(StandardCharsets.UTF_8),
                user.getVerificationCodeHash().getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {
            user.setVerificationAttempts(attempts + 1);
            userRepository.save(user);
            throw new RuntimeException("Incorrect code. Please try again.");
        }

        // Correct code
        user.setEmailVerified(true);
        user.setVerificationCodeHash(null);
        user.setVerificationCodeExpiry(null);
        user.setVerificationAttempts(0);
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

    // ─────────────────────────────────────────────
    // RESEND CODE  (at most one email per minute)
    // ─────────────────────────────────────────────

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {

        Optional<User> optionalUser =
                userRepository.findByEmail(request.getEmail().trim());

        // Unknown or already verified: do nothing
        if (optionalUser.isEmpty()
                || !Boolean.FALSE.equals(optionalUser.get().getEmailVerified())) {
            return;
        }

        User user = optionalUser.get();

        LocalDateTime lastSent = user.getVerificationSentAt();

        if (lastSent != null
                && lastSent.plusSeconds(VERIFICATION_RESEND_SECONDS)
                .isAfter(LocalDateTime.now())) {
            return;
        }

        sendVerificationCode(user);
    }

    public AuthResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (DisabledException e) {
            throw new RuntimeException(
                    "Your account has been deactivated. Please contact the administrator."
            );
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Password was correct, but the email was never verified.
        // The frontend looks for this exact text and opens the verify page.
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
        }

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

    public String createOfficer(CreateOfficerRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        User officer = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.OFFICER)
                .department(department)
                .isActive(true)
                .emailVerified(true)
                .build();

        userRepository.save(officer);

        return "Officer created successfully";
    }

    // ─────────────────────────────────────────────
    // FORGOT PASSWORD
    // ─────────────────────────────────────────────

    // @Transactional is REQUIRED here: deleteByUser() is a derived delete
    // and fails without an active transaction.
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {

        Optional<User> optionalUser =
                userRepository.findByEmail(request.getEmail().trim());

        // Unknown email: tell the user clearly (no email is sent).
        // Note: the register page already says "Email already exists",
        // so this does not reveal anything new.
        if (optionalUser.isEmpty()) {
            throw new RuntimeException(
                    "This email is not registered. Please check the email or create an account."
            );
        }

        User user = optionalUser.get();

        // Resend cooldown: if a link was created less than 5 minutes ago,
        // do not send another email (stops email spamming).
        // The response stays the same, so nothing is revealed to the caller.
        Optional<PasswordResetToken> recentToken = passwordResetTokenRepository
                .findFirstByUserAndUsedFalseOrderByExpiryDateDesc(user);

        if (recentToken.isPresent()) {
            LocalDateTime createdAt = recentToken.get().getExpiryDate()
                    .minusMinutes(RESET_TOKEN_MINUTES);

            if (createdAt.plusMinutes(RESEND_COOLDOWN_MINUTES).isAfter(LocalDateTime.now())) {
                return;
            }
        }

        // Only one active reset link per user
        passwordResetTokenRepository.deleteByUser(user);

        // Random token: this goes in the email. Only its SHA-256 hash is stored.
        String rawToken = generateRawToken();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(hashToken(rawToken))
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(RESET_TOKEN_MINUTES))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
        } catch (MailException e) {
            log.error("Failed to send password reset email", e);
            // Throwing rolls back the saved token, and the user gets an honest error
            throw new RuntimeException(
                    "We could not send the reset email right now. Please try again later."
            );
        }
    }

    // ─────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        // Hash what the user sent and compare with the stored hash
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(hashToken(request.getToken().trim()))
                .orElseThrow(() ->
                        new RuntimeException("Invalid reset link"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new RuntimeException("This reset link has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This reset link has expired");
        }

        User user = resetToken.getUser();

        // Same PasswordEncoder bean (BCrypt) that register/login already use
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Token can never be used again
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    // ─────────────────────────────────────────────
    // helpers
    // ─────────────────────────────────────────────

    // Creates a new 6-digit code, stores only its hash, and emails the code
    private void sendVerificationCode(User user) {

        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        user.setVerificationCodeHash(hashToken(code + ":" + user.getEmail()));
        user.setVerificationCodeExpiry(
                LocalDateTime.now().plusMinutes(VERIFICATION_CODE_MINUTES));
        user.setVerificationAttempts(0);
        user.setVerificationSentAt(LocalDateTime.now());

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), code);
        } catch (MailException e) {
            log.error("Failed to send verification email", e);
            // Throwing rolls back the new account / code
            throw new RuntimeException(
                    "We could not send the verification email right now. Please try again later."
            );
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}