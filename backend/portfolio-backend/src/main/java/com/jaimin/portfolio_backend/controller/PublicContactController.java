package com.jaimin.portfolio_backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jaimin.portfolio_backend.entity.ContactInquiry;
import com.jaimin.portfolio_backend.repository.ContactInquiryRepository;

@RestController
@RequestMapping("/api/public")
public class PublicContactController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String senderEmail;

    // A customizable permanent Google Meet link (unused if Jitsi is generated). 
    @Value("${jaimin.meet.link:https://meet.google.com/ira-yipn-ihu}")
    private String defaultMeetLink;

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactInquiry(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String message = (String) request.get("message");

        Object scheduleMeetingObj = request.get("scheduleMeeting");
        boolean scheduleMeeting = false;
        if (scheduleMeetingObj instanceof Boolean) {
            scheduleMeeting = (Boolean) scheduleMeetingObj;
        } else if (scheduleMeetingObj instanceof String) {
            scheduleMeeting = Boolean.parseBoolean((String) scheduleMeetingObj);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Inquiry received. Thank you for connecting!");

        System.out.println("=================================================");
        System.out.println("NEW CONTACT FORM INQUIRY RECEIVED:");
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Message: " + message);

        String meetLink = "";
        String date = "";
        String time = "";

        if (scheduleMeeting) {
            String cleanName = name != null ? name.replaceAll("[^a-zA-Z0-9]", "") : "Guest";
            meetLink = "https://meet.jit.si/DeveloperCounselling-" + cleanName + "-" + (System.currentTimeMillis() % 1000000);
            date = (String) request.get("meetingDate");
            time = (String) request.get("meetingTime");
            response.put("googleMeetLink", meetLink);

            System.out.println("-------------------------------------------------");
            System.out.println("CALENDAR INVITE GENERATED (JITSI MEET):");
            System.out.println("Meeting Link: " + meetLink);
            System.out.println("Scheduled Date: " + date);
            System.out.println("Scheduled Time: " + time);
        }

        // Save inquiry/booking to the database
        ContactInquiry inquiry = ContactInquiry.builder()
                .name(name)
                .email(email)
                .message(message)
                .scheduleMeeting(scheduleMeeting)
                .meetingDate(scheduleMeeting ? date : null)
                .meetingTime(scheduleMeeting ? time : null)
                .meetingLink(scheduleMeeting ? meetLink : null)
                .isRead(false)
                .build();
        contactInquiryRepository.save(inquiry);
        System.out.println("Saved inquiry/booking to database with ID: " + inquiry.getId());

        System.out.println("-------------------------------------------------");
        System.out.println("DISPATCHING REAL HTML EMAILS...");

        String visitorSubject = scheduleMeeting ? "Meeting Scheduled - Jaimin Panchal" : "Inquiry Received - Jaimin Panchal";
        String visitorHtml = buildVisitorEmailHtml(name, message, scheduleMeeting, date, time, meetLink);

        String ownerSubject = scheduleMeeting ? "New Meeting Scheduled - " + name : "New Portfolio Inquiry - " + name;
        String ownerHtml = buildOwnerEmailHtml(name, email, message, scheduleMeeting, date, time, meetLink);

        // Send to visitor
        sendRealEmail(email, visitorSubject, visitorHtml);

        // Send to owner (jaimin@gmail.com or customized)
        String targetOwner = "jaiminpanchal939@gmail.com";
        if (senderEmail != null && !senderEmail.equals("your-email@gmail.com") && senderEmail.contains("@")) {
            targetOwner = senderEmail;
        }
        sendRealEmail(targetOwner, ownerSubject, ownerHtml);

        System.out.println("=================================================");

        return ResponseEntity.ok(response);
    }

    private void sendRealEmail(String to, String subject, String htmlBody) {
        try {
            if (senderEmail == null || senderEmail.equals("your-email@gmail.com") || !senderEmail.contains("@")) {
                System.out.println("SKIPPED: Real email to " + to + " (Mail credentials not configured yet, falling back to simulated logs).");
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            helper.setFrom(senderEmail);
            mailSender.send(message);
            System.out.println("SUCCESS: Real HTML email dispatched to " + to);
        } catch (Exception e) {
            System.err.println("WARNING: Could not dispatch real HTML email to " + to + " due to: " + e.getMessage());
            System.err.println("Ensure SMTP credentials in application.properties are configured and valid.");
        }
    }

    private String buildVisitorEmailHtml(String name, String message, boolean scheduled, String date, String time, String meetLink) {
        String meetingBox = "";
        if (scheduled) {
            meetingBox = 
                "      <div style=\"background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;\">" +
                "        <p style=\"font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 12px 0;\">" +
                "          🎥 Virtual Meeting Confirmed" +
                "        </p>" +
                "        <p style=\"font-size: 15px; color: #f1f5f9; margin: 6px 0;\">📅 <b>Date:</b> " + date + "</p>" +
                "        <p style=\"font-size: 15px; color: #f1f5f9; margin: 6px 0;\">⏰ <b>Time:</b> " + time + "</p>" +
                "        <div style=\"margin-top: 18px;\">" +
                "          <a href=\"" + meetLink + "\" target=\"_blank\" style=\"display: inline-block; background-color: #06b6d4; color: #000000; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);\">" +
                "            Join Jitsi Meet Room" +
                "          </a>" +
                "        </div>" +
                "        <p style=\"font-size: 12px; color: #64748b; margin: 12px 0 0 0;\">" +
                "          Meeting URL: <a href=\"" + meetLink + "\" style=\"color: #06b6d4; text-decoration: underline;\">" + meetLink + "</a>" +
                "        </p>" +
                "      </div>";
        }

        return 
            "<html><body style=\"background-color: #090d16; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; margin: 0;\">" +
            "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">" +
            "    <h1 style=\"font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 0; background: linear-gradient(to right, #22d3ee, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;\">" +
            "      Jaimin Panchal" +
            "    </h1>" +
            "    <p style=\"font-size: 16px; color: #cbd5e1; line-height: 1.6;\">" +
            "      Hello <b>" + name + "</b>," +
            "    </p>" +
            "    <p style=\"font-size: 16px; color: #cbd5e1; line-height: 1.6;\">" +
            "      " + (scheduled ? "Your 1-on-1 video session is confirmed! Below are the calendar details and your meeting entry link." : "Thank you for reaching out! I have received your message and will review it shortly.") +
            "    </p>" +
            meetingBox +
            "    <div style=\"background-color: #020617/50; border-left: 3px solid #64748b; padding: 12px 16px; margin: 20px 0;\">" +
            "      <p style=\"font-size: 11px; font-weight: bold; color: #64748b; margin: 0 0 4px 0;\">YOUR MESSAGE DETAILS:</p>" +
            "      <p style=\"font-size: 14px; color: #94a3b8; font-style: italic; margin: 0;\">\"" + message + "\"</p>" +
            "    </div>" +
            "    <p style=\"font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;\">" +
            "      This is an automated notification from Jaimin Panchal's Developer Portfolio Platform." +
            "    </p>" +
            "  </div>" +
            "</body></html>";
    }

    private String buildOwnerEmailHtml(String visitorName, String visitorEmail, String message, boolean scheduled, String date, String time, String meetLink) {
        String meetingBox = "";
        if (scheduled) {
            meetingBox = 
                "      <div style=\"background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;\">" +
                "        <p style=\"font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 12px 0;\">" +
                "          📅 CONFIRMED MEETING DETAILS" +
                "        </p>" +
                "        <p style=\"font-size: 15px; color: #f1f5f9; margin: 6px 0;\">🗓️ <b>Date:</b> " + date + "</p>" +
                "        <p style=\"font-size: 15px; color: #f1f5f9; margin: 6px 0;\">⏰ <b>Time:</b> " + time + "</p>" +
                "        <div style=\"margin-top: 18px;\">" +
                "          <a href=\"" + meetLink + "\" target=\"_blank\" style=\"display: inline-block; background-color: #06b6d4; color: #000000; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);\">" +
                "            Enter Jitsi Meet Room" +
                "          </a>" +
                "        </div>" +
                "        <p style=\"font-size: 12px; color: #64748b; margin: 12px 0 0 0;\">" +
                "          Meeting URL: <a href=\"" + meetLink + "\" style=\"color: #06b6d4; text-decoration: underline;\">" + meetLink + "</a>" +
                "        </p>" +
                "      </div>";
        }

        return 
            "<html><body style=\"background-color: #090d16; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; margin: 0;\">" +
            "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">" +
            "    <h2 style=\"font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 0; border-bottom: 1px solid #1e293b; padding-bottom: 15px;\">" +
            "      " + (scheduled ? "🗓️ New Meeting Booked" : "📩 New Portfolio Inquiry") +
            "    </h2>" +
            "    <p style=\"font-size: 16px; color: #cbd5e1; line-height: 1.6;\">" +
            "      You have received a new contact submission from <b>" + visitorName + "</b> (<a href=\"mailto:" + visitorEmail + "\" style=\"color: #06b6d4;\">" + visitorEmail + "</a>)." +
            "    </p>" +
            meetingBox +
            "    <div style=\"background-color: #020617; border-left: 3px solid #06b6d4; padding: 16px; margin: 20px 0; border-radius: 4px;\">" +
            "      <p style=\"font-size: 11px; font-weight: bold; color: #64748b; margin: 0 0 8px 0;\">SUBMITTED INQUIRY MESSAGE:</p>" +
            "      <p style=\"font-size: 14px; color: #e2e8f0; margin: 0; line-height: 1.5;\">\"" + message + "\"</p>" +
            "    </div>" +
            "  </div>" +
            "</body></html>";
    }
}
