package com.nagarvaani.dto.request;

import com.nagarvaani.enums.ComplaintStatus;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    private ComplaintStatus status;

}