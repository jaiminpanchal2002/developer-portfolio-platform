package com.jaimin.portfolio_backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private List<ChatMessage> history;
}
