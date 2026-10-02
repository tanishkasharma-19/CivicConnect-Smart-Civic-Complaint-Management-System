package com.nagarvaani.util;

import com.nagarvaani.enums.ComplaintStatus;

import java.util.Map;
import java.util.Set;

public final class ComplaintWorkflow {

    private static final Map<ComplaintStatus, Set<ComplaintStatus>> ALLOWED_TRANSITIONS =
            Map.of(
                    ComplaintStatus.REPORTED,
                    Set.of(ComplaintStatus.VERIFIED),

                    ComplaintStatus.VERIFIED,
                    Set.of(ComplaintStatus.ASSIGNED),

                    ComplaintStatus.ASSIGNED,
                    Set.of(ComplaintStatus.IN_PROGRESS),

                    ComplaintStatus.IN_PROGRESS,
                    Set.of(ComplaintStatus.RESOLVED),

                    ComplaintStatus.RESOLVED,
                    Set.of(ComplaintStatus.CLOSED),

                    // Keep this because your existing escalation
                    // feature allows an escalated complaint to be reassigned.
                    ComplaintStatus.ESCALATED,
                    Set.of(ComplaintStatus.ASSIGNED)
            );

    private ComplaintWorkflow() {
    }

    public static boolean isValidTransition(
            ComplaintStatus oldStatus,
            ComplaintStatus newStatus) {

        if (oldStatus == null ||
                newStatus == null) {

            return false;
        }

        return ALLOWED_TRANSITIONS
                .getOrDefault(
                        oldStatus,
                        Set.of())
                .contains(newStatus);
    }
}