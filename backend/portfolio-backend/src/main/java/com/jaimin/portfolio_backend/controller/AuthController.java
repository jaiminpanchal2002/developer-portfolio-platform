package com.jaimin.portfolio_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.jaimin.portfolio_backend.dto.AuthResponse;
import com.jaimin.portfolio_backend.dto.LoginRequest;
import com.jaimin.portfolio_backend.dto.RegisterRequest;
import com.jaimin.portfolio_backend.dto.PasswordResetRequest;
import com.jaimin.portfolio_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);

        return AuthResponse.builder().message(message).build();
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    /** Second step of 2FA login: email + TOTP code -> token. Public by design. */
    @PostMapping("/2fa/verify")
    public AuthResponse verifyTwoFactor(@RequestBody Map<String, String> body) {
        return authService.verifyTwoFactor(body.get("email"), body.get("code"));
    }

    /** Silently renews the session token; requires a still-valid token (see SecurityConfig). */
    @PostMapping("/refresh")
    public AuthResponse refresh(Authentication authentication) {
        return authService.refresh(authentication.getName());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody PasswordResetRequest request) {

        String message = authService.forgotPassword(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
}