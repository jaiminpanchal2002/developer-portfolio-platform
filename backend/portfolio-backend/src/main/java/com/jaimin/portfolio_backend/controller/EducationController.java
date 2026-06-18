package com.jaimin.portfolio_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.EducationRequest;
import com.jaimin.portfolio_backend.entity.Education;
import com.jaimin.portfolio_backend.service.EducationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/educations")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @PostMapping
    public Education createEducation(
            @RequestBody EducationRequest request) {

        return educationService.createEducation(request);
    }

    @GetMapping
    public List<Education> getAllEducations(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        List<Education> all = educationService.getAllEducations();
        return all.stream().map(edu -> {
            String locDegree = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(edu.getDegree(), locale);
            String locField = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(edu.getFieldOfStudy(), locale);
            return Education.builder()
                .id(edu.getId())
                .institution(edu.getInstitution())
                .degree(locDegree)
                .fieldOfStudy(locField)
                .startYear(edu.getStartYear())
                .endYear(edu.getEndYear())
                .grade(edu.getGrade())
                .build();
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public Education getEducationById(
            @PathVariable Long id, @RequestHeader(value = "Accept-Language", required = false) String locale) {

        Education edu = educationService.getEducationById(id);
        if (edu != null) {
            String locDegree = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(edu.getDegree(), locale);
            String locField = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(edu.getFieldOfStudy(), locale);
            return Education.builder()
                .id(edu.getId())
                .institution(edu.getInstitution())
                .degree(locDegree)
                .fieldOfStudy(locField)
                .startYear(edu.getStartYear())
                .endYear(edu.getEndYear())
                .grade(edu.getGrade())
                .build();
        }
        return edu;
    }

    @PutMapping("/{id}")
    public Education updateEducation(
            @PathVariable Long id,
            @RequestBody EducationRequest request) {

        return educationService.updateEducation(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteEducation(
            @PathVariable Long id) {

        educationService.deleteEducation(id);

        return "Education Deleted Successfully";
    }
}