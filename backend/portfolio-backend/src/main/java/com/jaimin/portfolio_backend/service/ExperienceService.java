package com.jaimin.portfolio_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.ExperienceRequest;
import com.jaimin.portfolio_backend.entity.Experience;
import com.jaimin.portfolio_backend.repository.ExperienceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    public Experience createExperience(
            ExperienceRequest request) {

        Experience experience = Experience.builder()
                .company(request.getCompany())
                .position(request.getPosition())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentlyWorking(request.getCurrentlyWorking())
                .build();

        return experienceRepository.save(experience);
    }

    public List<Experience> getAllExperiences() {
        return experienceRepository.findAll();
    }

    public Experience getExperienceById(Long id) {
        return experienceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
    }

    public Experience updateExperience(
            Long id,
            ExperienceRequest request) {

        Experience experience = getExperienceById(id);

        experience.setCompany(request.getCompany());
        experience.setPosition(request.getPosition());
        experience.setDescription(request.getDescription());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(
                request.getCurrentlyWorking());

        return experienceRepository.save(experience);
    }

    public void deleteExperience(Long id) {

        Experience experience = getExperienceById(id);

        experienceRepository.delete(experience);
    }

    public void bulkDelete(List<Long> ids) {
        experienceRepository.deleteAllByIdInBatch(ids);
    }
}