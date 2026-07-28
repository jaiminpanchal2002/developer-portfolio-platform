package com.jaimin.portfolio_backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Exact allow-list, not a wildcard pattern: the API is authenticated
        // via a Bearer token in the Authorization header (see api.ts /
        // JwtAuthenticationFilter), never via cookies, so credentials are
        // correctly left disabled below — a wildcard origin combined with
        // allowCredentials(true) would let any site ride on a visitor's
        // session, which this app has no need to risk.
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
