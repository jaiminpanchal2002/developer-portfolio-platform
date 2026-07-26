package com.jaimin.portfolio_backend.config;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // The default RestTemplate has no timeout at all — fine for the
        // occasional Adzuna call, risky once Gemini calls can run in
        // parallel (a hung upstream request would tie up a thread
        // indefinitely). Bounded connect/read timeouts instead.
        return builder
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofSeconds(25))
                .build();
    }
}