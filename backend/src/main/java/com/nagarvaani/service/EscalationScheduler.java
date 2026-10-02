package com.nagarvaani.service;

import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.repository.ComplaintRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationScheduler {

    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public EscalationScheduler(
            ComplaintRepository complaintRepository,
            NotificationService notificationService,
            EmailService emailService) {

        this.complaintRepository = complaintRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void escalateOverdueComplaints() {

        LocalDateTime now = LocalDateTime.now();

        List<Complaint> overdueComplaints =
                complaintRepository
                        .findByDeadlineBeforeAndStatusNot(
                                now,
                                ComplaintStatus.RESOLVED);

        for (Complaint complaint : overdueComplaints) {

            complaint.setEscalationLevel(
                    complaint.getEscalationLevel() + 1
            );

            complaintRepository.save(complaint);

            notificationService
                    .notifyComplaintEscalated(complaint);

            if (complaint.getReportedBy() != null) {

                emailService.sendEscalationEmail(
                        complaint.getReportedBy().getEmail(),
                        complaint.getId()
                );
            }
        }
    }
}