package com.jaimin.portfolio_backend.dto;

import lombok.Data;

@Data
public class BlogPostRequest {

    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImageUrl;
    private String tags;
    private Integer readMinutes;
    private Boolean published;
}
