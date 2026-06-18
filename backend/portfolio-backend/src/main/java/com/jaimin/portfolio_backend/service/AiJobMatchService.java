package com.jaimin.portfolio_backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.SkillMatchResult;

@Service
public class AiJobMatchService {

    // A comprehensive set of common technology terms to extract from job descriptions
    private static final List<String> TECH_DICTIONARY = List.of(
            "Java", "Spring Boot", "Spring Security", "Hibernate", "JPA",
            "JavaScript", "TypeScript", "React", "Next.js", "Angular", "Vue",
            "Node.js", "Express", "Python", "Django", "Flask", "FastAPI",
            "Go", "Rust", "C++", "C#", ".NET", "SQL", "MySQL", "PostgreSQL",
            "MongoDB", "Redis", "Elasticsearch", "Docker", "Kubernetes",
            "AWS", "Azure", "GCP", "Terraform", "Git", "CI/CD", "GitHub Actions",
            "HTML", "CSS", "Tailwind CSS", "GraphQL", "REST API", "Microservices",
            "Kafka", "RabbitMQ", "Lombok", "JWT", "OAuth", "WebSockets"
    );

    // Common roadmaps for missing skills
    private static final Map<String, List<String>> ROADMAPS = new HashMap<>();

    static {
        ROADMAPS.put("AWS", List.of(
                "Milestone 1: Understand Cloud Basics & Global Infrastructure.",
                "Milestone 2: Study Core Services (EC2, S3, RDS, IAM).",
                "Milestone 3: Practice deploying a Spring Boot app on AWS Elastic Beanstalk.",
                "Milestone 4: Prepare for AWS Certified Cloud Practitioner or Solutions Architect."
        ));
        ROADMAPS.put("Docker", List.of(
                "Milestone 1: Learn containerization fundamentals vs virtualization.",
                "Milestone 2: Write your first Dockerfile for a React/Spring application.",
                "Milestone 3: Understand Docker Volumes, Networking, and Docker Compose.",
                "Milestone 4: Containerize and run a multi-container app locally."
        ));
        ROADMAPS.put("Kubernetes", List.of(
                "Milestone 1: Understand K8s Architecture (Master/Worker Nodes, Pods, Services).",
                "Milestone 2: Learn Pod manifests, Deployments, and Service configurations.",
                "Milestone 3: Manage ConfigMaps, Secrets, and Persistent Volumes.",
                "Milestone 4: Practice deploying applications to Minikube or a managed cloud K8s cluster."
        ));
        ROADMAPS.put("Spring Boot", List.of(
                "Milestone 1: Learn Dependency Injection & Spring Core concepts.",
                "Milestone 2: Build REST APIs using Spring Boot and Spring Web.",
                "Milestone 3: Integrate database with Spring Data JPA and Hibernate.",
                "Milestone 4: Secure endpoints with Spring Security and JWT tokens."
        ));
        ROADMAPS.put("React", List.of(
                "Milestone 1: Master modern JS/TS (ES6, Promises, Async/Await).",
                "Milestone 2: Understand React components, props, hooks (useState, useEffect).",
                "Milestone 3: Learn State Management (Context API, Redux Toolkit, or Zustand).",
                "Milestone 4: Practice building fully responsive web layouts."
        ));
        ROADMAPS.put("Next.js", List.of(
                "Milestone 1: Learn React Server Components (RSC) and standard Next.js directory structure.",
                "Milestone 2: Study File-based routing and Dynamic routes.",
                "Milestone 3: Implement Server-side Rendering (SSR) and Static Site Generation (SSG).",
                "Milestone 4: Implement Route Handlers, Middleware, and API routes."
        ));
        ROADMAPS.put("TypeScript", List.of(
                "Milestone 1: Understand Basic Types, Interfaces, and Type Aliases.",
                "Milestone 2: Master Generics, Union Types, and Type Assertions.",
                "Milestone 3: Configure tsconfig.json and set up a TS compiler environment.",
                "Milestone 4: Build a project fully typed without using 'any'."
        ));
        ROADMAPS.put("CI/CD", List.of(
                "Milestone 1: Learn Git branching strategies and pull request flows.",
                "Milestone 2: Understand automated pipelines and workflows.",
                "Milestone 3: Build a GitHub Actions workflow to run tests on push.",
                "Milestone 4: Configure automatic builds and deployment notifications."
        ));
        ROADMAPS.put("Terraform", List.of(
                "Milestone 1: Understand Infrastructure as Code (IaC) principles.",
                "Milestone 2: Write basic configurations using HCL (HashiCorp Configuration Language).",
                "Milestone 3: Manage Terraform State files and remote state backends.",
                "Milestone 4: Deploy cloud instances (like EC2 or S3) using Terraform commands."
        ));
        ROADMAPS.put("Kafka", List.of(
                "Milestone 1: Learn event streaming fundamentals, Topics, and Partitions.",
                "Milestone 2: Write producers and consumers to send/receive messages.",
                "Milestone 3: Understand consumer groups and offset management.",
                "Milestone 4: Implement Kafka in a distributed microservices setup."
        ));
    }

