package com.nagarvaani.dto.request;

import lombok.Data;

@Data
public class CreateOfficerRequest {

    private String name;

    private String email;

    // Official contact number (10 digits). Shown to the citizen whose complaint
    // is assigned to this officer.
    private String phone;

    private String password;

    private Long departmentId;
}