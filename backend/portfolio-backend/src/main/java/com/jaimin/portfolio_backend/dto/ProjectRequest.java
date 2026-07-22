package com.jaimin.portfolio_backend.dto;
 
import lombok.Data;
 
@Data
public class ProjectRequest {
 
    private String title;
    private String description;
    private String githubUrl;
    private String liveUrl;
    private String imageUrl;
    private String technologies;
    private Boolean featured;
    private String problemStatement;
    private String solution;
    private String architecture;
    private String challenges;
    private String learnings;
    private String metrics;
    private Integer displayOrder;
    private Boolean published;
}