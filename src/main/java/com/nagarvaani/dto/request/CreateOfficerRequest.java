package com.nagarvaani.dto.request;

import lombok.Data;

@Data
public class CreateOfficerRequest {

    private String name;

    private String email;

    private String password;

    private Long departmentId;
}