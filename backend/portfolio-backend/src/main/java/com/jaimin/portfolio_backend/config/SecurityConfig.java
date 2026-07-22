package com.jaimin.portfolio_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.jaimin.portfolio_backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Public error endpoint (allows returning actual validation/exception messages instead of masking as 403)
                        .requestMatchers("/error").permitAll()
                        // Public static files endpoint
                        .requestMatchers("/uploads/**").permitAll()
                        // Admin-only listing (drafts included) — must precede the
                        // broader public /api/projects/** GET permit below.
                        .requestMatchers("/api/projects/admin/**").authenticated()
                        // Public read-only endpoints for the portfolio views
                        .requestMatchers(HttpMethod.GET, "/api/profile", "/api/profile/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/skills", "/api/skills/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/experiences", "/api/experiences/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/educations", "/api/educations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/certificates", "/api/certificates/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        // Any other requests (CRUD writing, dashboard stats, AI analysis) must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}