package com.jaimin.portfolio_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        "file:uploads/");
    }

    // CORS is configured once, in CorsConfig's CorsConfigurationSource bean,
    // which Spring Security's .cors(Customizer.withDefaults()) picks up. A
    // second, narrower MVC-level mapping here previously allowed only
    // GET/POST/PUT/DELETE/OPTIONS (no PATCH) and could silently diverge from
    // the security-layer config, so it's been removed.
}