package com.jaimin.portfolio_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDTO {

    private String title;
    private String company;
    private String location;
    private String applyLink;
    private String description;
    private String salary;

    private Integer matchScore;

    private List<String> matchedSkills;
    private List<String> missingSkills;

    private String recommendation;

    private String recruiterEmail;

    private String roadmap;

    private String createdAt;
    private String source;
}