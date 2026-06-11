package com.jaimin.portfolio_backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jaimin.portfolio_backend.entity.ContactInquiry;
import com.jaimin.portfolio_backend.repository.ContactInquiryRepository;

@RestController
@RequestMapping("/api/contact-inquiries")
public class ContactInquiryController {

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @GetMapping
    public ResponseEntity<List<ContactInquiry>> getAllInquiries() {
        List<ContactInquiry> inquiries = contactInquiryRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(inquiries);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ContactInquiry> markAsRead(@PathVariable Long id) {
        return contactInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setIsRead(true);
                    contactInquiryRepository.save(inquiry);
                    return ResponseEntity.ok(inquiry);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        if (contactInquiryRepository.existsById(id)) {
            contactInquiryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
