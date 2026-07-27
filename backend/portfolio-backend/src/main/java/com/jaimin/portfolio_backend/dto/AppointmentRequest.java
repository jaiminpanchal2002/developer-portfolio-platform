package com.jaimin.portfolio_backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    private String name;
    private String email;
    private String phone;
    private String company;
    private String purpose;
    private String message;
    private LocalDate appointmentDate;
    private String appointmentTime;
}
