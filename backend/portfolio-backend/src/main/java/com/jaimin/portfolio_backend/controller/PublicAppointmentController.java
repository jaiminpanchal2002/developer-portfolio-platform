package com.jaimin.portfolio_backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.AppointmentRequest;
import com.jaimin.portfolio_backend.entity.Appointment;
import com.jaimin.portfolio_backend.service.AppointmentService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/** Public booking surface — no auth, so it's rate-limited per IP the same
 *  way the chatbot is, since appointment slots are a scarce, squattable
 *  resource. */
@RestController
@RequestMapping("/api/public/appointments")
@RequiredArgsConstructor
public class PublicAppointmentController {

    private static final int RATE_LIMIT_PER_WINDOW = 5;
    private static final long RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000L;

    private final AppointmentService appointmentService;
    private final Map<String, ConcurrentLinkedDeque<Long>> requestLog = new ConcurrentHashMap<>();

    @GetMapping("/availability")
    public ResponseEntity<?> availability(@RequestParam String date) {
        LocalDate parsed;
        try {
            parsed = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date"));
        }
        List<String> slots = appointmentService.getAvailableSlots(parsed);
        return ResponseEntity.ok(Map.of("date", date, "availableSlots", slots));
    }

    @PostMapping
    public ResponseEntity<?> book(@RequestBody AppointmentRequest request, HttpServletRequest httpRequest) {
        if (!isWithinRateLimit(clientIp(httpRequest))) {
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Too many booking attempts — please try again in a few minutes."));
        }
        try {
            Appointment appointment = appointmentService.book(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Appointment request received — you'll get an email once it's confirmed.",
                    "id", appointment.getId()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean isWithinRateLimit(String clientIp) {
        long now = System.currentTimeMillis();
        ConcurrentLinkedDeque<Long> timestamps = requestLog.computeIfAbsent(clientIp, k -> new ConcurrentLinkedDeque<>());
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > RATE_LIMIT_WINDOW_MS) {
            timestamps.pollFirst();
        }
        if (timestamps.size() >= RATE_LIMIT_PER_WINDOW) {
            return false;
        }
        timestamps.addLast(now);
        return true;
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
