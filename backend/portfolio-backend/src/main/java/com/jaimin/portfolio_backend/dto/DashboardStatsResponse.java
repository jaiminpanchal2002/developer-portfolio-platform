package com.jaimin.portfolio_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private Long projects;
    private Long skills;
    private Long experiences;
    private Long educations;
    private Long certificates;
    private Long applications;
    private Integer profileScore;
    private Integer atsScore;
    private Long testimonials;
    private Long blogPosts;
    private Long unreadMessages;
    private Long chatbotInteractions30d;
    private Long pendingAppointments;
}