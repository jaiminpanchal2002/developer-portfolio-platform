package com.jaimin.portfolio_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.ProjectRequest;
import com.jaimin.portfolio_backend.entity.Project;
import com.jaimin.portfolio_backend.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public Project createProject(ProjectRequest request) {

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .imageUrl(request.getImageUrl())
                .technologies(request.getTechnologies())
                .featured(request.getFeatured())
                .problemStatement(request.getProblemStatement())
                .solution(request.getSolution())
                .architecture(request.getArchitecture())
                .challenges(request.getChallenges())
                .learnings(request.getLearnings())
                .metrics(request.getMetrics())
                .displayOrder(request.getDisplayOrder())
                .published(request.getPublished() == null ? Boolean.TRUE : request.getPublished())
                .createdAt(LocalDateTime.now())
                .build();

        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {

        // displayOrder ascending; Postgres sorts NULLs last on ASC, so
        // unordered projects trail the manually curated ones.
        return projectRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"));

    }

    /** Public view: drafts hidden; legacy NULL published counts as published. */
    public List<Project> getPublishedProjects() {
        return getAllProjects().stream()
                .filter(p -> !Boolean.FALSE.equals(p.getPublished()))
                .toList();
    }

public Project getProjectById(Long id) {

    return projectRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Project with ID " + id + " not found"));
}

    public Project updateProject(Long id, ProjectRequest request) {

    Project project = projectRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Project with ID " + id + " not found"));

    project.setTitle(request.getTitle());
    project.setDescription(request.getDescription());
    project.setGithubUrl(request.getGithubUrl());
    project.setLiveUrl(request.getLiveUrl());
    project.setImageUrl(request.getImageUrl());
    project.setTechnologies(request.getTechnologies());
    project.setFeatured(request.getFeatured());
    project.setProblemStatement(request.getProblemStatement());
    project.setSolution(request.getSolution());
    project.setArchitecture(request.getArchitecture());
    project.setChallenges(request.getChallenges());
    project.setLearnings(request.getLearnings());
    project.setMetrics(request.getMetrics());
    project.setDisplayOrder(request.getDisplayOrder());
    if (request.getPublished() != null) {
        project.setPublished(request.getPublished());
    }

    return projectRepository.save(project);
}

   public void deleteProject(Long id) {

    Project project = projectRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Project with ID " + id + " not found"));

    projectRepository.delete(project);
}

}
