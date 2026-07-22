package com.jaimin.portfolio_backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.entity.PageView;
import com.jaimin.portfolio_backend.repository.PageViewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PageViewRepository pageViewRepository;

    public void track(String path, String referrer, String userAgent, String ip) {
        if (path == null || path.isBlank() || path.startsWith("/admin")) {
            return; // never track the admin panel
        }
        pageViewRepository.save(PageView.builder()
                .path(truncate(path, 512))
                .referrer(truncate(normalizeReferrer(referrer), 512))
                .deviceType(deviceType(userAgent))
                .visitorHash(sha256((ip == null ? "" : ip) + "|" + (userAgent == null ? "" : userAgent)))
                .createdAt(LocalDateTime.now())
                .build());
    }

    /** Aggregates computed in-memory — portfolio traffic volumes make this trivial. */
    public Map<String, Object> summary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since30 = now.minusDays(30);
        List<PageView> views30 = pageViewRepository.findByCreatedAtAfter(since30);
        LocalDateTime since7 = now.minusDays(7);

        Map<String, Object> out = new HashMap<>();
        out.put("totalViews", pageViewRepository.count());
        out.put("views30d", views30.size());
        out.put("views7d", views30.stream().filter(v -> v.getCreatedAt().isAfter(since7)).count());
        out.put("uniqueVisitors30d",
                views30.stream().map(PageView::getVisitorHash).distinct().count());

        out.put("deviceBreakdown", views30.stream().collect(
                Collectors.groupingBy(
                        v -> v.getDeviceType() == null ? "Unknown" : v.getDeviceType(),
                        Collectors.counting())));

        out.put("topPages", topCounts(views30.stream()
                .map(PageView::getPath).collect(Collectors.toList()), 8));

        out.put("topReferrers", topCounts(views30.stream()
                .map(PageView::getReferrer)
                .filter(r -> r != null && !r.isBlank())
                .collect(Collectors.toList()), 8));

        // Daily series, oldest -> newest, zero-filled for quiet days.
        Map<String, Long> byDay = views30.stream().collect(Collectors.groupingBy(
                v -> v.getCreatedAt().toLocalDate().toString(), Collectors.counting()));
        Map<String, Long> series = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            String day = LocalDate.now().minusDays(i).toString();
            series.put(day, byDay.getOrDefault(day, 0L));
        }
        out.put("dailyViews14d", series);

        return out;
    }

    private Map<String, Long> topCounts(List<String> values, int limit) {
        return values.stream()
                .collect(Collectors.groupingBy(v -> v, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toMap(
                        Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));
    }

    private String deviceType(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("ipad") || ua.contains("tablet")) return "Tablet";
        if (ua.contains("mobi") || ua.contains("android") || ua.contains("iphone")) return "Mobile";
        return "Desktop";
    }

    private String normalizeReferrer(String referrer) {
        if (referrer == null || referrer.isBlank()) return null;
        try {
            java.net.URI uri = java.net.URI.create(referrer);
            return uri.getHost() != null ? uri.getHost() : referrer;
        } catch (Exception e) {
            return referrer;
        }
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            return "unavailable";
        }
    }
}
