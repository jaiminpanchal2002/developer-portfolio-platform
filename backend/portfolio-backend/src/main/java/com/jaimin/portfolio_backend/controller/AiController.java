package com.jaimin.portfolio_backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.dto.CoverLetterRequest;
import com.jaimin.portfolio_backend.dto.ResumeAnalysisDTO;
import com.jaimin.portfolio_backend.dto.SkillMatchResult;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;
import com.jaimin.portfolio_backend.repository.ProjectRepository;
import com.jaimin.portfolio_backend.repository.SkillRepository;
import com.jaimin.portfolio_backend.service.AiJobMatchService;
import com.jaimin.portfolio_backend.service.ProfileService;
import com.jaimin.portfolio_backend.service.ResumeAiService;
import com.jaimin.portfolio_backend.service.SkillService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private ResumeAiService resumeAiService;

    @Autowired
    private AiJobMatchService aiJobMatchService;

    @GetMapping("/test")
    public String test() {
        return "AI Controller Working";
    }

    @PostMapping("/cover-letter")
    public String generateCoverLetter(@RequestBody CoverLetterRequest request) {
        Profile profile = profileService.getProfile();
        String name = profile != null ? profile.getFullName() : "Jaimin Patel";
        String headline = profile != null ? profile.getHeadline() : "Full Stack AI Developer";
        String contactEmail = profile != null ? profile.getEmail() : "jaimin@example.com";
        String location = profile != null ? profile.getLocation() : "Mumbai, India";

        List<String> userSkills = skillRepository.findAll()
                .stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        List<Project> projects = projectRepository.findAll();
        String topProject = projects.isEmpty() ? "Developer Portfolio Platform" : projects.get(0).getTitle();

        String skillsString = userSkills.isEmpty() ? "Java, Spring Boot, React, Next.js, Docker, AWS" : String.join(", ", userSkills);

        return """
                Dear Hiring Manager,

                I am writing to express my enthusiastic interest in the %s position at %s. As a %s based in %s, my background building premium SaaS applications aligns perfectly with the requirements of this role.

                Throughout my career, I have focused on writing clean, type-safe code and implementing scalable backend APIs. My technical expertise spans across %s. A key highlight of my work is developing "%s", which represents my capability to design complex workflows, manage responsive frontends, and implement secure token-based architectures.

                Given the requirements outlined in your job description, I am confident that my experience with containerization, API development, and responsive layouts will add immediate value to your team. I am excited about the opportunity to contribute to %s's engineering standards.

                Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications further.

                Sincerely,
                %s
                %s
                Email: %s
                """
                .formatted(
                        request.getTitle(),
                        request.getCompany(),
                        headline,
                        location,
                        skillsString,
                        topProject,
                        request.getCompany(),
                        name,
                        headline,
                        contactEmail
                );
    }

    @PostMapping("/recruiter-email")
    public String generateRecruiterEmail(@RequestBody Map<String, String> request) {
        Profile profile = profileService.getProfile();
        String name = profile != null ? profile.getFullName() : "Jaimin Patel";
        String headline = profile != null ? profile.getHeadline() : "Full Stack AI Developer";

        String company = request.getOrDefault("company", "Company");
        String title = request.getOrDefault("title", "Developer");
        String lang = request.getOrDefault("language", "English").toLowerCase();

        List<String> skills = skillRepository.findAll()
                .stream()
                .map(Skill::getName)
                .limit(4)
                .collect(Collectors.toList());
        String skillsList = skills.isEmpty() ? "Java, Spring Boot, React" : String.join(", ", skills);

        if (lang.contains("german") || lang.contains("de")) {
            return """
                    Betreff: Bewerbung als %s - %s

                    Sehr geehrte Damen und Herren,

                    ich hoffe, diese Nachricht erreicht Sie gut. Ich bin vor Kurzem auf die Stelle als %s bei %s aufmerksam geworden und bin sehr an einer Zusammenarbeit interessiert.

                    Als %s bringe ich fundierte Kenntnisse in %s mit. Ich habe bereits mehrere produktionsreife Webanwendungen entwickelt und würde meine Erfahrungen gerne in Ihr Team einbringen.

                    Im Anhang finden Sie meinen Lebenslauf. Ich freue mich auf die Gelegenheit eines persönlichen Gesprächs.

                    Mit freundlichen Grüßen,
                    %s
                    %s
                    """
                    .formatted(title, name, title, company, headline, skillsList, name, headline);
        } else if (lang.contains("french") || lang.contains("fr")) {
            return """
                    Objet: Candidature au poste de %s - %s

                    Madame, Monsieur,

                    Je me permets de vous contacter suite à votre offre d'emploi concernant le poste de %s chez %s. Votre entreprise et vos projets correspondent particulièrement à mes aspirations professionnelles.

                    En tant que %s, je me suis spécialisé dans les technologies suivantes: %s. Rigoureux et passionné, j'aime concevoir des architectures robustes et des interfaces soignées.

                    Vous trouverez mon CV ci-joint. Je me tiens à votre entière disposition pour tout entretien futur.

                    Cordialement,
                    %s
                    %s
                    """
                    .formatted(title, name, title, company, headline, skillsList, name, headline);
        } else if (lang.contains("spanish") || lang.contains("es")) {
            return """
                    Asunto: Candidatura para el puesto de %s - %s

                    Estimado equipo de selección,

                    Espero que se encuentren muy bien. Me pongo en contacto con ustedes con relación a la oferta de trabajo para el puesto de %s en %s.

                    Soy %s y cuento con experiencia desarrollando soluciones digitales robustas utilizando %s. Me apasiona crear productos que destaquen por su diseño y escalabilidad.

                    Adjunto mi currículum para su revisión. Quedo a su disposición para mantener una entrevista y conversar sobre cómo puedo aportar a su equipo.

                    Atentamente,
                    %s
                    %s
                    """
                    .formatted(title, name, title, company, headline, skillsList, name, headline);
        } else if (lang.contains("italian") || lang.contains("it")) {
            return """
                    Oggetto: Candidatura per la posizione di %s - %s

                    Gentile Team di Selezione,

                    le scrivo in merito all'opportunità lavorativa per il ruolo di %s presso %s. Sono molto colpito dal vostro lavoro e desidero sottoporre il mio profilo alla vostra attenzione.

                    Sono un %s appassionato, con competenze maturate su %s. Amo lavorare a soluzioni scalabili prestando grande attenzione alla qualità del codice.

                    In allegato invio il mio CV. Sarei felice di poter discutere ulteriormente delle mie esperienze in un colloquio conoscitivo.

                    Cordiali saluti,
                    %s
                    %s
                    """
                    .formatted(title, name, title, company, headline, skillsList, name, headline);
        } else {
            // Default English
            return """
                    Subject: Application for %s - %s

                    Dear Hiring Team,

                    I hope this email finds you well. I recently came across the %s position at %s and wanted to reach out regarding my interest in joining your engineering team.

                    As a %s, my background aligns closely with the requirements of this role. I specialize in building scalable web applications, and my technical stack includes %s. I focus on developing production-grade APIs and responsive interfaces that offer premium user experiences.

                    I have attached my resume for your review. I would welcome the chance to schedule a call to discuss how my skill set can contribute to the goals of %s.

                    Best Regards,
                    %s
                    %s
                    """
                    .formatted(title, name, title, company, headline, skillsList, company, name, headline);
        }
    }

    @PostMapping("/resume-analysis")
    public ResumeAnalysisDTO analyzeResume(@RequestBody Map<String, String> request) {
        return resumeAiService.analyzeResume(request.get("resume"));
    }

    @PostMapping("/interview-questions")
    public List<Map<String, String>> generateQuestions(@RequestBody Map<String, String> request) {
        String role = request.getOrDefault("role", "Java Developer");
        List<Map<String, String>> qList = new ArrayList<>();

        if (role.toLowerCase().contains("spring") || role.toLowerCase().contains("java")) {
            qList.add(createQ("Technical", "What is the difference between @Component, @Service, and @Repository in Spring Boot?",
                    "Under the hood, all three are stereotypic annotations that register classes as Spring Beans. @Component is the generic stereotype. @Service holds business logic (no special behavior). @Repository enables exception translation for database dialects, mapping SQL exceptions to Spring's DataAccessException."));
            qList.add(createQ("Technical", "How does Spring Boot Security integrate JWT token authentication?",
                    "JWT authentication filter extends OncePerRequestFilter. It extracts the 'Bearer ' token from the Authorization header, validates the signature using the secret key, extracts the username, loads user details from CustomUserDetailsService, and registers UsernamePasswordAuthenticationToken in the SecurityContextHolder."));
            qList.add(createQ("Scenario", "Your database connection pool is running out of connections during peak traffic. How do you troubleshoot and fix this in a Spring Boot application?",
                    "First, check log statements and analyze connection leaks (unclosed transactions). Adjust pool configurations (like HikariCP's maximumPoolSize) in application.properties. Implement caching (Redis) to reduce query volume, optimize JPA queries to prevent N+1 select problems, and use asynchronous execution where fit."));
            qList.add(createQ("Scenario", "How would you design a microservice endpoint that must talk to three separate downstream APIs concurrently, consolidate their responses, and fail gracefully if one times out?",
                    "Use Java's CompletableFuture or Spring WebClient. Initiate requests asynchronously, trigger them concurrently, and use CompletableFuture.allOf(). Set explicit timeouts. Apply fallback strategies (e.g., Resilience4j circuit breakers) to return partial or default data for the failed service without crashing the main request."));
            qList.add(createQ("HR", "Why do you prefer Spring Boot over other backend frameworks like Node.js or Django?",
                    "I value Spring Boot for enterprise-grade applications. It offers strong type safety (Java), robust dependency injection, a massive ecosystem (JPA, Security, Cloud), and excellent performance for multi-threaded processes. While Node.js is great for I/O intensive apps, Spring Boot provides an organized, clean architecture that scales cleanly in large development teams."));
        } else if (role.toLowerCase().contains("react") || role.toLowerCase().contains("frontend")) {
            qList.add(createQ("Technical", "What are React Server Components (RSC) and how do they differ from Client Components in Next.js?",
                    "React Server Components render on the server, meaning they don't send JavaScript bundles to the client, leading to faster initial loads. Client Components are marked with 'use client' and enable interactivity, hooks (useState, useEffect), and browser API usage."));
            qList.add(createQ("Technical", "Explain the concept of 'hydration' in Next.js and how hydration mismatch errors occur.",
                    "Hydration is the process where client-side JavaScript attaches event listeners to pre-rendered HTML served by the server. Hydration mismatches occur when the HTML rendered on the client differs from what was rendered on the server (e.g., using date/time, random values, or invalid HTML tags)."));
            qList.add(createQ("Scenario", "Your Next.js dashboard takes 5 seconds to become interactive. How do you optimize its performance?",
                    "Analyze the bundle sizes using Next.js Bundle Analyzer. Code-split heavy modules using dynamic imports (next/dynamic). Optimize asset delivery (next/image). Move data fetching to the server side (RSC) to minimize Client JS. Defer non-critical third-party scripts, and implement optimistic updates on state changes."));
            qList.add(createQ("Scenario", "How would you secure private dashboard routes in Next.js using App Router middleware?",
                    "Implement a middleware.ts file at the root. Retrieve the session token from cookies. Compare matching pathnames against protected routes. If the token is missing or invalid, redirect the user to the /login page, preserving the original URL as a redirect query parameter."));
            qList.add(createQ("HR", "What is your process for collaborating with designers when implementing complex UI interactions?",
                    "I review design components (Figma, etc.) to understand user flows, layouts, and spacing systems. I map out reusable components in Tailwind CSS. For micro-interactions, I discuss state transitions and execute them using Framer Motion or GSAP. I emphasize creating accessible layouts (ARIA roles) and request early feedback to ensure alignment."));
        } else {
            // Full stack general
            qList.add(createQ("Technical", "Explain the concept of CORS (Cross-Origin Resource Sharing) and how to configure it in a React-Spring Boot setup.",
                    "CORS is a browser security mechanism that blocks web pages from requesting resources in a different domain. In Spring Boot, configure it by defining a WebMvcConfigurer bean and registering allowed origins (e.g., http://localhost:3000), methods (*), and headers (*). In React development, configure a dev proxy to route requests."));
            qList.add(createQ("Technical", "How does JWT structure token claims, and how do you prevent token tampering?",
                    "JWT consists of Header, Payload, and Signature. Payload contains claims (user details, expiration). Tampering is prevented by the Signature, which hashes the Header and Payload together with a secure secret key on the server. If a client alters the payload, the signature verification fails on the backend."));
            qList.add(createQ("Scenario", "You need to migrate a high-traffic SQL database schema without incurring downtime. How do you achieve this?",
                    "Utilize a expand and contract pattern. 1. Deploy database migration adding new fields (allow null values). 2. Update service code to write to both old and new columns. 3. Backfill existing records. 4. Update code to read/write only from new columns. 5. Drop old columns. Use Flyway/Liquibase to track."));
            qList.add(createQ("Scenario", "Explain how you design an upload service that parses large CSV files containing user records and imports them into a database.",
                    "Process in batches to avoid memory overload. Stream the file using BufferedReader instead of loading all lines. Parse CSV lines into DTOs, and utilize JpaRepository.saveAll() with batch configurations (spring.jpa.properties.hibernate.jdbc.batch_size) to insert records in batches of 50-100 inside transactional chunks."));
            qList.add(createQ("HR", "Describe a time when you had to debug a difficult production issue under time constraints.",
                    "In my previous project, users reported transaction timeouts. Under pressure, I checked the production application logs, localized the issue to a JPA database deadlock, quickly drafted a read-only replica connection strategy for select queries, deployed the hotfix, and resolved the lockout within 2 hours. Later, I optimized the database indexes."));
        }

        return qList;
    }

    @Autowired
    private com.jaimin.portfolio_backend.repository.CertificateRepository certificateRepository;

    @PostMapping("/match-job")
    public SkillMatchResult matchJob(@RequestBody Map<String, String> request) {
        List<String> userSkills = skillRepository.findAll()
                .stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        Profile profile = profileService.getProfile();
        String headline = profile != null ? profile.getHeadline() : "";
        String resume = profile != null ? profile.getResumeText() : "";

        String experiences = experienceRepository.findAll()
                .stream()
                .map(exp -> exp.getPosition() + " " + exp.getDescription())
                .collect(Collectors.joining(" "));

        String projects = projectRepository.findAll()
                .stream()
                .map(p -> p.getTitle() + " " + p.getDescription() + " " + p.getTechnologies())
                .collect(Collectors.joining(" "));

        String certificates = certificateRepository.findAll()
                .stream()
                .map(c -> c.getTitle() + " from " + c.getIssuer())
                .collect(Collectors.joining(" "));

        return aiJobMatchService.calculateMatch(
                request.get("description"),
                userSkills,
                headline,
                experiences,
                projects,
                resume,
                certificates
        );
    }

    private Map<String, String> createQ(String category, String question, String answer) {
        Map<String, String> q = new HashMap<>();
        q.put("category", category);
        q.put("question", question);
        q.put("answer", answer);
        return q;
    }
}