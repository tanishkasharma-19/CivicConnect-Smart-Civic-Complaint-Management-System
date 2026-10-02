package com.nagarvaani.service;

import com.nagarvaani.enums.Role;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.Notification;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.NotificationRepository;
import com.nagarvaani.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(
            User user,
            Complaint complaint,
            String type,
            String message) {

        Notification notification = Notification.builder()
                .user(user)
                .complaint(complaint)
                .type(type)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    /*
     * Notify all active admins when a new complaint is submitted.
     */
    public void notifyNewComplaint(
            Complaint complaint) {

        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() == Role.ADMIN)
                .filter(user ->
                        Boolean.TRUE.equals(
                                user.getIsActive()))
                .toList();

        for (User admin : admins) {

            createNotification(
                    admin,
                    complaint,
                    "NEW_COMPLAINT",
                    "New complaint #" +
                            complaint.getId() +
                            " has been submitted."
            );
        }
    }

    public void notifyComplaintStatusChange(
            Complaint complaint,
            String status) {

        User user = complaint.getReportedBy();

        if (user == null) {
            return;
        }

        createNotification(
                user,
                complaint,
                "STATUS_CHANGE",
                "Your complaint #" +
                        complaint.getId() +
                        " status has been changed to " +
                        status
        );
    }

    public void notifyComplaintVerified(
            Complaint complaint) {

        User user = complaint.getReportedBy();

        if (user == null) {
            return;
        }

        createNotification(
                user,
                complaint,
                "VERIFIED",
                "Your complaint #" +
                        complaint.getId() +
                        " has been verified."
        );
    }

    /*
     * Assignment notification:
     * - Citizen gets an update that the complaint
     *   was assigned.
     * - Assigned officer gets an update that the
     *   complaint was assigned to them.
     */
    public void notifyComplaintAssigned(
            Complaint complaint) {

        // Notify citizen
        User citizen = complaint.getReportedBy();

        if (citizen != null) {

            createNotification(
                    citizen,
                    complaint,
                    "ASSIGNED",
                    "Your complaint #" +
                            complaint.getId() +
                            " has been assigned to an officer."
            );
        }

        // Notify assigned officer
        User officer = complaint.getAssignedTo();

        if (officer != null) {

            createNotification(
                    officer,
                    complaint,
                    "ASSIGNED",
                    "Complaint #" +
                            complaint.getId() +
                            " has been assigned to you."
            );
        }
    }

    public void notifyComplaintResolved(
            Complaint complaint) {

        User citizen = complaint.getReportedBy();

        if (citizen != null) {
            createNotification(
                    citizen,
                    complaint,
                    "RESOLVED",
                    "Your complaint #" +
                            complaint.getId() +
                            " has been resolved."
            );
        }

        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() == Role.ADMIN)
                .filter(user ->
                        Boolean.TRUE.equals(
                                user.getIsActive()))
                .toList();

        for (User admin : admins) {
            createNotification(
                    admin,
                    complaint,
                    "RESOLVED",
                    "Complaint #" +
                            complaint.getId() +
                            " has been resolved by the assigned officer."
            );
        }
    }

    public void notifyComplaintEscalated(
            Complaint complaint) {

        User user = complaint.getReportedBy();

        if (user == null) {
            return;
        }

        createNotification(
                user,
                complaint,
                "ESCALATED",
                "Your complaint #" +
                        complaint.getId() +
                        " has been escalated because it exceeded its deadline."
        );
    }

    public List<Notification> getUserNotifications(
            User user) {

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(
            User user) {

        return notificationRepository
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public void markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository.findById(
                        notificationId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"));

        notification.setIsRead(true);

        notificationRepository.save(notification);
    }
    public void notifyOfficerStatusChangeToAdmins(
            Complaint complaint,
            String status) {

        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .filter(user ->
                        Boolean.TRUE.equals(
                                user.getIsActive()))
                .toList();

        for (User admin : admins) {
            createNotification(
                    admin,
                    complaint,
                    "STATUS_CHANGE",
                    "Complaint #" +
                            complaint.getId() +
                            " has been updated to " +
                            status +
                            " by an officer."
            );
        }
    }
}