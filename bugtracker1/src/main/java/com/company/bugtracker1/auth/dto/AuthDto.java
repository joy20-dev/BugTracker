package com.company.bugtracker1.auth.dto;

import com.company.bugtracker1.user.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password
    ) {}

    public record AuthResponse(
            String token,
            String type,
            Long userId,
            String name,
            String email,
            Role role
    ) {
        public static AuthResponse of(String token, Long userId, String name, String email, Role role) {
            return new AuthResponse(token, "Bearer", userId, name, email, role);
        }
    }
}