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

@Entity
@Table(name = "blog_posts", indexes = {
        @Index(name = "idx_blog_posts_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    /** URL-safe identifier used at /blog/{slug}; unique. */
    @Column(unique = true)
    private String slug;

    @Column(length = 500)
    private String excerpt;

    /** Post body — plain text / lightweight markup, rendered with line breaks. */
    @Column(length = 20000)
    private String content;

    private String coverImageUrl;

    /** Comma-separated tags, mirroring Project.technologies. */
    private String tags;

    private Integer readMinutes;

    /** NULL counts as published, mirroring the other content types. */
    private Boolean published;

    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
