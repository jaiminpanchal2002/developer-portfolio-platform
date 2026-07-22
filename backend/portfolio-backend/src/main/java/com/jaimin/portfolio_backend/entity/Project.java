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
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String title;
 
    @Column(length = 5000)
    private String description;
 
    private String githubUrl;
 
    private String liveUrl;
 
    private String imageUrl;
 
    private String technologies;

    private Boolean featured;

    // --- Case-study narrative (all optional; rendered on /projects/{id}) ---

    @Column(length = 5000)
    private String problemStatement;

    @Column(length = 5000)
    private String solution;

    @Column(length = 5000)
    private String architecture;

    @Column(length = 5000)
    private String challenges;

    @Column(length = 5000)
    private String learnings;

    /** Outcome numbers, one per line (e.g. "40% faster page loads"). */
    @Column(length = 2000)
    private String metrics;

    /** Manual ordering for the public showcase; lower comes first. */
    private Integer displayOrder;

    /**
     * Draft/publish state. NULL (legacy rows) is treated as published so
     * existing content never disappears when this column is introduced.
     */
    private Boolean published;

    private LocalDateTime createdAt;
}
 