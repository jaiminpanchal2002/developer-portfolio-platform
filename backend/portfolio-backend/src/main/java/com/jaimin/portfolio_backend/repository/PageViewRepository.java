package com.jaimin.portfolio_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaimin.portfolio_backend.entity.PageView;

public interface PageViewRepository extends JpaRepository<PageView, Long> {

    List<PageView> findByCreatedAtAfter(LocalDateTime since);

    long countByCreatedAtAfter(LocalDateTime since);
}
