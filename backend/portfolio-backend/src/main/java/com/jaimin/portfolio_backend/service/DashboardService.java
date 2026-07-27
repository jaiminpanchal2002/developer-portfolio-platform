package com.jaimin.portfolio_backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.DashboardStatsResponse;
import com.jaimin.portfolio_backend.dto.ResumeAnalysisDTO;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.entity.AppointmentStatus;
import com.jaimin.portfolio_backend.repository.AppointmentRepository;
import com.jaimin.portfolio_backend.repository.CertificateRepository;
import com.jaimin.portfolio_backend.repository.ChatInteractionRepository;
import com.jaimin.portfolio_backend.repository.BlogPostRepository;
import com.jaimin.portfolio_backend.repository.ContactInquiryRepository;
import com.jaimin.portfolio_backend.repository.EducationRepository;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;
import com.jaimin.portfolio_backend.repository.JobApplicationRepository;
import com.jaimin.portfolio_backend.repository.ProjectRepository;
import com.jaimin.portfolio_backend.repository.SkillRepository;
import com.jaimin.portfolio_backend.repository.TestimonialRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final CertificateRepository certificateRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final TestimonialRepository testimonialRepository;
    private final BlogPostRepository blogPostRepository;
    private final ContactInquiryRepository contactInquiryRepository;
    private final ChatInteractionRepository chatInteractionRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProfileService profileService;
    private final ResumeAiService resumeAiService;

    public DashboardStatsResponse getStats() {
        long projects = projectRepository.count();
        long skills = skillRepository.count();
        long experiences = experienceRepository.count();
        long educations = educationRepository.count();
        long certificates = certificateRepository.count();
        long applications = jobApplicationRepository.count();
        long testimonials = testimonialRepository.count();
        long blogPosts = blogPostRepository.count();
        long unreadMessages = contactInquiryRepository.countByIsReadFalse();
        long chatbotInteractions30d = chatInteractionRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30));
        long pendingAppointments = appointmentRepository.countByStatus(AppointmentStatus.PENDING);

        // Calculate Profile Completeness Score (0 - 100)
        int profileScore = calculateProfileScore(projects, skills, experiences, educations, certificates);

        // Fetch ATS Score
        int atsScore = 0;
        Profile profile = profileService.getProfile();
        if (profile != null && profile.getResumeText() != null && !profile.getResumeText().isEmpty()) {
            ResumeAnalysisDTO analysis = resumeAiService.analyzeResume(profile.getResumeText());
            atsScore = analysis.getAtsScore();
        }

        return DashboardStatsResponse.builder()
                .projects(projects)
                .skills(skills)
                .experiences(experiences)
                .educations(educations)
                .certificates(certificates)
                .applications(applications)
                .profileScore(profileScore)
                .atsScore(atsScore)
                .testimonials(testimonials)
                .blogPosts(blogPosts)
                .unreadMessages(unreadMessages)
                .chatbotInteractions30d(chatbotInteractions30d)
                .pendingAppointments(pendingAppointments)
                .build();
    }

    private int calculateProfileScore(long projects, long skills, long experiences, long educations, long certificates) {
        int score = 0;
        Profile profile = profileService.getProfile();

        if (profile != null) {
            // Profile fields (max 35%)
            if (profile.getFullName() != null && !profile.getFullName().isEmpty()) score += 5;
            if (profile.getHeadline() != null && !profile.getHeadline().isEmpty()) score += 5;
            if (profile.getAbout() != null && !profile.getAbout().isEmpty()) score += 5;
            if (profile.getEmail() != null && !profile.getEmail().isEmpty()) score += 5;
            if (profile.getPhone() != null && !profile.getPhone().isEmpty()) score += 5;
            if (profile.getLocation() != null && !profile.getLocation().isEmpty()) score += 5;
            if (profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isEmpty()) score += 5;

            // Resume presence (max 20%)
            if (profile.getResumeUrl() != null && !profile.getResumeUrl().isEmpty()) score += 10;
            if (profile.getResumeText() != null && !profile.getResumeText().isEmpty()) score += 10;
        }

        // Skills (max 15%)
        if (skills >= 5) score += 15;
        else score += (skills * 3);

        // Projects (max 15%)
        if (projects >= 3) score += 15;
        else score += (projects * 5);

        // Experience (max 10%)
        if (experiences >= 2) score += 10;
        else score += (experiences * 5);

        // Education & Certificates (max 5%)
        if (educations > 0) score += 3;
        if (certificates > 0) score += 2;

        return Math.min(score, 100);
    }
}