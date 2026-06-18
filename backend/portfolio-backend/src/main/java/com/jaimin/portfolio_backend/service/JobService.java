package com.jaimin.portfolio_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaimin.portfolio_backend.dto.JobDTO;
import com.jaimin.portfolio_backend.dto.SkillMatchResult;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;
import com.jaimin.portfolio_backend.repository.ProjectRepository;
import com.jaimin.portfolio_backend.repository.SkillRepository;

@Service
public class JobService {

    private final RestTemplate restTemplate;
    private final AiJobMatchService aiJobMatchService;
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
            SkillRepository skillRepository,
            ProjectRepository projectRepository,
            ExperienceRepository experienceRepository,
            com.jaimin.portfolio_backend.repository.CertificateRepository certificateRepository,
            ProfileService profileService) {
        this.restTemplate = restTemplate;
        this.aiJobMatchService = aiJobMatchService;
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
                String url = "https://api.adzuna.com/v1/api/jobs/"
                        + country.toLowerCase()
                        + "/search/1"
                        + "?app_id=" + appId
                        + "&app_key=" + appKey
                        + "&results_per_page=15"
                        + "&what=" + keyword
                        + "&max_days_old=14"
                        + remoteParam;

                String response = restTemplate.getForObject(url, String.class);
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response);
                JsonNode resultsNode = root.path("results");

                if (resultsNode.isArray()) {
                    for (JsonNode node : resultsNode) {
                        String title = node.path("title").asText();
                        String company = node.path("company").path("display_name").asText("Confidential");
                        String location = node.path("location").path("display_name").asText("Remote");
                        String description = node.path("description").asText("");
                        String applyLink = node.path("redirect_url").asText("https://www.adzuna.com");
                        String rawCreated = node.path("created").asText(""); // e.g. "2026-06-10T12:00:00Z"
                        String postingDate = rawCreated.length() >= 10 ? rawCreated.substring(0, 10) : "Recent";
                        String jobSource = "Adzuna";

                        double salaryMin = node.path("salary_min").asDouble(0);
                        double salaryMax = node.path("salary_max").asDouble(0);
                        String salary = "Competitive";
                        if (salaryMin > 0 && salaryMax > 0) {
                            salary = String.format("%.0f - %.0f", salaryMin, salaryMax);
                        } else if (salaryMin > 0) {
                            salary = String.format("From %.0f", salaryMin);
                        }

                        // Call AI matching
                        SkillMatchResult match = calculateMatchForJob(description);

                        jobList.add(JobDTO.builder()
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
                                .source(jobSource)
                                .build());
                    }
                }
            } catch (Exception e) {
                System.err.println("Error calling Adzuna API: " + e.getMessage() + ". Using fallback mock jobs.");
            }
        }

        // 2. If live search is empty or failed, load premium mock jobs matching the keyword
        if (jobList.isEmpty()) {
            jobList = generateMockJobs(keyword, country);
        }

        return jobList;
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

    private SkillMatchResult calculateMatchForJob(String description) {
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
        List<JobDTO> mockList = new ArrayList<>();
        String currency = getCurrencySymbol(country);

        // Standardize keyword display
        String capKeyword = "Developer";
        if (keyword != null && !keyword.trim().isEmpty()) {
            String clean = keyword.trim();
            capKeyword = clean.substring(0, 1).toUpperCase() + (clean.length() > 1 ? clean.substring(1) : "");
        }

        mockList.add(createMockJob(
            "Senior " + capKeyword + " Engineer",
            "GlobalTech Inc",
            "Bangalore, India",
            currency + "1,200,000 - " + currency + "1,800,000",
            "Looking for an experienced engineer specialized in " + capKeyword + ". You will be building scalability features, optimizing backend performance, and integrating " + capKeyword + " services. Strong understanding of architecture, relational databases, and modern software design patterns is highly required."
        ));

        mockList.add(createMockJob(
            capKeyword + " Systems Specialist",
            "Acuity Corp",
            "Remote",
            currency + "900,000 - " + currency + "1,300,000",
            "Join our core engineering team. The ideal candidate has hands-on experience with " + capKeyword + " and cloud environments. You will implement robust APIs, write unit tests, and collaborate to deploy secure " + capKeyword + " modules."
        ));

        mockList.add(createMockJob(
            "Full Stack Engineer (" + capKeyword + " & React)",
            "Linear",
            "Mumbai, India",
            currency + "1,000,000 - " + currency + "1,500,000",
            "We are seeking a versatile Full Stack Developer to build user-friendly interfaces and robust backend logic. Tech stack includes " + capKeyword + ", React, TypeScript, and modern styling libraries. Experience deploying applications to cloud services and managing configurations with " + capKeyword + " is a major advantage."
        ));

        return mockList;
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