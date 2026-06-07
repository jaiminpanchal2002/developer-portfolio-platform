package com.jaimin.portfolio_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.entity.JobApplication;
import com.jaimin.portfolio_backend.service.JobApplicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService service;

    @GetMapping
    public List<JobApplication> getAll() {
        return service.getAllApplications();
    }

    @GetMapping("/{id}")
    public JobApplication getById(@PathVariable Long id) {
        return service.getApplicationById(id);
    }

    @PostMapping
    public JobApplication save(@RequestBody JobApplication app) {
        return service.createApplication(app);
    }

    @PutMapping("/{id}")
    public JobApplication update(
            @PathVariable Long id,
            @RequestBody JobApplication app) {
        return service.updateApplication(id, app);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteApplication(id);
        return "Application Deleted Successfully";
    }
}
