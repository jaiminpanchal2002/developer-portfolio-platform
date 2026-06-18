package com.jaimin.portfolio_backend.controller;

import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.ProfileRequest;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.service.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping
    public Profile createProfile(
            @RequestBody ProfileRequest request) {

        return profileService.createOrUpdateProfile(request);
    }

    @GetMapping
    public Profile getProfile(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        Profile profile = profileService.getProfile();
        if (profile != null) {
            String localizedHeadline = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(profile.getHeadline(), locale);
            String localizedAbout = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(profile.getAbout(), locale);
            String localizedLocation = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(profile.getLocation(), locale);
            
            return Profile.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .headline(localizedHeadline)
                .about(localizedAbout)
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .location(localizedLocation)
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .resumeUrl(profile.getResumeUrl())
                .profileImageUrl(profile.getProfileImageUrl())
                .resumeText(profile.getResumeText())
                .resumeName(profile.getResumeName())
                .build();
        }
        return profile;
    }

    @PutMapping
    public Profile updateProfile(
            @RequestBody ProfileRequest request) {

        return profileService.createOrUpdateProfile(request);
    }
}