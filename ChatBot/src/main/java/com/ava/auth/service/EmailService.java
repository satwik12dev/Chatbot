package com.ava.auth.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @Value("${ava.mail.from-email:satwiksaxena41@gmail.com}")
    private String fromEmailConfig;

    @Value("${ava.mail.from-name:AVA AI Assistant}")
    private String fromName;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        String apiKeyOrPassword = smtpPassword != null ? smtpPassword.trim() : "";

        // 1. If user provided Brevo API Key (starts with xkeysib-), use Brevo REST API directly
        if (apiKeyOrPassword.startsWith("xkeysib-")) {
            boolean success = sendViaBrevoRestApi(toEmail, otpCode, apiKeyOrPassword);
            if (success) {
                return;
            }
        }

        // 2. Otherwise, attempt Brevo SMTP Relay via JavaMailSender
        boolean hasSmtpConfig = smtpUsername != null && !smtpUsername.isBlank() && !apiKeyOrPassword.isBlank();
        if (hasSmtpConfig && mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                String senderEmail = (fromEmailConfig != null && !fromEmailConfig.isBlank() && !fromEmailConfig.contains("@smtp-brevo.com"))
                        ? fromEmailConfig
                        : "satwiksaxena41@gmail.com";

                helper.setFrom(new InternetAddress(senderEmail, fromName));
                helper.setTo(toEmail);
                helper.setSubject("Your AVA Verification Code: " + otpCode);

                String htmlContent = buildOtpHtmlEmail(otpCode);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("Email OTP successfully dispatched via Brevo SMTP to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("Failed to send email via Brevo SMTP: {}. Falling back to console output.", e.getMessage());
            }
        } else if (!apiKeyOrPassword.startsWith("xkeysib-")) {
            log.warn("Brevo credentials are not configured in .env. Falling back to console dispatch.");
        }

        // Development Console Fallback
        log.info("""
                
                ====================================================================
                [AVA VERIFICATION] BREVO OTP DISPATCH
                To: {}
                Code: {}
                Validity: 5 Minutes
                ====================================================================
                """, toEmail, otpCode);
    }

    private boolean sendViaBrevoRestApi(String toEmail, String otpCode, String apiKey) {
        try {
            String senderEmail = (fromEmailConfig != null && !fromEmailConfig.isBlank() && !fromEmailConfig.contains("@smtp-brevo.com"))
                    ? fromEmailConfig
                    : "satwiksaxena41@gmail.com";

            String htmlContent = buildOtpHtmlEmail(otpCode);

            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "replyTo", Map.of("name", fromName, "email", senderEmail),
                    "subject", "Your AVA Verification Code: " + otpCode,
                    "htmlContent", htmlContent
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email OTP successfully dispatched via Brevo REST API to {}", toEmail);
                return true;
            } else {
                log.error("Brevo API returned error status {}: {}. Falling back to SMTP/console.", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to dispatch email via Brevo REST API: {}. Falling back.", e.getMessage());
            return false;
        }
    }

    private String buildOtpHtmlEmail(String otpCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Your AVA Verification Code</title>
                </head>
                <body style="margin:0; padding:0; background-color:#09090b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ededed;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#09090b; padding:40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:500px; background-color:#121216; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
                                    <tr>
                                        <td style="padding:32px 32px 20px 32px; text-align:center;">
                                            <div style="display:inline-block; width:48px; height:48px; line-height:48px; border-radius:12px; background:linear-gradient(135deg, #6366f1, #9333ea); color:#ffffff; font-size:24px; font-weight:bold; margin-bottom:16px;">
                                                ✦
                                            </div>
                                            <h1 style="margin:0; font-size:22px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Verify Your Email</h1>
                                            <p style="margin:8px 0 0 0; font-size:14px; color:#a1a1aa;">Use the code below to complete your AVA account creation.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding:20px 32px;">
                                            <div style="background-color:#18181b; border:1px solid #3f3f46; border-radius:12px; padding:18px 24px; display:inline-block;">
                                                <span style="font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:32px; font-weight:700; color:#818cf8; letter-spacing:8px;">
                                                    """ + otpCode + """
                                                </span>
                                            </div>
                                            <p style="margin:16px 0 0 0; font-size:12px; color:#71717a;">This verification code will expire in <strong>5 minutes</strong>.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:20px 32px 32px 32px; text-align:center; border-top:1px solid #27272a;">
                                            <p style="margin:0; font-size:12px; color:#52525b; line-height:1.5;">
                                                If you did not request this email, no action is needed. Your account remains secure.
                                            </p>
                                            <p style="margin:12px 0 0 0; font-size:11px; color:#3f3f46;">
                                                &copy; 2026 AVA — Intelligent AI Assistant
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """;
    }
}
