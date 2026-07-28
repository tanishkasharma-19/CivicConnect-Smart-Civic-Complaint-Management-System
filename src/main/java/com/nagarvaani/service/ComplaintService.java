package com.nagarvaani.service;

import com.nagarvaani.dto.request.CreateComplaintRequest;
import com.nagarvaani.dto.response.ComplaintResponse;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.Department;
import com.nagarvaani.model.User;
import com.nagarvaani.repository.ComplaintRepository;
import com.nagarvaani.repository.DepartmentRepository;
import com.nagarvaani.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final FileUploadService fileUploadService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public ComplaintResponse createComplaint(CreateComplaintRequest request,
                                             String email) {

        String imageUrl = null;

        if (request.getBeforePhoto() != null &&
                !request.getBeforePhoto().isEmpty()) {

            imageUrl = fileUploadService.uploadFile(request.getBeforePhoto());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Department department = departmentRepository
                .findByCategoryType(request.getCategory())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(ComplaintStatus.REPORTED)
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .department(department)
                .reportedBy(user)
                .beforePhotoUrl(imageUrl)
                .build();


        complaintRepository.save(complaint);

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(complaint.getStatus().name())
                .department(department.getName())
                .message("Complaint submitted successfully")
                .build();
    }
}