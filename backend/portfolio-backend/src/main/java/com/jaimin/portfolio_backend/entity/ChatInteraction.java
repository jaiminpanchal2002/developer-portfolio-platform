package com.jaimin.portfolio_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/** One row per successful chatbot reply — powers the "Chatbot usage" dashboard stat. */
@Entity
@Table(name = "chat_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;
}
