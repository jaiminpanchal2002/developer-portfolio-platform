package com.jaimin.portfolio_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String authorName;

    /** Role and affiliation, e.g. "Engineering Manager, Acme". */
    private String authorRole;

    @Column(length = 2000)
    private String quote;

    private String avatarUrl;

    /** Optional profile link (LinkedIn etc.) for credibility. */
    private String linkUrl;

    private Integer displayOrder;

    /** NULL counts as published, mirroring the Project convention. */
    private Boolean published;

    private LocalDateTime createdAt;
}
