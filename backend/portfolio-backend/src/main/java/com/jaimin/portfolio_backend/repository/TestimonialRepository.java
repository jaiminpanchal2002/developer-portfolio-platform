package com.jaimin.portfolio_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaimin.portfolio_backend.entity.Testimonial;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
}
