package com.jaimin.portfolio_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.dto.BlogPostRequest;
import com.jaimin.portfolio_backend.entity.BlogPost;
import com.jaimin.portfolio_backend.service.BlogPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogPostController {

    private final BlogPostService blogPostService;

    /** Public list: published posts only, newest first. */
    @GetMapping
    public List<BlogPost> getPublished() {
        return blogPostService.getPublished();
    }

    /** Public single post by slug (published or draft — drafts stay reachable
     * by direct link for preview, same as project case studies). */
    @GetMapping("/slug/{slug}")
    public BlogPost getBySlug(@PathVariable String slug) {
        return blogPostService.getBySlug(slug);
    }

    /** Admin listing: everything. Secured in SecurityConfig. */
    @GetMapping("/admin/all")
    public List<BlogPost> getAllForAdmin() {
        return blogPostService.getAll();
    }

    @PostMapping
    public BlogPost create(@RequestBody BlogPostRequest request) {
        return blogPostService.create(request);
    }

    @PutMapping("/{id}")
    public BlogPost update(@PathVariable Long id, @RequestBody BlogPostRequest request) {
        return blogPostService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        blogPostService.delete(id);
        return "Blog post deleted successfully";
    }
}
