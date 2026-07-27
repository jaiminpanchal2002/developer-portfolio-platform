package com.jaimin.portfolio_backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaimin.portfolio_backend.entity.Appointment;
import com.jaimin.portfolio_backend.entity.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findAllByOrderByCreatedAtDesc();

    List<Appointment> findByAppointmentDateAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

    long countByStatus(AppointmentStatus status);
}
