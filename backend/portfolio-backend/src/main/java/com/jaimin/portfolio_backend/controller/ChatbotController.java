package com.jaimin.portfolio_backend.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.dto.ChatMessage;
import com.jaimin.portfolio_backend.dto.ChatRequest;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.repository.CertificateRepository;
import com.jaimin.portfolio_backend.repository.EducationRepository;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;
import com.jaimin.portfolio_backend.repository.ProjectRepository;
import com.jaimin.portfolio_backend.repository.SkillRepository;
import com.jaimin.portfolio_backend.service.GeminiService;
import com.jaimin.portfolio_backend.service.ProfileService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * The public portfolio chatbot — grounded entirely in the real profile data
 * (skills, projects, experience, education, certificates), not a generic
 * assistant. Public + unauthenticated by nature, so a simple per-IP rate
 * limit guards the real API key behind it from being run up by abuse.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class ChatbotController {

    private static final int MAX_MESSAGE_LENGTH = 500;
    private static final int MAX_HISTORY_TURNS = 6;
    private static final int RATE_LIMIT_PER_WINDOW = 20;
    private static final long RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000L;

    private final GeminiService geminiService;
    private final ProfileService profileService;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final CertificateRepository certificateRepository;

    private final Map<String, ConcurrentLinkedDeque<Long>> requestLog = new ConcurrentHashMap<>();

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        String message = request.getMessage();
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        if (message.length() > MAX_MESSAGE_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is too long"));
        }

        if (!isWithinRateLimit(clientIp(httpRequest))) {
            return ResponseEntity.status(429).body(Map.of(
                    "reply", "I've had a lot of questions in the last few minutes — give it a short break and try again."));
        }

        if (!geminiService.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                    "reply", "The chat assistant isn't switched on yet — feel free to reach out through the contact form below in the meantime."));
        }

        String prompt = buildPrompt(message, request.getHistory());

        try {
            String reply = geminiService.generateText(prompt, 0.7);
            return ResponseEntity.ok(Map.of("reply", reply.trim()));
        } catch (GeminiService.GeminiUnavailableException e) {
            return ResponseEntity.ok(Map.of(
                    "reply", "Sorry, I'm having trouble responding right now — please try again in a moment, or use the contact form below."));
        }
    }

    private boolean isWithinRateLimit(String clientIp) {
        long now = System.currentTimeMillis();
        ConcurrentLinkedDeque<Long> timestamps = requestLog.computeIfAbsent(clientIp, k -> new ConcurrentLinkedDeque<>());
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > RATE_LIMIT_WINDOW_MS) {
            timestamps.pollFirst();
        }
        if (timestamps.size() >= RATE_LIMIT_PER_WINDOW) {
            return false;
        }
        timestamps.addLast(now);
        return true;
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String buildPrompt(String message, List<ChatMessage> history) {
        Profile profile = profileService.getProfile();
        String name = profile.getFullName() != null ? profile.getFullName() : "the portfolio owner";
        String headline = profile.getHeadline() != null ? profile.getHeadline() : "a software engineer";

        StringBuilder historyText = new StringBuilder();
        if (history != null) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS);
            for (ChatMessage m : history.subList(start, history.size())) {
                historyText.append("user".equalsIgnoreCase(m.getRole()) ? "Visitor: " : "Assistant: ")
                        .append(m.getText()).append("\n");
            }
        }

        return """
                You are the portfolio assistant speaking on behalf of %s, a %s. You are NOT %s — you represent
                him to site visitors. Answer using ONLY the information below; cite real projects and skills by
                name rather than being vague. Keep replies concise (2-4 sentences unless the visitor asks for
                detail). Be warm and direct, never robotic. If asked something the information below doesn't
                cover, say so honestly and suggest the visitor use the contact form — never invent facts,
                job history, or availability.

                %s

                %s
                Visitor: %s
                Assistant:
                """.formatted(name, headline, name, buildContext(), historyText, message);
    }

    private String buildContext() {
        Profile profile = profileService.getProfile();
        StringBuilder sb = new StringBuilder();

        sb.append("PROFILE\n");
        sb.append("Name: ").append(nullSafe(profile.getFullName())).append("\n");
        sb.append("Headline: ").append(nullSafe(profile.getHeadline())).append("\n");
        sb.append("Location: ").append(nullSafe(profile.getLocation())).append("\n");
        sb.append("About: ").append(nullSafe(profile.getAbout())).append("\n");
        sb.append("Contact email: ").append(nullSafe(profile.getEmail())).append("\n");
        if (profile.getGithubUrl() != null && !profile.getGithubUrl().isBlank()) {
            sb.append("GitHub: ").append(profile.getGithubUrl()).append("\n");
        }
        if (profile.getLinkedinUrl() != null && !profile.getLinkedinUrl().isBlank()) {
            sb.append("LinkedIn: ").append(profile.getLinkedinUrl()).append("\n");
        }

        sb.append("\nSKILLS\n");
        skillRepository.findAll().forEach(s -> sb.append("- ").append(s.getName())
                .append(" (").append(nullSafe(s.getCategory())).append(", ")
                .append(s.getProficiency()).append("% proficiency)\n"));

        sb.append("\nPROJECTS\n");
        projectRepository.findAll().forEach(p -> sb.append("- ").append(p.getTitle()).append(": ")
                .append(nullSafe(p.getDescription())).append(" [Tech: ").append(nullSafe(p.getTechnologies())).append("]\n"));

        sb.append("\nEXPERIENCE\n");
        experienceRepository.findAll().forEach(e -> sb.append("- ").append(nullSafe(e.getPosition()))
                .append(" at ").append(nullSafe(e.getCompany()))
                .append(Boolean.TRUE.equals(e.getCurrentlyWorking()) ? " (current)" : "")
                .append(": ").append(nullSafe(e.getDescription())).append("\n"));

        sb.append("\nEDUCATION\n");
        educationRepository.findAll().forEach(ed -> sb.append("- ").append(nullSafe(ed.getDegree()))
                .append(ed.getFieldOfStudy() != null ? " in " + ed.getFieldOfStudy() : "")
                .append(", ").append(nullSafe(ed.getInstitution()))
                .append(" (").append(ed.getStartYear()).append("-").append(ed.getEndYear()).append(")\n"));

        sb.append("\nCERTIFICATES\n");
        certificateRepository.findAll().forEach(c -> sb.append("- ").append(c.getTitle())
                .append(" from ").append(nullSafe(c.getIssuer())).append("\n"));

        return sb.toString();
    }

    private static String nullSafe(String value) {
        return value != null ? value : "";
    }
}
