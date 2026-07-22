package com.jaimin.portfolio_backend.dto;

import lombok.Data;

@Data
public class TestimonialRequest {

    private String authorName;
    private String authorRole;
    private String quote;
    private String avatarUrl;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean published;
}
