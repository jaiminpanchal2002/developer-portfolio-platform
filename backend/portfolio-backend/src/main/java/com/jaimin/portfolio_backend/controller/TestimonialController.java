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

import com.jaimin.portfolio_backend.dto.TestimonialRequest;
import com.jaimin.portfolio_backend.entity.Testimonial;
import com.jaimin.portfolio_backend.service.TestimonialService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    /** Public: published testimonials only. */
    @GetMapping
    public List<Testimonial> getPublished() {
        return testimonialService.getPublished();
    }

    /** Admin: everything, drafts included. Secured in SecurityConfig. */
    @GetMapping("/admin/all")
    public List<Testimonial> getAllForAdmin() {
        return testimonialService.getAll();
    }

    @PostMapping
    public Testimonial create(@RequestBody TestimonialRequest request) {
        return testimonialService.create(request);
    }

    @PutMapping("/{id}")
    public Testimonial update(@PathVariable Long id, @RequestBody TestimonialRequest request) {
        return testimonialService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        testimonialService.delete(id);
        return "Testimonial Deleted Successfully";
    }
}
