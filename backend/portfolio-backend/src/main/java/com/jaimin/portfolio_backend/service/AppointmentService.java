package com.jaimin.portfolio_backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.jaimin.portfolio_backend.dto.AppointmentRequest;
import com.jaimin.portfolio_backend.entity.Appointment;
import com.jaimin.portfolio_backend.entity.AppointmentStatus;
import com.jaimin.portfolio_backend.entity.Profile;
import com.jaimin.portfolio_backend.repository.AppointmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    /** Fixed business-hours slots, 24h "HH:mm". Kept simple and predictable
     *  rather than configurable — this is a solo-owner booking calendar. */
    public static final List<String> SLOTS = List.of(
            "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00");

    private static final List<AppointmentStatus> BLOCKING_STATUSES =
            List.of(AppointmentStatus.PENDING, AppointmentStatus.APPROVED);

    private final AppointmentRepository appointmentRepository;
    private final ProfileService profileService;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public List<String> getAvailableSlots(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            return List.of();
        }
        List<String> taken = appointmentRepository.findByAppointmentDateAndStatusIn(date, BLOCKING_STATUSES)
                .stream().map(Appointment::getAppointmentTime).toList();
        List<String> available = new ArrayList<>(SLOTS);
        available.removeAll(taken);
        return available;
    }

    public Appointment book(AppointmentRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getAppointmentDate() == null || request.getAppointmentTime() == null) {
            throw new IllegalArgumentException("Date and time are required");
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Can't book an appointment in the past");
        }
        if (!SLOTS.contains(request.getAppointmentTime())) {
            throw new IllegalArgumentException("Not a valid time slot");
        }
        boolean taken = appointmentRepository
                .findByAppointmentDateAndStatusIn(request.getAppointmentDate(), BLOCKING_STATUSES)
                .stream().anyMatch(a -> a.getAppointmentTime().equals(request.getAppointmentTime()));
        if (taken) {
            throw new IllegalStateException("That slot was just taken — please pick another");
        }

        Appointment appointment = Appointment.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .company(request.getCompany())
                .purpose(request.getPurpose())
                .message(request.getMessage())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .build();
        Appointment saved = appointmentRepository.save(appointment);

        CompletableFuture.runAsync(() -> {
            sendEmail(saved.getEmail(), "Appointment Request Received",
                    visitorEmailHtml(saved, "Your appointment request has been received and is pending approval.", false));
            String ownerEmail = adminEmail();
            if (ownerEmail != null) {
                sendEmail(ownerEmail, "New Appointment Request from " + saved.getName(),
                        ownerEmailHtml(saved, "A new appointment request needs your review."));
            }
        });

        return saved;
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment " + id + " not found"));
    }

    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getById(id);
        applyStatus(appointment, status);
        return appointmentRepository.save(appointment);
    }

    public void bulkUpdateStatus(List<Long> ids, AppointmentStatus status) {
        List<Appointment> appointments = appointmentRepository.findAllById(ids);
        appointments.forEach(a -> applyStatus(a, status));
        appointmentRepository.saveAll(appointments);
    }

    private void applyStatus(Appointment appointment, AppointmentStatus status) {
        appointment.setStatus(status);
        if (status == AppointmentStatus.APPROVED) {
            if (appointment.getMeetingLink() == null || appointment.getMeetingLink().isBlank()) {
                String cleanName = appointment.getName() != null
                        ? appointment.getName().replaceAll("[^a-zA-Z0-9]", "")
                        : "Guest";
                appointment.setMeetingLink(
                        "https://meet.jit.si/Appointment-" + cleanName + "-" + (System.currentTimeMillis() % 1000000));
            }
            CompletableFuture.runAsync(() -> sendEmail(appointment.getEmail(), "Appointment Approved",
                    visitorEmailHtml(appointment, "Good news — your appointment has been approved.", true)));
        } else if (status == AppointmentStatus.REJECTED) {
            CompletableFuture.runAsync(() -> sendEmail(appointment.getEmail(), "Appointment Update",
                    visitorEmailHtml(appointment, "Unfortunately this time slot couldn't be confirmed. Feel free to request another.", false)));
        }
    }

    public void delete(Long id) {
        appointmentRepository.delete(getById(id));
    }

    public void bulkDelete(List<Long> ids) {
        appointmentRepository.deleteAllByIdInBatch(ids);
    }

    private String adminEmail() {
        Profile profile = profileService.getProfile();
        if (profile != null && profile.getEmail() != null && !profile.getEmail().isBlank()) {
            return profile.getEmail();
        }
        return (senderEmail != null && !senderEmail.isBlank()) ? senderEmail : null;
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        if (senderEmail == null || senderEmail.isBlank() || to == null || to.isBlank()) {
            System.out.println("SKIPPED appointment email to " + to + " — mail credentials not configured yet.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom(senderEmail);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("WARNING: appointment email to " + to + " failed: " + e.getMessage());
        }
    }

    private String visitorEmailHtml(Appointment a, String headline, boolean includeMeetingLink) {
        String meetingBox = includeMeetingLink && a.getMeetingLink() != null
                ? "<div style=\"background:#020617;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:20px 0;\">"
                        + "<p style=\"font-size:12px;color:#64748b;text-transform:uppercase;font-weight:800;margin:0 0 10px;\">Meeting Link</p>"
                        + "<a href=\"" + a.getMeetingLink() + "\" style=\"color:#06b6d4;font-weight:700;\">" + a.getMeetingLink() + "</a>"
                        + "</div>"
                : "";
        return "<html><body style=\"background:#090d16;color:#cbd5e1;font-family:sans-serif;padding:32px;\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#0b1329;border:1px solid #1e293b;border-radius:16px;padding:32px;\">"
                + "<h2 style=\"color:#fff;margin-top:0;\">" + headline + "</h2>"
                + "<p>Hi " + a.getName() + ",</p>"
                + "<p style=\"font-size:14px;color:#94a3b8;\">Date: <b>" + a.getAppointmentDate() + "</b> at <b>" + a.getAppointmentTime() + "</b></p>"
                + meetingBox
                + "<p style=\"font-size:13px;color:#64748b;margin-top:24px;border-top:1px solid #1e293b;padding-top:16px;\">Automated notification from the portfolio appointment system.</p>"
                + "</div></body></html>";
    }

    private String ownerEmailHtml(Appointment a, String headline) {
        return "<html><body style=\"background:#090d16;color:#cbd5e1;font-family:sans-serif;padding:32px;\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#0b1329;border:1px solid #1e293b;border-radius:16px;padding:32px;\">"
                + "<h2 style=\"color:#fff;margin-top:0;\">" + headline + "</h2>"
                + "<p><b>" + a.getName() + "</b> (" + a.getEmail() + (a.getPhone() != null && !a.getPhone().isBlank() ? ", " + a.getPhone() : "") + ")</p>"
                + (a.getCompany() != null && !a.getCompany().isBlank() ? "<p>Company: " + a.getCompany() + "</p>" : "")
                + (a.getPurpose() != null && !a.getPurpose().isBlank() ? "<p>Purpose: " + a.getPurpose() + "</p>" : "")
                + "<p style=\"font-size:14px;color:#94a3b8;\">Requested: <b>" + a.getAppointmentDate() + "</b> at <b>" + a.getAppointmentTime() + "</b></p>"
                + "<div style=\"background:#020617;border-left:3px solid #06b6d4;padding:14px;margin:16px 0;border-radius:4px;\">"
                + "<p style=\"font-size:13px;color:#e2e8f0;margin:0;\">" + (a.getMessage() != null ? a.getMessage() : "") + "</p>"
                + "</div>"
                + "</div></body></html>";
    }
}
