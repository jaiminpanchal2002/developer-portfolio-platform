package com.jaimin.portfolio_backend.controller;

import com.jaimin.portfolio_backend.dto.JobDTO;
import com.jaimin.portfolio_backend.service.JobService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<JobDTO> getJobs() {
        return jobService.getJobs();
    }

    @GetMapping("/search")
    public List<JobDTO> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "false") boolean remote) {
        return jobService.searchJobs(
                keyword,
                country,
                remote);
    }

    @GetMapping("/live")
    public String getLiveJobs(
            @RequestParam(defaultValue = "in") String country) {

        return jobService.getLiveJobs(country);
    }

    

}