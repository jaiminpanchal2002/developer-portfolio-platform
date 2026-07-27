package com.jaimin.portfolio_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.dto.BulkIdsRequest;
import com.jaimin.portfolio_backend.dto.CertificateRequest;
import com.jaimin.portfolio_backend.entity.Certificate;
import com.jaimin.portfolio_backend.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping
    public Certificate createCertificate(
            @RequestBody CertificateRequest request) {

        return certificateService.createCertificate(request);
    }

    @GetMapping
    public List<Certificate> getAllCertificates(@RequestHeader(value = "Accept-Language", required = false) String locale) {
        List<Certificate> all = certificateService.getAllCertificates();
        return all.stream().map(c -> {
            String locTitle = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(c.getTitle(), locale);
            String locIssuer = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(c.getIssuer(), locale);
            return Certificate.builder()
                .id(c.getId())
                .title(locTitle)
                .issuer(locIssuer)
                .issueDate(c.getIssueDate())
                .certificateUrl(c.getCertificateUrl())
                .build();
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public Certificate getCertificateById(
            @PathVariable Long id, @RequestHeader(value = "Accept-Language", required = false) String locale) {

        Certificate c = certificateService.getCertificateById(id);
        if (c != null) {
            String locTitle = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(c.getTitle(), locale);
            String locIssuer = com.jaimin.portfolio_backend.util.LocalizationUtils.getLocalizedValue(c.getIssuer(), locale);
            return Certificate.builder()
                .id(c.getId())
                .title(locTitle)
                .issuer(locIssuer)
                .issueDate(c.getIssueDate())
                .certificateUrl(c.getCertificateUrl())
                .build();
        }
        return c;
    }

    @PutMapping("/{id}")
    public Certificate updateCertificate(
            @PathVariable Long id,
            @RequestBody CertificateRequest request) {

        return certificateService.updateCertificate(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteCertificate(
            @PathVariable Long id) {

        certificateService.deleteCertificate(id);

        return "Certificate Deleted Successfully";
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody BulkIdsRequest request) {
        certificateService.bulkDelete(request.getIds());
        return ResponseEntity.ok(Map.of("deleted", request.getIds().size()));
    }
}