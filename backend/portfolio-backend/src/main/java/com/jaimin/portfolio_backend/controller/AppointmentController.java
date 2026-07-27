package com.jaimin.portfolio_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.BulkIdsRequest;
import com.jaimin.portfolio_backend.dto.BulkStatusRequest;
import com.jaimin.portfolio_backend.entity.Appointment;
import com.jaimin.portfolio_backend.entity.AppointmentStatus;
import com.jaimin.portfolio_backend.service.AppointmentService;

import lombok.RequiredArgsConstructor;

/** Admin-only management — secured by SecurityConfig's default authenticated rule. */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/admin/all")
    public List<Appointment> getAll() {
        return appointmentService.getAll();
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        return appointmentService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody BulkIdsRequest request) {
        appointmentService.bulkDelete(request.getIds());
        return ResponseEntity.ok(Map.of("deleted", request.getIds().size()));
    }

    @PatchMapping("/bulk-status")
    public ResponseEntity<Map<String, Object>> bulkStatus(@RequestBody BulkStatusRequest request) {
        appointmentService.bulkUpdateStatus(request.getIds(), request.getStatus());
        return ResponseEntity.ok(Map.of("updated", request.getIds().size()));
    }
}
