package com.nagarvaani.dto.request;

import com.nagarvaani.enums.ComplaintStatus;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateComplaintRequest {

    private ComplaintStatus status;

    private String resolutionNotes;

    private MultipartFile afterPhoto;
}