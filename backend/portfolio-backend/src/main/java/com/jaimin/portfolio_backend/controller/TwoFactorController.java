package com.jaimin.portfolio_backend.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.service.AuthService;

import lombok.RequiredArgsConstructor;

/**
 * Authenticated two-factor management. Lives under /api/2fa (not /api/auth,
 * which is public) so the default "anyRequest authenticated" rule applies —
 * the caller is always the logged-in user (Principal from the JWT).
 */
@RestController
@RequestMapping("/api/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final AuthService authService;

    @GetMapping("/status")
    public Map<String, Boolean> status(Principal principal) {
        return Map.of("enabled", authService.isTwoFactorEnabled(principal.getName()));
    }

    @PostMapping("/setup")
    public Map<String, String> setup(Principal principal) {
        return authService.setupTwoFactor(principal.getName());
    }

    @PostMapping("/enable")
    public Map<String, String> enable(Principal principal, @RequestBody Map<String, String> body) {
        return Map.of("message", authService.enableTwoFactor(principal.getName(), body.get("code")));
    }

    @PostMapping("/disable")
    public Map<String, String> disable(Principal principal, @RequestBody Map<String, String> body) {
        return Map.of("message", authService.disableTwoFactor(principal.getName(), body.get("code")));
    }
}