    public SkillMatchResult calculateMatch(
            String jobDescription,
            List<String> userSkills,
            String profileHeadline,
            String experienceText,
            String projectsText,
            String resumeText,
            String certificatesText) {

        if (jobDescription == null) {
            jobDescription = "";
        }

        // 1. Extract required skills from the job description
        Set<String> requiredSkills = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        for (String tech : TECH_DICTIONARY) {
            if (containsTech(jobDescription, tech)) {
                requiredSkills.add(tech);
            }
        }

        // If no specific technical skills were extracted, default to standard stack matching
        if (requiredSkills.isEmpty()) {
            requiredSkills.addAll(List.of("Java", "Spring Boot", "React", "SQL"));
        }

        // 2. Aggregate user technical terms
        Set<String> userTechTerms = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        if (userSkills != null) {
            userTechTerms.addAll(userSkills);
        }
        
        // Extract terms from projects, experiences, resume, and certificates
        extractTechTerms(projectsText, userTechTerms);
        extractTechTerms(experienceText, userTechTerms);
        extractTechTerms(profileHeadline, userTechTerms);
        extractTechTerms(resumeText, userTechTerms);
        extractTechTerms(certificatesText, userTechTerms);

        // 3. Compute match and missing skills
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : requiredSkills) {
            boolean found = false;
            // Direct set checking
            if (userTechTerms.contains(req)) {
                found = true;
            } else {
                // Semantic synonym checks
                String reqLower = req.toLowerCase();
                for (String userTerm : userTechTerms) {
                    String userLower = userTerm.toLowerCase();
                    if (userLower.contains(reqLower) || reqLower.contains(userLower)) {
                        found = true;
                        break;
                    }
                    if (reqLower.contains("postgres") && userLower.contains("postgres")) {
                        found = true;
                        break;
                    }
                    if (reqLower.contains("spring") && userLower.contains("spring")) {
                        found = true;
                        break;
                    }
                    if (reqLower.contains("react") && userLower.contains("next")) {
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                matchedSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        // 4. Calculate realistic ATS score
        // We evaluate weighted factors:
        // - Core skill matches: 40%
        // - Projects tech matches: 20%
        // - Experience relevance: 20%
        // - Certificate relevance: 10%
        // - Resume overlap: 10%
        
        int skillsScore = requiredSkills.isEmpty() ? 100 : (matchedSkills.size() * 100) / requiredSkills.size();
        
        double projectsOverlap = calculateOverlapFactor(projectsText, matchedSkills);
        double experienceOverlap = calculateOverlapFactor(experienceText, matchedSkills);
        double certificatesOverlap = calculateOverlapFactor(certificatesText, matchedSkills);
        double resumeOverlap = calculateOverlapFactor(resumeText, matchedSkills);

        int finalScore = (int) (
                (skillsScore * 0.40) +
                (projectsOverlap * 20.0) +
                (experienceOverlap * 20.0) +
                (certificatesOverlap * 10.0) +
                (resumeOverlap * 10.0)
        );

        // Limit score boundaries
        finalScore = Math.max(15, Math.min(finalScore, 100));

        // Adjust recommendation message
        String recommendation;
        if (finalScore >= 85) {
            recommendation = "Excellent Match! Your profile closely fits the requirements. Go ahead and apply.";
        } else if (finalScore >= 70) {
            recommendation = "Good Match! You have most of the required skills. High chance of interview selection.";
        } else if (finalScore >= 50) {
            recommendation = "Average Match. You satisfy core requirements but lack some auxiliary skills. Consider upskilling.";
        } else {
            recommendation = "Low Match. Your profile lacks several key requirements. We highly suggest pursuing the learning roadmaps below.";
        }

        // 5. Generate learning roadmaps for missing skills
        List<String> roadmapList = new ArrayList<>();
        for (String missing : missingSkills) {
            List<String> steps = ROADMAPS.get(missing);
            if (steps != null) {
                roadmapList.add("### Roadmap for " + missing);
                roadmapList.addAll(steps);
                roadmapList.add("");
            } else {
                roadmapList.add("### Roadmap for " + missing);
                roadmapList.addAll(generateDynamicRoadmap(missing));
                roadmapList.add("");
            }
        }

        String roadmapString = String.join("\n", roadmapList);

        return SkillMatchResult.builder()
                .score(finalScore)
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .recommendation(recommendation)
                .roadmap(roadmapString) // Store roadmap in our DTO!
                .build();
    }

    private void extractTechTerms(String source, Set<String> target) {
        if (source == null || source.isEmpty()) {
            return;
        }
        for (String tech : TECH_DICTIONARY) {
            if (containsTech(source, tech)) {
                target.add(tech);
            }
        }
    }

    private double calculateOverlapFactor(String text, List<String> matchedSkills) {
        if (text == null || text.isEmpty() || matchedSkills.isEmpty()) {
            return 0.5; // Neutral
        }
        String textLower = text.toLowerCase();
        int found = 0;
        for (String skill : matchedSkills) {
            if (textLower.contains(skill.toLowerCase())) {
                found++;
            }
        }
        return (double) found / matchedSkills.size();
    }

    private List<String> generateDynamicRoadmap(String skill) {
        List<String> milestones = new ArrayList<>();
        String cleanSkill = skill.trim();
        milestones.add("Milestone 1: Read the official documentation of " + cleanSkill + " to learn syntax and architecture basics.");
        milestones.add("Milestone 2: Configure a development container or playground to experiment with " + cleanSkill + " APIs.");
        milestones.add("Milestone 3: Develop a portfolio repository utilizing " + cleanSkill + " for real-world functionality.");
        milestones.add("Milestone 4: Build test suites and deploy your custom " + cleanSkill + " services to a production cloud instance.");
        return milestones;
    }

    private boolean containsTech(String text, String tech) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        String escapedTech = java.util.regex.Pattern.quote(tech);
        String boundaryStart = Character.isLetterOrDigit(tech.charAt(0)) ? "\\b" : "";
        String boundaryEnd = Character.isLetterOrDigit(tech.charAt(tech.length() - 1)) ? "\\b" : "";
        
        String patternStr = boundaryStart + escapedTech + boundaryEnd;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(patternStr, java.util.regex.Pattern.CASE_INSENSITIVE);
        return pattern.matcher(text).find();
    }
}