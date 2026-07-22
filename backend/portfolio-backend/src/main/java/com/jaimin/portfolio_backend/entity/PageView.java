package com.jaimin.portfolio_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One public page view. Privacy-first: no cookies, no raw IPs — the
 * visitor is a one-way SHA-256 hash of IP + User-Agent, good enough to
 * approximate unique visitors without storing identifying data.
 */
@Entity
@Table(name = "page_views", indexes = {
        @Index(name = "idx_page_views_created_at", columnList = "createdAt"),
        @Index(name = "idx_page_views_path", columnList = "path")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 512)
    private String path;

    @Column(length = 512)
    private String referrer;

    /** Desktop / Mobile / Tablet, derived from the User-Agent. */
    private String deviceType;

    /** SHA-256(ip + userAgent) — anonymized unique-visitor key. */
    @Column(length = 64)
    private String visitorHash;

    private LocalDateTime createdAt;
}
