package com.jaimin.portfolio_backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.jaimin.portfolio_backend.security.JwtService;
import com.jaimin.portfolio_backend.dto.LoginRequest;
import com.jaimin.portfolio_backend.dto.RegisterRequest;
import com.jaimin.portfolio_backend.entity.Role;
import com.jaimin.portfolio_backend.entity.User;
import com.jaimin.portfolio_backend.repository.UserRepository;
import com.jaimin.portfolio_backend.security.JwtService;

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

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(user.getEmail());
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