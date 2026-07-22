package com.jaimin.portfolio_backend.service;

import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

/**
 * RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30s step) — compatible with Google
 * Authenticator, Authy, 1Password, etc. Implemented directly on javax.crypto
 * so no third-party dependency is introduced.
 */
@Service
public class TotpService {

    private static final int TIME_STEP = 30;
    private static final int DIGITS = 6;
    private static final int WINDOW = 1; // accept the previous/next step for clock skew
    private static final String BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    private final SecureRandom random = new SecureRandom();

    /** New 160-bit base32 secret. */
    public String generateSecret() {
        byte[] buffer = new byte[20];
        random.nextBytes(buffer);
        return base32Encode(buffer);
    }

    /** otpauth:// URI an authenticator app can consume (via QR or manual entry). */
    public String otpauthUrl(String secret, String account, String issuer) {
        String label = urlEncode(issuer) + ":" + urlEncode(account);
        return "otpauth://totp/" + label
                + "?secret=" + secret
                + "&issuer=" + urlEncode(issuer)
                + "&algorithm=SHA1&digits=" + DIGITS + "&period=" + TIME_STEP;
    }

    public boolean verify(String secret, String code) {
        if (secret == null || code == null) return false;
        String trimmed = code.trim().replaceAll("\\s", "");
        if (!trimmed.matches("\\d{6}")) return false;
        long counter = Instant.now().getEpochSecond() / TIME_STEP;
        for (long i = -WINDOW; i <= WINDOW; i++) {
            if (constantTimeEquals(generateCode(secret, counter + i), trimmed)) {
                return true;
            }
        }
        return false;
    }

    private String generateCode(String secret, long counter) {
        byte[] key = base32Decode(secret);
        byte[] data = ByteBuffer.allocate(8).putLong(counter).array();
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);
            int offset = hash[hash.length - 1] & 0xF;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            int otp = binary % 1_000_000;
            return String.format("%06d", otp);
        } catch (Exception e) {
            throw new RuntimeException("TOTP generation failed", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    // ── Base32 (RFC 4648, no padding) ─────────────────────────────────
    private String base32Encode(byte[] data) {
        StringBuilder out = new StringBuilder();
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                out.append(BASE32.charAt((buffer >> (bitsLeft - 5)) & 0x1f));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            out.append(BASE32.charAt((buffer << (5 - bitsLeft)) & 0x1f));
        }
        return out.toString();
    }

    private byte[] base32Decode(String input) {
        String clean = input.trim().replace("=", "").toUpperCase();
        int buffer = 0, bitsLeft = 0;
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        for (char c : clean.toCharArray()) {
            int val = BASE32.indexOf(c);
            if (val < 0) continue; // skip stray chars
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                out.write((buffer >> (bitsLeft - 8)) & 0xff);
                bitsLeft -= 8;
            }
        }
        return out.toByteArray();
    }
}
