package com.jaimin.portfolio_backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.jaimin.portfolio_backend.security.JwtService;
import com.jaimin.portfolio_backend.dto.AuthResponse;
import com.jaimin.portfolio_backend.dto.LoginRequest;
import com.jaimin.portfolio_backend.dto.RegisterRequest;
import com.jaimin.portfolio_backend.entity.Role;
import com.jaimin.portfolio_backend.entity.User;
import com.jaimin.portfolio_backend.repository.UserRepository;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    private final TotpService totpService;

    private static final String ISSUER = "Jaimin Panchal Portfolio";

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();

        userRepository.save(user);

        return "User Registered Successfully";
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid Password");
        }

        // Password correct: if 2FA is on, withhold the token until the code
        // is verified via /api/auth/2fa/verify.
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            return AuthResponse.builder().twoFactorRequired(true).build();
        }

        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail()))
                .build();
    }

    /** Second login step: exchange email + TOTP code for a token. */
    public AuthResponse verifyTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new RuntimeException("Two-factor authentication is not enabled");
        }
        if (!totpService.verify(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid authentication code");
        }
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail()))
                .build();
    }

    /** Begin enrollment: generate (but don't yet trust) a secret. */
    public java.util.Map<String, String> setupTwoFactor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String secret = totpService.generateSecret();
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        return java.util.Map.of(
                "secret", secret,
                "otpauthUrl", totpService.otpauthUrl(secret, user.getEmail(), ISSUER));
    }

    /** Finish enrollment: only flips the flag once a code proves the secret works. */
    public String enableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getTwoFactorSecret() == null) {
            throw new RuntimeException("Start setup before enabling two-factor");
        }
        if (!totpService.verify(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid authentication code");
        }
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return "Two-factor authentication enabled";
    }

    /** Disable, requiring a valid current code so a hijacked session can't turn it off silently. */
    public String disableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())
                && !totpService.verify(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid authentication code");
        }
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
        return "Two-factor authentication disabled";
    }

    public boolean isTwoFactorEnabled(String email) {
        return userRepository.findByEmail(email)
                .map(u -> Boolean.TRUE.equals(u.getTwoFactorEnabled()))
                .orElse(false);
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account registered with this email."));

        // Generate a random temporary password
        String tempPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // Send Email
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject("Portfolio Platform - Temporary Password");
            mailMessage.setText("Hello " + user.getFullName() + ",\n\n" +
                    "A password reset was requested for your account.\n" +
                    "Your temporary password is: " + tempPassword + "\n\n" +
                    "Please log in and update your password immediately from your dashboard settings.\n\n" +
                    "Best regards,\nPortfolio Platform");
            mailSender.send(mailMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email: " + e.getMessage(), e);
        }

        return "Temporary password has been sent to your email.";
    }
}