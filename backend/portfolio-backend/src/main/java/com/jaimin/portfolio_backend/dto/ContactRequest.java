package com.jaimin.portfolio_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Message is required")
    @Size(max = 5000)
    private String message;

    // Not currently sent by the public Contact form (which only posts
    // name/email/message) — kept optional so any other caller relying on
    // this schedule-a-meeting path keeps working.
    private Boolean scheduleMeeting;
    private String meetingDate;
    private String meetingTime;
}
