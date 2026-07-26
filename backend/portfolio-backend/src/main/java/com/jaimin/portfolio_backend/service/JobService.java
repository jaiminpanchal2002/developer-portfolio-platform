package com.jaimin.portfolio_backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaimin.portfolio_backend.dto.JobDTO;
import com.jaimin.portfolio_backend.dto.SkillMatchResult;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;
import com.jaimin.portfolio_backend.repository.ProjectRepository;
import com.jaimin.portfolio_backend.repository.SkillRepository;

@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final RestTemplate restTemplate;
    private final AiJobMatchService aiJobMatchService;
    private final GeminiService geminiService;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ExperienceRepository experienceRepository;
    private final com.jaimin.portfolio_backend.repository.CertificateRepository certificateRepository;
    private final ProfileService profileService;

    @Value("${adzuna.app.id:}")
    private String appId;

    @Value("${adzuna.app.key:}")
    private String appKey;

    public JobService(
            RestTemplate restTemplate,
            AiJobMatchService aiJobMatchService,
            GeminiService geminiService,
            SkillRepository skillRepository,
            ProjectRepository projectRepository,
            ExperienceRepository experienceRepository,
            com.jaimin.portfolio_backend.repository.CertificateRepository certificateRepository,
            ProfileService profileService) {
        this.restTemplate = restTemplate;
        this.aiJobMatchService = aiJobMatchService;
        this.geminiService = geminiService;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.experienceRepository = experienceRepository;
        this.certificateRepository = certificateRepository;
        this.profileService = profileService;
    }

    public List<JobDTO> getJobs() {
        return searchJobs("Developer", "in", false);
    }

    public List<JobDTO> searchJobs(String keyword, String country, boolean remote) {
        if (country == null || country.isEmpty()) {
            country = "in";
        }
        if (keyword == null || keyword.isEmpty()) {
            keyword = "Developer";
        }

        List<JobDTO> jobList = new ArrayList<>();

        // 1. Try to fetch from live Adzuna API if keys are configured
        if (appId != null && !appId.isEmpty() && appKey != null && !appKey.isEmpty()) {
            try {
                String remoteParam = remote ? "&where=remote" : "";
                // Capped at 8 (was 15): each result now gets a real per-job Gemini
                // comparison against the resume, run in parallel below — 8 keeps
                // a single search well within free-tier rate limits and a few
                // seconds of wall time instead of dozens of sequential LLM calls.
                String url = "https://api.adzuna.com/v1/api/jobs/"
                        + country.toLowerCase()
                        + "/search/1"
                        + "?app_id=" + appId
                        + "&app_key=" + appKey
                        + "&results_per_page=8"
                        + "&what=" + keyword
                        + "&max_days_old=14"
                        + remoteParam;

                String response = restTemplate.getForObject(url, String.class);
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response);
                JsonNode resultsNode = root.path("results");

                if (resultsNode.isArray()) {
                    List<CompletableFuture<JobDTO>> futures = new ArrayList<>();
                    for (JsonNode node : resultsNode) {
                        futures.add(CompletableFuture.supplyAsync(() -> buildJobFromAdzunaNode(node)));
                    }
                    jobList = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());
                }
            } catch (Exception e) {
                log.warn("Error calling Adzuna API: {}. Using fallback mock jobs.", e.getMessage());
            }
        }

        // 2. If live search is empty or failed, load premium mock jobs matching the keyword
        if (jobList.isEmpty()) {
            jobList = generateMockJobs(keyword, country);
        }

        return jobList;
    }

    private JobDTO buildJobFromAdzunaNode(JsonNode node) {
        String title = node.path("title").asText();
        String company = node.path("company").path("display_name").asText("Confidential");
        String location = node.path("location").path("display_name").asText("Remote");
        String description = node.path("description").asText("");
        String applyLink = node.path("redirect_url").asText("https://www.adzuna.com");
        String rawCreated = node.path("created").asText(""); // e.g. "2026-06-10T12:00:00Z"
        String postingDate = rawCreated.length() >= 10 ? rawCreated.substring(0, 10) : "Recent";

        double salaryMin = node.path("salary_min").asDouble(0);
        double salaryMax = node.path("salary_max").asDouble(0);
        String salary = "Competitive";
        if (salaryMin > 0 && salaryMax > 0) {
            salary = String.format("%.0f - %.0f", salaryMin, salaryMax);
        } else if (salaryMin > 0) {
            salary = String.format("From %.0f", salaryMin);
        }

        SkillMatchResult match = calculateMatchForJob(description);

        return JobDTO.builder()
                .title(title)
                .company(company)
                .location(location)
                .description(description)
                .applyLink(applyLink)
                .salary(salary)
                .matchScore(match.getScore())
                .matchedSkills(match.getMatchedSkills())
                .missingSkills(match.getMissingSkills())
                .recommendation(match.getRecommendation())
                .roadmap(match.getRoadmap())
                .recruiterEmail("hr@" + company.toLowerCase().replaceAll("[^a-z]", "") + ".com")
                .createdAt(postingDate)
                .source("Adzuna")
                .build();
    }

    public String getLiveJobs(String country) {
        if (appId == null || appId.isEmpty() || appKey == null || appKey.isEmpty()) {
            return "{\"results\":[]}";
        }
        String url = "https://api.adzuna.com/v1/api/jobs/"
                + country
                + "/search/1"
                + "?app_id=" + appId
                + "&app_key=" + appKey
                + "&results_per_page=20";

        return restTemplate.getForObject(url, String.class);
    }

    /**
     * Real match: compares the actual resume text against this specific job
     * description via Gemini. Falls back to the deterministic keyword-overlap
     * matcher (AiJobMatchService) when Gemini isn't configured or the call
     * fails for this job — every job still gets a score either way.
     */
    private SkillMatchResult calculateMatchForJob(String description) {
        Profile profile = profileService.getProfile();
        String resumeText = profile != null ? profile.getResumeText() : "";

        if (geminiService.isConfigured() && resumeText != null && !resumeText.isBlank()) {
            try {
                return matchWithGemini(resumeText, description);
            } catch (GeminiService.GeminiUnavailableException e) {
                log.warn("Job match falling back to deterministic matcher: {}", e.getMessage());
            }
        }

        return calculateMatchDeterministic(description);
    }

    private SkillMatchResult matchWithGemini(String resumeText, String jobDescription) {
        String prompt = """
                You are an AI recruiter assistant. Compare the CANDIDATE RESUME against the JOB DESCRIPTION and
                assess genuine fit — actual experience and demonstrated skills, not just keyword overlap.

                Respond with ONLY a JSON object in exactly this shape, no markdown fences, no extra text:
                {
                  "score": <integer 0-100>,
                  "matchedSkills": [<strings — requirements from the job the resume genuinely satisfies>],
                  "missingSkills": [<strings — requirements from the job the resume does not demonstrate, short skill names not full sentences>],
                  "recommendation": "<1-2 sentences: should this candidate apply, and why>"
                }

                CANDIDATE RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """.formatted(resumeText, jobDescription);

        JsonNode result = geminiService.generateJson(prompt);

        List<String> matched = toStringList(result.path("matchedSkills"));
        List<String> missing = toStringList(result.path("missingSkills"));

        return SkillMatchResult.builder()
                .score(Math.max(0, Math.min(100, result.path("score").asInt(50))))
                .matchedSkills(matched)
                .missingSkills(missing)
                .recommendation(result.path("recommendation").asText("Assessment unavailable."))
                .roadmap(aiJobMatchService.buildRoadmap(missing))
                .build();
    }

    private static List<String> toStringList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode n : arrayNode) list.add(n.asText());
        }
        return list;
    }

    private SkillMatchResult calculateMatchDeterministic(String description) {
        List<String> userSkills = skillRepository.findAll()
                .stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        Profile profile = profileService.getProfile();
        String profileHeadline = profile != null ? profile.getHeadline() : "";
        String resumeText = profile != null ? profile.getResumeText() : "";

        String experienceText = experienceRepository.findAll()
                .stream()
                .map(exp -> exp.getPosition() + " at " + exp.getCompany() + ": " + exp.getDescription())
                .collect(Collectors.joining("\n"));

        String projectsText = projectRepository.findAll()
                .stream()
                .map(proj -> proj.getTitle() + ": " + proj.getDescription() + ". Technologies: " + proj.getTechnologies())
                .collect(Collectors.joining("\n"));

        String certificatesText = certificateRepository.findAll()
                .stream()
                .map(c -> c.getTitle() + " from " + c.getIssuer())
                .collect(Collectors.joining("\n"));

        return aiJobMatchService.calculateMatch(
                description,
                userSkills,
                profileHeadline,
                experienceText,
                projectsText,
                resumeText,
                certificatesText);
    }

    private List<JobDTO> generateMockJobs(String keyword, String country) {
        String currency = getCurrencySymbol(country);

        String capKeyword = "Developer";
        if (keyword != null && !keyword.trim().isEmpty()) {
            String clean = keyword.trim();
            capKeyword = clean.substring(0, 1).toUpperCase() + (clean.length() > 1 ? clean.substring(1) : "");
        }
        final String cap = capKeyword;

        List<CompletableFuture<JobDTO>> futures = new ArrayList<>();
        futures.add(CompletableFuture.supplyAsync(() -> createMockJob(
            "Senior " + cap + " Engineer",
            "GlobalTech Inc",
            "Bangalore, India",
            currency + "1,200,000 - " + currency + "1,800,000",
            "Looking for an experienced engineer specialized in " + cap + ". You will be building scalability features, optimizing backend performance, and integrating " + cap + " services. Strong understanding of architecture, relational databases, and modern software design patterns is highly required."
        )));

        futures.add(CompletableFuture.supplyAsync(() -> createMockJob(
            cap + " Systems Specialist",
            "Acuity Corp",
            "Remote",
            currency + "900,000 - " + currency + "1,300,000",
            "Join our core engineering team. The ideal candidate has hands-on experience with " + cap + " and cloud environments. You will implement robust APIs, write unit tests, and collaborate to deploy secure " + cap + " modules."
        )));

        futures.add(CompletableFuture.supplyAsync(() -> createMockJob(
            "Full Stack Engineer (" + cap + " & React)",
            "Linear",
            "Mumbai, India",
            currency + "1,000,000 - " + currency + "1,500,000",
            "We are seeking a versatile Full Stack Developer to build user-friendly interfaces and robust backend logic. Tech stack includes " + cap + ", React, TypeScript, and modern styling libraries. Experience deploying applications to cloud services and managing configurations with " + cap + " is a major advantage."
        )));

        return futures.stream().map(CompletableFuture::join).collect(Collectors.toList());
    }

    private JobDTO createMockJob(String title, String company, String location, String salary, String description) {
        SkillMatchResult match = calculateMatchForJob(description);
        return JobDTO.builder()
                .title(title)
                .company(company)
                .location(location)
                .salary(salary)
                .description(description)
                .matchScore(match.getScore())
                .matchedSkills(match.getMatchedSkills())
                .missingSkills(match.getMissingSkills())
                .recommendation(match.getRecommendation())
                .roadmap(match.getRoadmap())
                .recruiterEmail("hiring@" + company.toLowerCase().replaceAll("[^a-z]", "") + ".com")
                .createdAt(java.time.LocalDate.now().minusDays(2).toString())
                .source("Premium Mock Database")
                .build();
    }

    private String getCurrencySymbol(String country) {
        switch (country.toLowerCase()) {
            case "us": return "$";
            case "ca": return "C$";
            case "au": return "A$";
            case "gb": return "£";
            case "de": return "€";
            case "in": default: return "₹";
        }
    }
}
