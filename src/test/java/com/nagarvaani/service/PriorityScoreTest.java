package com.nagarvaani.service;

import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.model.Complaint;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

/*
 * Priority score = upvotes + days open + category weight
 * (ELECTRICITY and WATER get +5; days stop counting once resolved).
 */
@ExtendWith(MockitoExtension.class)
class PriorityScoreTest {

    // computePriorityScore does not use any repository, so no mocks are needed
    @InjectMocks
    private ComplaintService complaintService;

    private Complaint complaint(
            int upvotes,
            long daysOld,
            ComplaintCategory category,
            ComplaintStatus status) {

        return Complaint.builder()
                .upvoteCount(upvotes)
                .createdAt(LocalDateTime.now().minusDays(daysOld).minusHours(1))
                .category(category)
                .status(status)
                .build();
    }

    @Test
    void score_isUpvotesPlusDaysOpen() {
        Complaint complaint =
                complaint(3, 5, ComplaintCategory.ROAD, ComplaintStatus.REPORTED);

        assertEquals(8, complaintService.computePriorityScore(complaint));
    }

    @Test
    void newComplaintWithNoUpvotes_hasScoreZero() {
        Complaint complaint =
                complaint(0, 0, ComplaintCategory.GARBAGE, ComplaintStatus.REPORTED);

        assertEquals(0, complaintService.computePriorityScore(complaint));
    }

    @Test
    void electricityComplaint_getsFiveExtraPoints() {
        Complaint complaint =
                complaint(0, 0, ComplaintCategory.ELECTRICITY, ComplaintStatus.REPORTED);

        assertEquals(5, complaintService.computePriorityScore(complaint));
    }

    @Test
    void waterComplaint_getsFiveExtraPoints() {
        Complaint complaint =
                complaint(2, 1, ComplaintCategory.WATER, ComplaintStatus.VERIFIED);

        assertEquals(8, complaintService.computePriorityScore(complaint));
    }

    @Test
    void resolvedComplaint_stopsCountingDaysAtResolvedTime() {
        Complaint complaint =
                complaint(1, 10, ComplaintCategory.ROAD, ComplaintStatus.RESOLVED);
        // resolved 7 days after it was filed
        complaint.setResolvedAt(complaint.getCreatedAt().plusDays(7));

        // 1 upvote + 7 days (not 10)
        assertEquals(8, complaintService.computePriorityScore(complaint));
    }
}