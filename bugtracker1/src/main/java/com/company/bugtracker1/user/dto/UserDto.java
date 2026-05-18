package com.company.bugtracker1.user.dto;

import java.time.LocalDateTime;

import com.company.bugtracker1.user.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserDto {

    public record UserResponse(
            Long id,
            String name,
            String email,
            Role role,
            LocalDateTime createdAt
    ) {}

    public record CreateUserRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            @NotNull Role role
    ) {}

    public record UserSummary(
            Long id,
            String name,
            String email,
            Role role
    ) {}
}