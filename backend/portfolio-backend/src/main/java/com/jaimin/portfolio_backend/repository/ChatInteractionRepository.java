package com.jaimin.portfolio_backend.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaimin.portfolio_backend.entity.ChatInteraction;

public interface ChatInteractionRepository extends JpaRepository<ChatInteraction, Long> {
    long countByCreatedAtAfter(LocalDateTime after);
}
