package com.jaimin.portfolio_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.EducationRequest;
import com.jaimin.portfolio_backend.entity.Education;
import com.jaimin.portfolio_backend.repository.EducationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;

    public Education createEducation(EducationRequest request) {

        Education education = Education.builder()
                .institution(request.getInstitution())
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .startYear(request.getStartYear())
                .endYear(request.getEndYear())
                .grade(request.getGrade())
                .build();

        return educationRepository.save(education);
    }

    public List<Education> getAllEducations() {
        return educationRepository.findAll();
    }

    public Education getEducationById(Long id) {
        return educationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Education not found"));
    }

    public Education updateEducation(
            Long id,
            EducationRequest request) {

        Education education = getEducationById(id);

        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());
        education.setGrade(request.getGrade());

        return educationRepository.save(education);
    }

    public void deleteEducation(Long id) {

        Education education = getEducationById(id);

        educationRepository.delete(education);
    }

    public void bulkDelete(List<Long> ids) {
        educationRepository.deleteAllByIdInBatch(ids);
    }
}