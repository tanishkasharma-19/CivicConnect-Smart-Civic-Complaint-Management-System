package com.nagarvaani.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/*
 * Sends all CivicConnect emails.
 *
 *  - If BREVO_API_KEY is set  -> emails go through Brevo's HTTPS API
 *    (needed on hosts like Render's free plan that block SMTP ports).
 *  - Otherwise                 -> normal SMTP (spring.mail.*), e.g. Gmail on your laptop.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    // Optional: the app must still start when only Brevo is configured
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail-from}")
    private String fromEmail;

    @Value("${app.mail-from-name}")
    private String fromName;

    @Value("${app.brevo.api-key}")
    private String brevoApiKey;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Not part of the constructor: it already has a value
    private final RestClient restClient = buildRestClient();

    private static RestClient buildRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(10_000);

        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public void sendPasswordResetEmail(
            String email,
            String token) {

        String resetLink =
                frontendUrl +
                        "/reset-password?token=" +
                        token;

        send(
                email,
                "CivicConnect - Reset Your Password",
                "Hello,\n\n" +
                        "We received a request to reset your CivicConnect password.\n\n" +
                        "Click the link below to reset your password:\n\n" +
                        resetLink +
                        "\n\n" +
                        "This link will expire in 15 minutes.\n\n" +
                        "If you did not request a password reset, " +
                        "you can safely ignore this email.\n\n" +
                        "Regards,\n" +
                        "CivicConnect Team"
        );
    }

    public void sendVerificationEmail(
            String email,
            String code) {

        send(
                email,
                "CivicConnect - Verify Your Email",
                "Hello,\n\n" +
                        "Your CivicConnect verification code is:\n\n" +
                        code +
                        "\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you did not create a CivicConnect account, " +
                        "you can safely ignore this email.\n\n" +
                        "Regards,\n" +
                        "CivicConnect Team"
        );
    }

    public void sendEscalationEmail(
            String email,
            Long complaintId) {

        send(
                email,
                "CivicConnect - Complaint Escalated",
                "Hello,\n\n" +
                        "Your CivicConnect complaint #" +
                        complaintId +
                        " has been escalated because it has exceeded its expected resolution deadline.\n\n" +
                        "Please log in to CivicConnect to view the latest status of your complaint.\n\n" +
                        "Regards,\n" +
                        "CivicConnect Team"
        );
    }

    // ─────────────────────────────────────────────
    // one place that decides HOW the email is sent
    // ─────────────────────────────────────────────

    private void send(String to, String subject, String text) {

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendWithBrevo(to, subject, text);
        } else {
            sendWithSmtp(to, subject, text);
        }
    }

    private void sendWithSmtp(String to, String subject, String text) {

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            throw new MailSendException(
                    "Email is not configured. Set BREVO_API_KEY or the MAIL_* settings.");
        }

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    private void sendWithBrevo(String to, String subject, String text) {

        Map<String, Object> body = Map.of(
                "sender", Map.of("name", fromName, "email", fromEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "textContent", text
        );

        try {
            restClient.post()
                    .uri(BREVO_URL)
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            // AuthService catches MailException and shows a friendly message
            throw new MailSendException("Brevo email request failed: " + e.getMessage(), e);
        }
    }
}