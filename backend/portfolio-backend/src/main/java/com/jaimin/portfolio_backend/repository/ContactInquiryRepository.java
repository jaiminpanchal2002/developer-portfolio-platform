package com.jaimin.portfolio_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.jaimin.portfolio_backend.entity.ContactInquiry;
import java.util.List;

public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    List<ContactInquiry> findAllByOrderByCreatedAtDesc();
}
