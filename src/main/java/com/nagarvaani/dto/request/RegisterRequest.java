package com.nagarvaani.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    // Needs text@domain.tld (plain @Email accepts "abc@gmail")
    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$",
            message = "Please enter a valid email address"
    )
    private String email;

    // Indian mobile number: 10 digits starting with 6-9
    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Please enter a valid 10-digit mobile number"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}