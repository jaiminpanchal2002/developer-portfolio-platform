package com.jaimin.portfolio_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Media library over the uploads/ directory. Authenticated by the default
 * security rule (only GETs on explicitly whitelisted paths are public).
 */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final Path UPLOAD_DIR = Paths.get("uploads");

    public record MediaFile(
            String name,
            String url,
            long sizeBytes,
            LocalDateTime modifiedAt,
            boolean image) {
    }

    @GetMapping
    public List<MediaFile> list() throws IOException {
        if (!Files.exists(UPLOAD_DIR)) {
            return List.of();
        }
        List<MediaFile> files = new ArrayList<>();
        try (Stream<Path> stream = Files.list(UPLOAD_DIR)) {
            stream.filter(Files::isRegularFile).forEach(path -> {
                try {
                    String name = path.getFileName().toString();
                    files.add(new MediaFile(
                            name,
                            "/uploads/" + name,
                            Files.size(path),
                            LocalDateTime.ofInstant(
                                    Files.getLastModifiedTime(path).toInstant(),
                                    ZoneId.systemDefault()),
                            isImage(name)));
                } catch (IOException ignored) {
                    // Skip files that vanish mid-listing.
                }
            });
        }
        files.sort(Comparator.comparing(MediaFile::modifiedAt).reversed());
        return files;
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> delete(@RequestParam("name") String name)
            throws IOException {
        // Path-traversal guard: the resolved file must stay inside uploads/.
        if (name.contains("/") || name.contains("\\") || name.contains("..")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid file name"));
        }
        Path target = UPLOAD_DIR.resolve(name).normalize();
        if (!target.startsWith(UPLOAD_DIR.normalize()) || !Files.isRegularFile(target)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "File not found"));
        }
        Files.delete(target);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    private boolean isImage(String name) {
        String lower = name.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg")
                || lower.endsWith(".avif");
    }
}
