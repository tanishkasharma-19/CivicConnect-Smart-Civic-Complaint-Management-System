package com.nagarvaani.service;

import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.enums.Role;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.ComplaintRepository;
import com.nagarvaani.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

/*
 * Transparency rules for the assigned officer:
 *  - the officer's NAME is visible to every logged-in user
 *  - the officer's EMAIL and PHONE are visible only to the citizen who filed the complaint
 */
@ExtendWith(MockitoExtension.class)
class OfficerVisibilityTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ComplaintService complaintService;

    private User user(Long id, String name, String email, String phone, Role role) {
        User user = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .role(role)
                .isActive(true)
                .build();
        user.setId(id);
        return user;
    }

    private Complaint complaint(User reportedBy, User assignedTo) {
        return Complaint.builder()
                .id(10L)
                .title("Pothole")
                .upvoteCount(0)
                .createdAt(LocalDateTime.now())
                .category(ComplaintCategory.ROAD)
                .status(ComplaintStatus.ASSIGNED)
                .reportedBy(reportedBy)
                .assignedTo(assignedTo)
                .build();
    }

    private final User owner =
            user(1L, "Citizen Owner", "owner@example.com", "9000000001", Role.CITIZEN);

    private final User otherCitizen =
            user(2L, "Other Citizen", "other@example.com", "9000000002", Role.CITIZEN);

    private final User officer =
            user(3L, "Officer Sharma", "officer@example.com", "9876543210", Role.OFFICER);

    @Test
    void owner_seesOfficerNameEmailAndPhone() {
        when(complaintRepository.findById(10L))
                .thenReturn(Optional.of(complaint(owner, officer)));
        when(userRepository.findByEmail("owner@example.com"))
                .thenReturn(Optional.of(owner));

        ComplaintResponse response =
                complaintService.getComplaintById(10L, "owner@example.com");

        assertEquals("Officer Sharma", response.getOfficerName());
        assertEquals("officer@example.com", response.getOfficerEmail());
        assertEquals("9876543210", response.getOfficerPhone());
    }

    @Test
    void anotherCitizen_seesOnlyTheOfficerName() {
        when(complaintRepository.findById(10L))
                .thenReturn(Optional.of(complaint(owner, officer)));
        when(userRepository.findByEmail("other@example.com"))
                .thenReturn(Optional.of(otherCitizen));

        ComplaintResponse response =
                complaintService.getComplaintById(10L, "other@example.com");

        assertEquals("Officer Sharma", response.getOfficerName());
        assertNull(response.getOfficerEmail());
        assertNull(response.getOfficerPhone());
    }

    @Test
    void complaintWithoutOfficer_hasNoOfficerDetails() {
        when(complaintRepository.findById(10L))
                .thenReturn(Optional.of(complaint(owner, null)));
        when(userRepository.findByEmail("owner@example.com"))
                .thenReturn(Optional.of(owner));

        ComplaintResponse response =
                complaintService.getComplaintById(10L, "owner@example.com");

        assertNull(response.getOfficerName());
        assertNull(response.getOfficerEmail());
        assertNull(response.getOfficerPhone());
    }

    @Test
    void unknownRequester_getsNoContactDetails() {
        when(complaintRepository.findById(10L))
                .thenReturn(Optional.of(complaint(owner, officer)));
        when(userRepository.findByEmail("ghost@example.com"))
                .thenReturn(Optional.empty());

        ComplaintResponse response =
                complaintService.getComplaintById(10L, "ghost@example.com");

        assertEquals("Officer Sharma", response.getOfficerName());
        assertNull(response.getOfficerEmail());
        assertNull(response.getOfficerPhone());
    }
}