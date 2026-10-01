package com.nagarvaani.controller;
import com.nagarvaani.dto.DuplicateComplaintResponse;
import com.nagarvaani.enums.ComplaintCategory;

import java.util.List;
import com.nagarvaani.dto.request.CreateComplaintRequest;
import com.nagarvaani.dto.request.UpdateStatusRequest;
import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.Authentication;
import com.nagarvaani.dto.request.UpdateComplaintRequest;
import com.nagarvaani.dto.request.VerifyComplaintRequest;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createComplaint(
            @ModelAttribute CreateComplaintRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.createComplaint(request, authentication.getName()));


    }
    @GetMapping("/check-duplicate")
    public ResponseEntity<?> checkDuplicate(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {

        return ResponseEntity.ok(
                complaintService.checkDuplicate(latitude, longitude));
    }
    @PostMapping("/{id}/upvote")
    public ResponseEntity<?> upvoteComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.upvoteComplaint(
                        id,
                        authentication.getName()));
    }
    @DeleteMapping("/{id}/upvote")
    public ResponseEntity<?> removeUpvote(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.removeUpvote(
                        id,
                        authentication.getName()));
    }
    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id));
    }
    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.getMyComplaints(
                        authentication.getName()));
    }
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ComplaintResponse>> getByStatus(
            @PathVariable ComplaintStatus status) {

        return ResponseEntity.ok(
                complaintService.getComplaintsByStatus(status));
    }
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ComplaintResponse>> getByCategory(
            @PathVariable ComplaintCategory category) {

        return ResponseEntity.ok(
                complaintService.getComplaintsByCategory(category));
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.updateStatus(
                        id,
                        request.getStatus(),
                        authentication.getName()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @ModelAttribute UpdateComplaintRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.updateComplaint(
                        id,
                        request,
                        authentication.getName()));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ComplaintResponse> verifyComplaint(
            @PathVariable Long id,
            @RequestBody VerifyComplaintRequest request) {

        return ResponseEntity.ok(
                complaintService.verifyComplaint(id, request));
    }
    @GetMapping("/assigned")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(
            Authentication authentication) {

        return ResponseEntity.ok(
                complaintService.getAssignedComplaints(
                        authentication.getName()));
    }
    @GetMapping("/duplicates")
    public ResponseEntity<List<DuplicateComplaintResponse>> findDuplicates(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam ComplaintCategory category,
            @RequestParam(required = false) Double radius
    ) {

        List<DuplicateComplaintResponse> duplicates =
                complaintService.findDuplicateComplaints(
                        latitude,
                        longitude,
                        category,
                        radius
                );

        return ResponseEntity.ok(duplicates);
    }
}