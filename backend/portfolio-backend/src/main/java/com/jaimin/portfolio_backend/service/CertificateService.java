package com.jaimin.portfolio_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.CertificateRequest;
import com.jaimin.portfolio_backend.entity.Certificate;
import com.jaimin.portfolio_backend.repository.CertificateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public Certificate createCertificate(
            CertificateRequest request) {

        Certificate certificate = Certificate.builder()
                .title(request.getTitle())
                .issuer(request.getIssuer())
                .issueDate(request.getIssueDate())
                .certificateUrl(request.getCertificateUrl())
                .build();

        return certificateRepository.save(certificate);
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public Certificate getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Certificate not found"));
    }

    public Certificate updateCertificate(
            Long id,
            CertificateRequest request) {

        Certificate certificate = getCertificateById(id);

        certificate.setTitle(request.getTitle());
        certificate.setIssuer(request.getIssuer());
        certificate.setIssueDate(request.getIssueDate());
        certificate.setCertificateUrl(request.getCertificateUrl());

        return certificateRepository.save(certificate);
    }

    public void deleteCertificate(Long id) {

        Certificate certificate = getCertificateById(id);

        certificateRepository.delete(certificate);
    }

    public void bulkDelete(List<Long> ids) {
        certificateRepository.deleteAllByIdInBatch(ids);
    }
}