package com.jaimin.portfolio_backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.entity.Certificate;
import com.jaimin.portfolio_backend.service.SkillService;
import com.jaimin.portfolio_backend.service.ProjectService;
import com.jaimin.portfolio_backend.service.ExperienceService;
import com.jaimin.portfolio_backend.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicAtsController {

    private final SkillService skillService;
    private final ProjectService projectService;
    private final ExperienceService experienceService;
    private final CertificateService certificateService;

    // Standard high-demand technologies list to check for overlap
    private static final String[] TECH_KEYWORDS = {
        "Java", "Spring Boot", "Spring", "React", "Next.js", "TypeScript", "JavaScript", 
        "Node.js", "Python", "Docker", "Kubernetes", "SQL", "MySQL", "PostgreSQL", 
        "MongoDB", "AWS", "Microservices", "REST APIs", "Git", "CI/CD", "Tailwind", 
        "Redux", "Framer Motion", "GraphQL", "Lombok", "Hibernate", "JPA"
    };

    @PostMapping("/ats-match")
    public ResponseEntity<?> evaluateJobDescriptionFit(@RequestBody Map<String, String> request) {
        String jd = request.get("jobDescription");
        if (jd == null || jd.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job description cannot be empty"));
        }

        String jdLower = jd.toLowerCase();

        // Fetch candidate details
        List<Skill> skills = skillService.getAllSkills();
        List<Project> projects = projectService.getAllProjects();
        List<Experience> experiences = experienceService.getAllExperiences();
        List<Certificate> certificates = certificateService.getAllCertificates();

        Set<String> matchedTech = new HashSet<>();
        Set<String> missingTech = new HashSet<>();

        // 1. Evaluate tech keywords in job description
        for (String tech : TECH_KEYWORDS) {
            String techLower = tech.toLowerCase();
            // Check if JD mentions this tech
            if (jdLower.contains(techLower)) {
                // Check if candidate has this tech in skills, projects description, or experiences
                boolean hasTech = false;
                
                // Check in skills
                for (Skill skill : skills) {
                    if (skill.getName().toLowerCase().contains(techLower) || techLower.contains(skill.getName().toLowerCase())) {
                        hasTech = true;
                        break;
                    }
                }
                
                // Check in projects
                if (!hasTech) {
                    for (Project project : projects) {
                        if (project.getTechnologies().toLowerCase().contains(techLower) || project.getDescription().toLowerCase().contains(techLower)) {
                            hasTech = true;
                            break;
                        }
                    }
                }

                if (hasTech) {
                    matchedTech.add(tech);
                } else {
                    missingTech.add(tech);
                }
            }
        }

        // 2. Fallback check for any Jaimin's custom skills directly inside JD
        for (Skill s : skills) {
            String skillNameLower = s.getName().toLowerCase();
            if (jdLower.contains(skillNameLower)) {
                matchedTech.add(s.getName());
            }
        }

        // 3. Score calculation logic
        int matchedCount = matchedTech.size();
        int missingCount = missingTech.size();
        int totalRequirements = matchedCount + missingCount;

        int score = 0;
        if (totalRequirements == 0) {
            // JD doesn't contain any direct tech keywords, evaluate simple text keywords matching
            // Default baseline match
            score = 65; 
        } else {
            score = (int) Math.round(((double) matchedCount / totalRequirements) * 100);
        }

        // Add small weight bonuses for experiences and certificates
        int experienceBonus = Math.min(experiences.size() * 3, 10);
        int certificateBonus = Math.min(certificates.size() * 2, 8);
        score += (experienceBonus + certificateBonus);

        // Clamp between 35% and 98% (leaving room for minor differences)
        score = Math.max(35, Math.min(98, score));

        // Generate feedback text
        String report = generateAnalysisReport(score, matchedTech, missingTech);

        Map<String, Object> response = new HashMap<>();
        response.put("matchPercentage", score);
        response.put("matchedSkills", matchedTech);
        response.put("missingSkills", missingTech);
        response.put("analysisReport", report);

        return ResponseEntity.ok(response);
    }

    private String generateAnalysisReport(int score, Set<String> matched, Set<String> missing) {
        if (score >= 85) {
            return "Excellent Fit! Your profile matches almost all required skills. Experience and project portfolios demonstrate high alignment with this job role.";
        } else if (score >= 70) {
            StringBuilder sb = new StringBuilder("Strong Match. Your profile demonstrates solid capabilities. ");
            if (!missing.isEmpty()) {
                sb.append("To maximize chances, highlight experiences with: ")
                  .append(String.join(", ", missing))
                  .append(".");
            }
            return sb.toString();
        } else {
            StringBuilder sb = new StringBuilder("Moderate Fit. There are core technology mismatches. ");
            if (!missing.isEmpty()) {
                sb.append("Consider detailing project portfolios involving: ")
                  .append(String.join(", ", missing))
                  .append(".");
            }
            return sb.toString();
        }
    }
}
