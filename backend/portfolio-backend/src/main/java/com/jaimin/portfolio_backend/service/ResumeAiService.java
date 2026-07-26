package com.jaimin.portfolio_backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.jaimin.portfolio_backend.dto.ResumeAnalysisDTO;

/**
 * Resume quality/ATS-readiness review. Backed by Gemini when configured —
 * a genuine read of the resume's actual content and structure — falling
 * back to the deterministic heuristic scorer (structural checks + a fixed
 * keyword list) when it isn't.
 */
@Service
public class ResumeAiService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAiService.class);

    private final GeminiService geminiService;

    public ResumeAiService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Fallback-only: used when Gemini isn't configured or the call fails.
    private static final List<String> ATS_KEYWORDS = List.of(
            "Java", "Spring Boot", "Spring Security", "React", "Next.js", "Vue.js",
            "TypeScript", "JavaScript", "Python", "FastAPI", "PHP", "Laravel",
            "Flutter", "Docker", "Kubernetes", "AWS", "CI/CD", "PostgreSQL", "MySQL",
            "MongoDB", "REST API", "JWT", "OAuth", "Microservices", "Git", "GitLab", "GitHub",
            "Unit Testing", "Hibernate", "Lombok", "Redis", "Cloud", "Agile",
            "Firebase", "Stripe", "PayPal", "Twilio", "LangChain", "RAG",
            "Vector Database", "OpenAI", "Gemini", "OWASP", "Prometheus", "Grafana",
            "Helm", "ArgoCD", "PHPUnit", "Pest", "JUnit", "pytest"
    );

    public ResumeAnalysisDTO analyzeResume(String resumeText) {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResumeAnalysisDTO.builder()
                    .score(20)
                    .atsScore(15)
                    .strengths(List.of("None detected"))
                    .weaknesses(List.of("Empty Resume: Please upload a valid PDF or paste your resume content."))
                    .missingKeywords(ATS_KEYWORDS)
                    .recommendation("Upload a completed resume containing your profile details, skills, experience, and projects.")
                    .build();
        }

        if (geminiService.isConfigured()) {
            try {
                return analyzeWithGemini(resumeText);
            } catch (GeminiService.GeminiUnavailableException e) {
                log.warn("Resume analysis falling back to heuristic scorer: {}", e.getMessage());
            }
        }

        return analyzeWithHeuristics(resumeText);
    }

    private ResumeAnalysisDTO analyzeWithGemini(String resumeText) {
        String prompt = """
                You are an expert ATS (Applicant Tracking System) resume reviewer for software engineering roles.
                Review the resume below on its own merits — structure, clarity, quantified achievements, technical
                depth, and general ATS-parseability. This is a general review, not against any specific job posting.

                Respond with ONLY a JSON object in exactly this shape, no markdown fences, no extra text:
                {
                  "score": <integer 0-100, overall resume quality>,
                  "atsScore": <integer 0-100, ATS-parser compatibility specifically>,
                  "strengths": [<3-6 short strings, specific to this resume's actual content>],
                  "weaknesses": [<2-5 short strings, specific and actionable>],
                  "missingKeywords": [<technologies/skills this resume's target roles would typically expect but this resume doesn't mention>],
                  "recommendation": "<2-3 sentences of concrete, specific advice>"
                }

                RESUME:
                %s
                """.formatted(resumeText);

        JsonNode result = geminiService.generateJson(prompt);

        return ResumeAnalysisDTO.builder()
                .score(clamp(result.path("score").asInt(60)))
                .atsScore(clamp(result.path("atsScore").asInt(60)))
                .strengths(toStringList(result.path("strengths")))
                .weaknesses(toStringList(result.path("weaknesses")))
                .missingKeywords(toStringList(result.path("missingKeywords")))
                .recommendation(result.path("recommendation").asText("Analysis unavailable."))
                .build();
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

    private ResumeAnalysisDTO analyzeWithHeuristics(String resumeText) {
        String textLower = resumeText.toLowerCase();

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        int score = 40; // Base score for non-empty resume

        boolean hasEmail = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(resumeText).find();
        boolean hasPhone = Pattern.compile("(\\+?\\d{1,3}[- ]?)?\\d{10}").matcher(resumeText).find() || textLower.contains("phone") || textLower.contains("mobile");
        boolean hasLinkedIn = textLower.contains("linkedin.com") || textLower.contains("linkedin");
        boolean hasGitHub = textLower.contains("github.com") || textLower.contains("github");

        if (hasEmail && hasPhone) {
            strengths.add("Contact Information: Email and Phone number are clearly visible.");
            score += 10;
        } else {
            weaknesses.add("Missing Core Contact Details: Ensure your email and phone number are present and easily readable.");
            score -= 5;
        }

        if (hasLinkedIn || hasGitHub) {
            strengths.add("Online Presence: Profile links (LinkedIn/GitHub) detected.");
            score += 5;
        } else {
            weaknesses.add("Missing Social Anchors: Adding a GitHub/LinkedIn link increases ATS trust.");
            score -= 2;
        }

        if (textLower.contains("experience") || textLower.contains("work history") || textLower.contains("employment") || textLower.contains("career history")) {
            strengths.add("Work Experience Section: Defined career history.");
            score += 15;
        } else {
            weaknesses.add("Missing Work Experience Section: Clearly list your professional experience.");
            score -= 10;
        }

        if (textLower.contains("education") || textLower.contains("university") || textLower.contains("college") || textLower.contains("degree") || textLower.contains("academic")) {
            strengths.add("Education Section: Stated academic background.");
            score += 10;
        } else {
            weaknesses.add("Missing Education Section: Include your degrees, college names, and graduation dates.");
            score -= 5;
        }

        if (textLower.contains("project") || textLower.contains("portfolio") || textLower.contains("personal projects")) {
            strengths.add("Projects Section: Highlighted practical assignments.");
            score += 10;
        } else {
            weaknesses.add("Missing Projects Section: Detail 2-3 technical projects along with the tech stacks utilized.");
            score -= 5;
        }

        if (textLower.contains("skills") || textLower.contains("technolog") || textLower.contains("technical skills") || textLower.contains("expertise")) {
            strengths.add("Skills Section: Defined skill list.");
            score += 10;
        } else {
            weaknesses.add("Missing Skills Section: Group your technical skills (e.g. Frontend, Backend, Tools).");
            score -= 10;
        }

        int foundKeywordsCount = 0;
        for (String keyword : ATS_KEYWORDS) {
            boolean found = textLower.contains(keyword.toLowerCase())
                    || (keyword.equalsIgnoreCase("Spring Boot") && (textLower.contains("spring framework") || textLower.contains("spring boot") || textLower.contains("spring mvc")))
                    || (keyword.equalsIgnoreCase("React") && textLower.contains("next.js"))
                    || (keyword.equalsIgnoreCase("CI/CD") && (textLower.contains("jenkins") || textLower.contains("github actions") || textLower.contains("gitlab ci")))
                    || (keyword.equalsIgnoreCase("PostgreSQL") && textLower.contains("postgres"))
                    || (keyword.equalsIgnoreCase("Cloud") && (textLower.contains("aws") || textLower.contains("azure") || textLower.contains("gcp") || textLower.contains("cloud computing")));

            if (found) {
                foundKeywordsCount++;
            } else {
                missingKeywords.add(keyword);
            }
        }

        int keywordMatchPercentage = (foundKeywordsCount * 100) / ATS_KEYWORDS.size();
        score += (int) (keywordMatchPercentage * 0.35);

        int atsScore = Math.max(25, Math.min(score, 98));
        int resumeScore = Math.max(30, Math.min(score + 2, 100));

        if (keywordMatchPercentage > 50) {
            strengths.add("Tech Stack Keyword Density: Strong matching for developer technology terms (" + keywordMatchPercentage + "% coverage).");
        } else {
            weaknesses.add("Low Keyword Density: Add more relevant industry buzzwords (" + keywordMatchPercentage + "% coverage).");
        }

        String recommendation;
        if (atsScore >= 80) {
            recommendation = "Excellent! Your resume is highly optimized for ATS scanners. Keep it updated and target high-end engineering positions.";
        } else if (atsScore >= 60) {
            recommendation = "Good! Your resume has core structures. To improve, integrate missing keywords (like "
                    + (missingKeywords.isEmpty() ? "Docker" : String.join(", ", missingKeywords.stream().limit(3).toList())) + ") and describe achievements with numbers and metrics.";
        } else {
            recommendation = "Needs Work. Make sure to structure your resume using standard headers (Experience, Projects, Education, Skills). Add key technology terms relative to the roles you are targeting.";
        }

        return ResumeAnalysisDTO.builder()
                .score(resumeScore)
                .atsScore(atsScore)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .missingKeywords(missingKeywords)
                .recommendation(recommendation)
                .build();
    }
}
