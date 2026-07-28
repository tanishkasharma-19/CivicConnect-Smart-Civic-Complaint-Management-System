package com.nagarvaani.controller;

import com.nagarvaani.dto.request.CreateComplaintRequest;
import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
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
}