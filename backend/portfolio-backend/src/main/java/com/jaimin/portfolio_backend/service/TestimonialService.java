package com.jaimin.portfolio_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.TestimonialRequest;
import com.jaimin.portfolio_backend.entity.Testimonial;
import com.jaimin.portfolio_backend.repository.TestimonialRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;

    public Testimonial create(TestimonialRequest request) {
        return testimonialRepository.save(Testimonial.builder()
                .authorName(request.getAuthorName())
                .authorRole(request.getAuthorRole())
                .quote(request.getQuote())
                .avatarUrl(request.getAvatarUrl())
                .linkUrl(request.getLinkUrl())
                .displayOrder(request.getDisplayOrder())
                .published(request.getPublished() == null ? Boolean.TRUE : request.getPublished())
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<Testimonial> getAll() {
        return testimonialRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"));
    }

    /** Public view: drafts hidden; NULL published counts as published. */
    public List<Testimonial> getPublished() {
        return getAll().stream()
                .filter(t -> !Boolean.FALSE.equals(t.getPublished()))
                .toList();
    }

    public Testimonial update(Long id, TestimonialRequest request) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testimonial with ID " + id + " not found"));

        testimonial.setAuthorName(request.getAuthorName());
        testimonial.setAuthorRole(request.getAuthorRole());
        testimonial.setQuote(request.getQuote());
        testimonial.setAvatarUrl(request.getAvatarUrl());
        testimonial.setLinkUrl(request.getLinkUrl());
        testimonial.setDisplayOrder(request.getDisplayOrder());
        if (request.getPublished() != null) {
            testimonial.setPublished(request.getPublished());
        }
        return testimonialRepository.save(testimonial);
    }

    public void delete(Long id) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testimonial with ID " + id + " not found"));
        testimonialRepository.delete(testimonial);
    }
}
