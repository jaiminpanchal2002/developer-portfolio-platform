package com.jaimin.portfolio_backend.controller;

import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.dto.ProjectRequest;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.service.ProjectService;
import com.jaimin.portfolio_backend.util.LocalizationUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Project createProject(
            @RequestBody ProjectRequest request) {

        return projectService.createProject(request);
    }

    /**
     * Localizes title/description while preserving every other field —
     * the previous per-field builder silently dropped newly added columns
     * (case-study narrative, displayOrder, published).
     */
    private Project localized(Project project, String locale) {
        return Project.builder()
                .id(project.getId())
                .title(LocalizationUtils.getLocalizedValue(project.getTitle(), locale))
                .description(LocalizationUtils.getLocalizedValue(project.getDescription(), locale))
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .imageUrl(project.getImageUrl())
                .technologies(project.getTechnologies())
                .featured(project.getFeatured())
                .problemStatement(project.getProblemStatement())
                .solution(project.getSolution())
                .architecture(project.getArchitecture())
                .challenges(project.getChallenges())
                .learnings(project.getLearnings())
                .metrics(project.getMetrics())
                .displayOrder(project.getDisplayOrder())
                .published(project.getPublished())
                .createdAt(project.getCreatedAt())
                .build();
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id, @RequestHeader(value = "Accept-Language", required = false) String locale) {
        Project project = projectService.getProjectById(id);
        if (project != null) {
            return localized(project, locale);
        }
        return project;
    }

    @PutMapping("/{id}")
    public Project updateProject(
            @PathVariable Long id,
            @RequestBody ProjectRequest request) {

        return projectService.updateProject(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable Long id) {

        projectService.deleteProject(id);

        return "Project Deleted Successfully";
    }

    /** Public showcase: published projects only (legacy NULL counts as published). */
    @GetMapping
    public List<Project> getAllProjects(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        return projectService.getPublishedProjects().stream()
                .map(project -> localized(project, locale))
                .collect(java.util.stream.Collectors.toList());
    }

    /** Admin listing: everything, drafts included. Secured in SecurityConfig. */
    @GetMapping("/admin/all")
    public List<Project> getAllProjectsForAdmin() {
        return projectService.getAllProjects();
    }

}
