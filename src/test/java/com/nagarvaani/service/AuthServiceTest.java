package com.nagarvaani.service;

import com.nagarvaani.dto.request.ForgotPasswordRequest;
import com.nagarvaani.dto.request.LoginRequest;
import com.nagarvaani.dto.request.RegisterRequest;
import com.nagarvaani.dto.request.ResetPasswordRequest;
import com.nagarvaani.dto.request.VerifyEmailRequest;
import com.nagarvaani.dto.response.AuthResponse;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.PasswordResetToken;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.DepartmentRepository;
import com.nagarvaani.repository.PasswordResetTokenRepository;
import com.nagarvaani.repository.UserRepository;
import com.nagarvaani.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/*
 * Unit tests for the account features of AuthService:
 * register, login, email verification, forgot password, reset password.
 * No database or mail server is used: every dependency is a Mockito mock.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    // ---------- helpers ----------

    private User user(String email, boolean verified) {
        User user = User.builder()
                .name("Test User")
                .email(email)
                .password("encoded-password")
                .role(Role.CITIZEN)
                .isActive(true)
                .emailVerified(verified)
                .build();
        user.setId(1L);
        return user;
    }

    // same hashing rule as AuthService.hashToken
    private String sha256(String text) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(
                digest.digest(text.getBytes(StandardCharsets.UTF_8)));
    }

    private ForgotPasswordRequest forgotRequest(String email) {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(email);
        return request;
    }

    private ResetPasswordRequest resetRequest(String token, String password) {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword(password);
        return request;
    }

    private VerifyEmailRequest verifyRequest(String email, String code) {
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setEmail(email);
        request.setCode(code);
        return request;
    }

    // ---------- forgot password ----------

    @Test
    void forgotPassword_unknownEmail_throwsAndSendsNoEmail() {
        when(userRepository.findByEmail("nobody@example.com"))
                .thenReturn(Optional.empty());

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.forgotPassword(forgotRequest("nobody@example.com")));

        assertTrue(error.getMessage().contains("not registered"));
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void forgotPassword_knownEmail_storesOnlyHashOfTokenAndEmailsRawToken() {
        User user = user("a@example.com", true);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository
                .findFirstByUserAndUsedFalseOrderByExpiryDateDesc(user))
                .thenReturn(Optional.empty());

        authService.forgotPassword(forgotRequest("a@example.com"));

        ArgumentCaptor<PasswordResetToken> saved =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(saved.capture());

        ArgumentCaptor<String> emailedToken = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(eq("a@example.com"), emailedToken.capture());

        // the database never sees the raw token
        assertNotEquals(emailedToken.getValue(), saved.getValue().getToken());
        assertEquals(64, saved.getValue().getToken().length());
        assertFalse(saved.getValue().getUsed());
        assertTrue(saved.getValue().getExpiryDate().isAfter(LocalDateTime.now()));
    }

    @Test
    void forgotPassword_secondRequestWithinCooldown_sendsNoSecondEmail() {
        User user = user("a@example.com", true);
        // link created about 1 minute ago (expires 14 minutes from now)
        PasswordResetToken recent = PasswordResetToken.builder()
                .token("hash")
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(14))
                .used(false)
                .build();

        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository
                .findFirstByUserAndUsedFalseOrderByExpiryDateDesc(user))
                .thenReturn(Optional.of(recent));

        authService.forgotPassword(forgotRequest("a@example.com"));

        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    // ---------- reset password ----------

    @Test
    void resetPassword_unknownToken_throws() {
        when(passwordResetTokenRepository.findByToken(anyString()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> authService.resetPassword(resetRequest("bad-token", "NewPass@123")));
    }

    @Test
    void resetPassword_expiredToken_throws() {
        PasswordResetToken expired = PasswordResetToken.builder()
                .token("hash")
                .user(user("a@example.com", true))
                .expiryDate(LocalDateTime.now().minusMinutes(1))
                .used(false)
                .build();
        when(passwordResetTokenRepository.findByToken(anyString()))
                .thenReturn(Optional.of(expired));

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(resetRequest("token", "NewPass@123")));

        assertTrue(error.getMessage().contains("expired"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_alreadyUsedToken_throws() {
        PasswordResetToken used = PasswordResetToken.builder()
                .token("hash")
                .user(user("a@example.com", true))
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .used(true)
                .build();
        when(passwordResetTokenRepository.findByToken(anyString()))
                .thenReturn(Optional.of(used));

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(resetRequest("token", "NewPass@123")));

        assertTrue(error.getMessage().contains("already been used"));
    }

    @Test
    void resetPassword_validToken_encodesNewPasswordAndInvalidatesToken() {
        User user = user("a@example.com", true);
        PasswordResetToken valid = PasswordResetToken.builder()
                .token("hash")
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        when(passwordResetTokenRepository.findByToken(anyString()))
                .thenReturn(Optional.of(valid));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("encoded-new");

        authService.resetPassword(resetRequest("token", "NewPass@123"));

        assertEquals("encoded-new", user.getPassword());
        assertTrue(valid.getUsed());
        verify(userRepository).save(user);
    }

    // ---------- email verification ----------

    @Test
    void verifyEmail_wrongCode_countsTheAttempt() throws Exception {
        User user = user("a@example.com", false);
        user.setVerificationCodeHash(sha256("123456:a@example.com"));
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(5));
        user.setVerificationAttempts(0);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class,
                () -> authService.verifyEmail(verifyRequest("a@example.com", "000000")));

        assertEquals(1, user.getVerificationAttempts());
        assertFalse(user.getEmailVerified());
    }

    @Test
    void verifyEmail_tooManyWrongAttempts_isLocked() throws Exception {
        User user = user("a@example.com", false);
        user.setVerificationCodeHash(sha256("123456:a@example.com"));
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(5));
        user.setVerificationAttempts(5);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));

        // even the CORRECT code is refused after 5 wrong attempts
        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.verifyEmail(verifyRequest("a@example.com", "123456")));

        assertTrue(error.getMessage().contains("Too many"));
    }

    @Test
    void verifyEmail_expiredCode_throws() throws Exception {
        User user = user("a@example.com", false);
        user.setVerificationCodeHash(sha256("123456:a@example.com"));
        user.setVerificationCodeExpiry(LocalDateTime.now().minusMinutes(1));
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.verifyEmail(verifyRequest("a@example.com", "123456")));

        assertTrue(error.getMessage().contains("expired"));
    }

    @Test
    void verifyEmail_correctCode_verifiesAccountAndReturnsToken() throws Exception {
        User user = user("a@example.com", false);
        user.setVerificationCodeHash(sha256("123456:a@example.com"));
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(5));
        user.setVerificationAttempts(0);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(1L, "a@example.com", "CITIZEN")).thenReturn("jwt-token");

        AuthResponse response =
                authService.verifyEmail(verifyRequest("a@example.com", "123456"));

        assertEquals("jwt-token", response.getToken());
        assertEquals("CITIZEN", response.getRole());
        assertTrue(user.getEmailVerified());
        assertNull(user.getVerificationCodeHash());
    }

    // ---------- register / login ----------

    @Test
    void register_emailAlreadyVerified_throws() {
        User existing = user("a@example.com", true);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(existing));

        RegisterRequest request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("a@example.com");
        request.setPhone("9876543210");
        request.setPassword("Password@123");

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> authService.register(request));

        assertEquals("Email already exists", error.getMessage());
    }

    @Test
    void login_unverifiedEmail_isRejectedWithMarkerMessage() {
        User user = user("a@example.com", false);
        when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("a@example.com");
        request.setPassword("Password@123");

        RuntimeException error =
                assertThrows(RuntimeException.class, () -> authService.login(request));

        assertEquals("EMAIL_NOT_VERIFIED", error.getMessage());
    }

    @Test
    void login_deactivatedAccount_showsDeactivatedMessage() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new DisabledException("User is disabled"));

        LoginRequest request = new LoginRequest();
        request.setEmail("a@example.com");
        request.setPassword("Password@123");

        RuntimeException error =
                assertThrows(RuntimeException.class, () -> authService.login(request));

        assertTrue(error.getMessage().contains("deactivated"));
    }
}