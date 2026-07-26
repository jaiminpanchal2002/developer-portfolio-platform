package com.jaimin.portfolio_backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.jaimin.portfolio_backend.entity.Certificate;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.service.CertificateService;
import com.jaimin.portfolio_backend.service.ExperienceService;
import com.jaimin.portfolio_backend.service.GeminiService;
import com.jaimin.portfolio_backend.service.ProfileService;
import com.jaimin.portfolio_backend.service.ProjectService;
import com.jaimin.portfolio_backend.service.SkillService;

import lombok.RequiredArgsConstructor;

/**
 * The public-facing ATS checker: a recruiter pastes a job description and
 * gets back how well it matches the candidate's actual uploaded resume.
 * Backed by Gemini when configured (real semantic comparison against the
 * resume text), falling back to a deterministic keyword overlap against the
 * structured profile data if Gemini is unavailable — same response shape
 * either way, so the frontend never needs to know which path ran.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicAtsController {

    private static final Logger log = LoggerFactory.getLogger(PublicAtsController.class);

    private final SkillService skillService;
    private final ProjectService projectService;
    private final ExperienceService experienceService;
    private final CertificateService certificateService;
    private final ProfileService profileService;
    private final GeminiService geminiService;

    // Fallback-only: used when Gemini isn't configured or the call fails.
    private static final String[] TECH_KEYWORDS = {
        "Java", "Spring Boot", "Spring", "Spring Security", "React", "Next.js", "Vue.js",
        "TypeScript", "JavaScript", "Node.js", "Python", "FastAPI", "PHP", "Laravel",
        "Flutter", "Docker", "Kubernetes", "SQL", "MySQL", "PostgreSQL",
        "MongoDB", "AWS", "Microservices", "REST APIs", "Git", "CI/CD", "Tailwind",
        "Redux", "Framer Motion", "GraphQL", "Lombok", "Hibernate", "JPA",
        "Firebase", "Stripe", "PayPal", "Twilio", "LangChain", "LangGraph", "RAG",
        "OpenAI", "Gemini", "OWASP", "Prometheus", "Grafana", "Helm", "ArgoCD"
    };

    @PostMapping("/ats-match")
    public ResponseEntity<?> evaluateJobDescriptionFit(@RequestBody Map<String, String> request) {
        String jd = request.get("jobDescription");
        if (jd == null || jd.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job description cannot be empty"));
        }

        Profile profile = profileService.getProfile();
        String resumeText = profile.getResumeText();

        if (geminiService.isConfigured() && resumeText != null && !resumeText.isBlank()) {
            try {
                return ResponseEntity.ok(evaluateWithGemini(resumeText, jd));
            } catch (GeminiService.GeminiUnavailableException e) {
                log.warn("ATS match falling back to keyword comparison: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(evaluateWithKeywords(jd));
    }

    private Map<String, Object> evaluateWithGemini(String resumeText, String jd) {
        String prompt = """
                You are an ATS (Applicant Tracking System) compatibility engine. Compare the CANDIDATE RESUME
                against the JOB DESCRIPTION and assess real compatibility — not just keyword overlap, but whether
                the candidate's actual experience and skills genuinely fit the role's requirements.

                Respond with ONLY a JSON object in exactly this shape, no markdown fences, no extra text:
                {
                  "matchPercentage": <integer 0-100>,
                  "matchedSkills": [<strings — requirements from the JD the resume genuinely satisfies>],
                  "missingSkills": [<strings — requirements from the JD the resume does not demonstrate>],
                  "analysisReport": "<2-4 sentences: an honest, specific assessment of fit, referencing the candidate's actual background>"
                }

                CANDIDATE RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """.formatted(resumeText, jd);

        JsonNode result = geminiService.generateJson(prompt);

        Map<String, Object> response = new HashMap<>();
        response.put("matchPercentage", clamp(result.path("matchPercentage").asInt(50)));
        response.put("matchedSkills", toStringList(result.path("matchedSkills")));
        response.put("missingSkills", toStringList(result.path("missingSkills")));
        response.put("analysisReport", result.path("analysisReport").asText("Analysis unavailable."));
        response.put("source", "gemini");
        return response;
    }

    private static int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private static List<String> toStringList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode n : arrayNode) list.add(n.asText());
        }
        return list;
    }

    // ─── Deterministic fallback (no Gemini key / call failed) ─────────────

    private Map<String, Object> evaluateWithKeywords(String jd) {
        String jdLower = jd.toLowerCase();

        List<Skill> skills = skillService.getAllSkills();
        List<Project> projects = projectService.getAllProjects();
        List<Experience> experiences = experienceService.getAllExperiences();
        List<Certificate> certificates = certificateService.getAllCertificates();

        Set<String> matchedTech = new HashSet<>();
        Set<String> missingTech = new HashSet<>();

        for (String tech : TECH_KEYWORDS) {
            String techLower = tech.toLowerCase();
            if (jdLower.contains(techLower)) {
                boolean hasTech = false;
                for (Skill skill : skills) {
                    if (skill.getName().toLowerCase().contains(techLower) || techLower.contains(skill.getName().toLowerCase())) {
                        hasTech = true;
                        break;
                    }
                }
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

        for (Skill s : skills) {
            if (jdLower.contains(s.getName().toLowerCase())) {
                matchedTech.add(s.getName());
            }
        }

        int matchedCount = matchedTech.size();
        int missingCount = missingTech.size();
        int totalRequirements = matchedCount + missingCount;

        int score = totalRequirements == 0
                ? 65
                : (int) Math.round(((double) matchedCount / totalRequirements) * 100);

        score += Math.min(experiences.size() * 3, 10) + Math.min(certificates.size() * 2, 8);
        score = Math.max(35, Math.min(98, score));

        Map<String, Object> response = new HashMap<>();
        response.put("matchPercentage", score);
        response.put("matchedSkills", matchedTech);
        response.put("missingSkills", missingTech);
        response.put("analysisReport", generateAnalysisReport(score, missingTech));
        response.put("source", "keyword-fallback");
        return response;
    }

    private String generateAnalysisReport(int score, Set<String> missing) {
        if (score >= 85) {
            return "Excellent Fit! Your profile matches almost all required skills. Experience and project portfolios demonstrate high alignment with this job role.";
        } else if (score >= 70) {
            StringBuilder sb = new StringBuilder("Strong Match. Your profile demonstrates solid capabilities. ");
            if (!missing.isEmpty()) {
                sb.append("To maximize chances, highlight experiences with: ").append(String.join(", ", missing)).append(".");
            }
            return sb.toString();
        } else {
            StringBuilder sb = new StringBuilder("Moderate Fit. There are core technology mismatches. ");
            if (!missing.isEmpty()) {
                sb.append("Consider detailing project portfolios involving: ").append(String.join(", ", missing)).append(".");
            }
            return sb.toString();
        }
    }
}
