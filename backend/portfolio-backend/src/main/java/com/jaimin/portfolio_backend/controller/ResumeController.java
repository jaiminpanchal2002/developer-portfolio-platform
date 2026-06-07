package com.jaimin.portfolio_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.service.ProfileService;
import com.jaimin.portfolio_backend.service.ResumeAiService;
import com.jaimin.portfolio_backend.dto.ResumeAnalysisDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ProfileService profileService;
    private final ResumeAiService resumeAiService;
    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Ensure uploads directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate a unique filename and copy file
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/" + fileName;

            // Extract text using PDFBox if it's a PDF, otherwise read as plain text
            String parsedText = "";
            String contentType = file.getContentType();
            if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    parsedText = stripper.getText(document);
                }
            } else {
                parsedText = new String(file.getBytes());
            }

            // Get or create active profile
            Profile profile = profileService.getProfile();
            if (profile == null) {
                profile = new Profile();
            }

            // Update resume details in Profile
            profile.setResumeUrl(fileUrl);
            profile.setResumeName(file.getOriginalFilename());
            profile.setResumeText(parsedText);
            profileService.saveProfile(profile);

            // Calculate analysis directly for feedback
            ResumeAnalysisDTO analysis = resumeAiService.analyzeResume(parsedText);

            Map<String, Object> response = new HashMap<>();
            response.put("fileName", file.getOriginalFilename());
            response.put("fileUrl", fileUrl);
            response.put("parsedText", parsedText);
            response.put("analysis", analysis);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to process file: " + e.getMessage());
        }
    }

    @GetMapping("/details")
    public ResponseEntity<?> getResumeDetails() {
        Profile profile = profileService.getProfile();
        Map<String, Object> response = new HashMap<>();
        if (profile != null && profile.getResumeUrl() != null && !profile.getResumeUrl().isEmpty()) {
            response.put("hasResume", true);
            response.put("fileName", profile.getResumeName() != null ? profile.getResumeName() : "resume.pdf");
            response.put("fileUrl", profile.getResumeUrl());
            response.put("resumeText", profile.getResumeText());
        } else {
            response.put("hasResume", false);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteResume() {
        Profile profile = profileService.getProfile();
        if (profile != null) {
            profile.setResumeUrl(null);
            profile.setResumeName(null);
            profile.setResumeText(null);
            profileService.saveProfile(profile);
            return ResponseEntity.ok("Resume deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
