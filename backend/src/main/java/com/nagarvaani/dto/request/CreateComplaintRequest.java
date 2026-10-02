package com.nagarvaani.dto.request;
import org.springframework.web.multipart.MultipartFile;
import com.nagarvaani.enums.ComplaintCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateComplaintRequest {

    private MultipartFile beforePhoto;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private ComplaintCategory category;

    private String address;

    private Double latitude;

    private Double longitude;
}