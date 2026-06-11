package com.jaimin.portfolio_backend.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "contact_inquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Boolean scheduleMeeting;

    private String meetingDate;

    private String meetingTime;

    private String meetingLink;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    private Boolean isRead = false;
}
