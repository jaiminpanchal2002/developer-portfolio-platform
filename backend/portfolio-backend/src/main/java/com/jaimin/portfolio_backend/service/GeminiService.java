package com.jaimin.portfolio_backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Thin client for Google's Gemini API — the one place in the codebase that
 * actually calls an LLM. Every "AI" feature (job match scoring, ATS
 * comparison, resume review, the chatbot) goes through here rather than each
 * maintaining its own HTTP + prompt + parsing boilerplate.
 *
 * Requires GEMINI_API_KEY to be set (see README). Every caller must handle
 * {@link GeminiUnavailableException} — free-tier quotas, missing keys, and
 * upstream hiccups are expected, not exceptional-exceptional, so callers are
 * expected to fall back to a deterministic result rather than break the page.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Free-form text completion. */
    public String generateText(String prompt) {
        return generateText(prompt, 0.6);
    }

    public String generateText(String prompt, double temperature) {
        if (!isConfigured()) {
            throw new GeminiUnavailableException("GEMINI_API_KEY is not configured");
        }

        String url = API_BASE + model + ":generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", temperature,
                        "maxOutputTokens", 1024,
                        // These are grounded comparison/QA tasks, not open-ended reasoning —
                        // extended thinking ~4x'd token usage and latency for identical
                        // output quality in testing, which matters when job matching fires
                        // several of these calls in parallel against a free-tier quota.
                        "thinkingConfig", Map.of("thinkingBudget", 0)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                JsonNode blockReason = root.path("promptFeedback").path("blockReason");
                throw new GeminiUnavailableException(
                        "Gemini returned no candidates" + (blockReason.isMissingNode() ? "" : " (blocked: " + blockReason.asText() + ")"));
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            StringBuilder text = new StringBuilder();
            for (JsonNode part : parts) {
                text.append(part.path("text").asText(""));
            }
            if (text.isEmpty()) {
                throw new GeminiUnavailableException("Gemini returned an empty response");
            }
            return text.toString();
        } catch (GeminiUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Gemini call failed: {}", e.getMessage());
            throw new GeminiUnavailableException("Gemini call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Asks Gemini for a JSON object matching the given shape description and
     * parses the result. Models routinely wrap JSON in ```json fences or add
     * stray prose despite instructions — this strips both before parsing.
     */
    public JsonNode generateJson(String prompt) {
        String raw = generateText(prompt, 0.3);
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            int firstNewline = cleaned.indexOf('\n');
            cleaned = firstNewline >= 0 ? cleaned.substring(firstNewline + 1) : cleaned;
            int lastFence = cleaned.lastIndexOf("```");
            if (lastFence >= 0) cleaned = cleaned.substring(0, lastFence);
        }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0 || end < start) {
            throw new GeminiUnavailableException("Gemini response did not contain a JSON object: " + raw);
        }
        cleaned = cleaned.substring(start, end + 1);
        try {
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new GeminiUnavailableException("Could not parse Gemini's JSON response: " + e.getMessage(), e);
        }
    }

    public static class GeminiUnavailableException extends RuntimeException {
        public GeminiUnavailableException(String message) {
            super(message);
        }

        public GeminiUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
