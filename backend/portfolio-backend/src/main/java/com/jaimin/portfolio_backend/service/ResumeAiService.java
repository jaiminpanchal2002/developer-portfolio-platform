package com.jaimin.portfolio_backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.ResumeAnalysisDTO;

@Service
public class ResumeAiService {

    // Common technical keywords to check for
    private static final List<String> ATS_KEYWORDS = List.of(
            "Java", "Spring Boot", "React", "Next.js", "TypeScript", "JavaScript",
            "Docker", "Kubernetes", "AWS", "CI/CD", "PostgreSQL", "MySQL", 
            "REST API", "JWT", "Microservices", "Git", "GitLab", "GitHub", 
            "Unit Testing", "Hibernate", "Lombok", "Redis", "Cloud", "Agile"
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

        String textLower = resumeText.toLowerCase();

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        
        int score = 40; // Base score for non-empty resume

        // 1. Check for Contact Details
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

        // 2. Check for key sections
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

        // 3. Keyword Match Analysis + Synonym Mapping
        int foundKeywordsCount = 0;
        for (String keyword : ATS_KEYWORDS) {
            boolean found = false;
            // Exact keyword check
            if (textLower.contains(keyword.toLowerCase())) {
                found = true;
            } else {
                // Semantic synonym maps check
                if (keyword.equalsIgnoreCase("Spring Boot") && (textLower.contains("spring framework") || textLower.contains("spring boot") || textLower.contains("spring MVC"))) {
                    found = true;
                } else if (keyword.equalsIgnoreCase("React") && textLower.contains("next.js")) {
                    found = true;
                } else if (keyword.equalsIgnoreCase("CI/CD") && (textLower.contains("jenkins") || textLower.contains("github actions") || textLower.contains("gitlab ci"))) {
                    found = true;
                } else if (keyword.equalsIgnoreCase("PostgreSQL") && textLower.contains("postgres")) {
                    found = true;
                } else if (keyword.equalsIgnoreCase("Cloud") && (textLower.contains("aws") || textLower.contains("azure") || textLower.contains("gcp") || textLower.contains("cloud computing"))) {
                    found = true;
                }
            }

            if (found) {
                foundKeywordsCount++;
            } else {
                missingKeywords.add(keyword);
            }
        }

        int keywordMatchPercentage = (foundKeywordsCount * 100) / ATS_KEYWORDS.size();
        score += (int) (keywordMatchPercentage * 0.35); // Weight of keyword overlap (max +35)

        // Contact info detail bonus/penalty adjustments
        int atsScore = Math.max(25, Math.min(score, 98));
        int resumeScore = Math.max(30, Math.min(score + 2, 100));

        if (keywordMatchPercentage > 50) {
            strengths.add("Tech Stack Keyword Density: Strong matching for developer technology terms (" + keywordMatchPercentage + "% coverage).");
        } else {
            weaknesses.add("Low Keyword Density: Add more relevant industry buzzwords (" + keywordMatchPercentage + "% coverage).");
        }

        // Actionable Recommendation
        String recommendation;
        if (atsScore >= 80) {
            recommendation = "Excellent! Your resume is highly optimized for ATS scanners. Keep it updated and target high-end engineering positions.";
        } else if (atsScore >= 60) {
            recommendation = "Good! Your resume has core structures. To improve, integrate missing keywords (like " + 
                (missingKeywords.isEmpty() ? "Docker" : String.join(", ", missingKeywords.stream().limit(3).toList())) + ") and describe achievements with numbers and metrics.";
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