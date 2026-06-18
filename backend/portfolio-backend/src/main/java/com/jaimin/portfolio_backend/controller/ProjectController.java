package com.jaimin.portfolio_backend.controller;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.dto.ProjectRequest;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.service.ProjectService;

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

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id, @RequestHeader(value = "Accept-Language", required = false) String locale) {
        Project project = projectService.getProjectById(id);
        if (project != null) {
            String locTitle = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(project.getTitle(), locale);
            String locDesc = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(project.getDescription(), locale);
            return Project.builder()
                .id(project.getId())
                .title(locTitle)
                .description(locDesc)
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .imageUrl(project.getImageUrl())
                .technologies(project.getTechnologies())
                .featured(project.getFeatured())
                .createdAt(project.getCreatedAt())
                .build();
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

    @GetMapping
    public List<Project> getAllProjects(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        List<Project> all = projectService.getAllProjects();
        return all.stream().map(project -> {
            String locTitle = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(project.getTitle(), locale);
            String locDesc = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(project.getDescription(), locale);
            return Project.builder()
                .id(project.getId())
                .title(locTitle)
                .description(locDesc)
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .imageUrl(project.getImageUrl())
                .technologies(project.getTechnologies())
                .featured(project.getFeatured())
                .createdAt(project.getCreatedAt())
                .build();
        }).collect(java.util.stream.Collectors.toList());
    }

}
