package com.jaimin.portfolio_backend.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.BlogPostRequest;
import com.jaimin.portfolio_backend.entity.BlogPost;
import com.jaimin.portfolio_backend.repository.BlogPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;

    public BlogPost create(BlogPostRequest request) {
        boolean published = request.getPublished() == null ? true : request.getPublished();
        LocalDateTime now = LocalDateTime.now();
        return blogPostRepository.save(BlogPost.builder()
                .title(request.getTitle())
                .slug(uniqueSlug(resolveSlug(request), null))
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .coverImageUrl(request.getCoverImageUrl())
                .tags(request.getTags())
                .readMinutes(request.getReadMinutes() != null
                        ? request.getReadMinutes()
                        : estimateReadMinutes(request.getContent()))
                .published(published)
                .publishedAt(published ? now : null)
                .createdAt(now)
                .updatedAt(now)
                .build());
    }

    public List<BlogPost> getAll() {
        return blogPostRepository.findAll().stream()
                .sorted(Comparator.comparing(
                        BlogPost::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /** Public list: published only, newest first. */
    public List<BlogPost> getPublished() {
        return getAll().stream()
                .filter(p -> !Boolean.FALSE.equals(p.getPublished()))
                .toList();
    }

    public BlogPost getById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post " + id + " not found"));
    }

    public BlogPost getBySlug(String slug) {
        return blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog post '" + slug + "' not found"));
    }

    public BlogPost update(Long id, BlogPostRequest request) {
        BlogPost post = getById(id);

        post.setTitle(request.getTitle());
        // Only recompute the slug when the caller supplied one, so existing
        // permalinks stay stable across ordinary edits.
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String candidate = slugify(request.getSlug());
            if (!candidate.equals(post.getSlug())) {
                post.setSlug(uniqueSlug(candidate, id));
            }
        }
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setTags(request.getTags());
        post.setReadMinutes(request.getReadMinutes() != null
                ? request.getReadMinutes()
                : estimateReadMinutes(request.getContent()));

        if (request.getPublished() != null) {
            boolean wasPublished = !Boolean.FALSE.equals(post.getPublished());
            boolean nowPublished = request.getPublished();
            post.setPublished(nowPublished);
            // Stamp publishedAt the first time it goes live.
            if (nowPublished && (!wasPublished || post.getPublishedAt() == null)) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }
        post.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    public void delete(Long id) {
        blogPostRepository.delete(getById(id));
    }

    private String resolveSlug(BlogPostRequest request) {
        String base = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug()
                : request.getTitle();
        return slugify(base);
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "post-" + System.currentTimeMillis();
        }
        String slug = input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        return slug.isBlank() ? "post-" + System.currentTimeMillis() : slug;
    }

    /** Ensures slug uniqueness, ignoring the row being updated. */
    private String uniqueSlug(String base, Long selfId) {
        String candidate = base;
        int suffix = 2;
        while (true) {
            var existing = blogPostRepository.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().getId().equals(selfId)) {
                return candidate;
            }
            candidate = base + "-" + suffix++;
        }
    }

    private Integer estimateReadMinutes(String content) {
        if (content == null || content.isBlank()) return 1;
        int words = content.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }
}
