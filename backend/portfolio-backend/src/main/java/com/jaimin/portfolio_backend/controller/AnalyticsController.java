package com.jaimin.portfolio_backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.service.AnalyticsService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** Public beacon: fire-and-forget page-view tracking, no auth, no cookies. */
    @PostMapping("/public/track")
    public Map<String, String> track(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest request) {

        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded != null && !forwarded.isBlank()
                ? forwarded.split(",")[0].trim()
                : request.getRemoteAddr();

        analyticsService.track(body.get("path"), body.get("referrer"), userAgent, ip);
        return Map.of("status", "ok");
    }

    /** Admin analytics summary — authenticated via the default JWT rule. */
    @GetMapping("/analytics/summary")
    public Map<String, Object> summary() {
        return analyticsService.summary();
    }
}
