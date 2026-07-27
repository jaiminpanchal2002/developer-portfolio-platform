package com.jaimin.portfolio_backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String company;

    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDate appointmentDate;

    /** "HH:mm", 24h — matches the fixed slot list the availability endpoint hands out. */
    private String appointmentTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    /** Populated on approval — an auto-generated Jitsi room, same scheme as the
     *  existing contact-form counselling booking. */
    private String meetingLink;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
