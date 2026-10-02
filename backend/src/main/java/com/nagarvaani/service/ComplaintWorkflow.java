package com.nagarvaani.service;

import com.nagarvaani.enums.ComplaintStatus;

public class ComplaintWorkflow {

    public static boolean isValidTransition(
            ComplaintStatus current,
            ComplaintStatus next) {

        switch (current) {

            case REPORTED:
                return next == ComplaintStatus.VERIFIED;

            case VERIFIED:
                return next == ComplaintStatus.ASSIGNED;

            case ASSIGNED:
                return next == ComplaintStatus.IN_PROGRESS;

            case IN_PROGRESS:
                return next == ComplaintStatus.RESOLVED;

            case RESOLVED:
                return next == ComplaintStatus.CLOSED;

            default:
                return false;
        }
    }
}