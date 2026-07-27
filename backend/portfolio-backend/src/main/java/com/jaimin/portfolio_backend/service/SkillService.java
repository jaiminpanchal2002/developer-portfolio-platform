package com.jaimin.portfolio_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.SkillRequest;
import com.jaimin.portfolio_backend.entity.Skill;
import com.jaimin.portfolio_backend.repository.SkillRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    public Skill createSkill(SkillRequest request) {

        Skill skill = Skill.builder()
                .name(request.getName())
                .category(request.getCategory())
                .proficiency(request.getProficiency())
                .build();

        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
    }

    public Skill updateSkill(Long id, SkillRequest request) {

        Skill skill = getSkillById(id);

        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setProficiency(request.getProficiency());

        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {

        Skill skill = getSkillById(id);

        skillRepository.delete(skill);
    }

    public void bulkDelete(List<Long> ids) {
        skillRepository.deleteAllByIdInBatch(ids);
    }
}