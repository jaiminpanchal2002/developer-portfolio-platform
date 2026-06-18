package com.jaimin.portfolio_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.ExperienceRequest;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.service.ExperienceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @PostMapping
    public Experience createExperience(
            @RequestBody ExperienceRequest request) {

        return experienceService.createExperience(request);
    }

    @GetMapping
    public List<Experience> getAllExperiences(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        List<Experience> all = experienceService.getAllExperiences();
        return all.stream().map(e -> {
            String locPos = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(e.getPosition(), locale);
            String locDesc = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(e.getDescription(), locale);
            return Experience.builder()
                .id(e.getId())
                .company(e.getCompany())
                .position(locPos)
                .description(locDesc)
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .currentlyWorking(e.getCurrentlyWorking())
                .build();
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public Experience getExperienceById(
            @PathVariable Long id, @RequestHeader(value = "Accept-Language", required = false) String locale) {

        Experience e = experienceService.getExperienceById(id);
        if (e != null) {
            String locPos = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(e.getPosition(), locale);
            String locDesc = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(e.getDescription(), locale);
            return Experience.builder()
                .id(e.getId())
                .company(e.getCompany())
                .position(locPos)
                .description(locDesc)
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .currentlyWorking(e.getCurrentlyWorking())
                .build();
        }
        return e;
    }

    @PutMapping("/{id}")
    public Experience updateExperience(
            @PathVariable Long id,
            @RequestBody ExperienceRequest request) {

        return experienceService.updateExperience(
                id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteExperience(
            @PathVariable Long id) {

        experienceService.deleteExperience(id);

        return "Experience Deleted Successfully";
    }
}