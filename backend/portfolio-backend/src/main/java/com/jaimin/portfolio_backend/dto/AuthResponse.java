package com.jaimin.portfolio_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** JWT on a successful login; null when 2FA is still required. */
    private String token;

    /** Human-readable status (e.g. registration confirmation). */
    private String message;

    /** True when the password was correct but a TOTP code is still needed. */
    private boolean twoFactorRequired;
}
