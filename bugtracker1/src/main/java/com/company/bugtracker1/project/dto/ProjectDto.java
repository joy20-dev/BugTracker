package com.company.bugtracker1.project.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProjectDto {

    public record ProjectResponse(
            Long id,
            String projectCode,
            String projectName,
            String description,
            LocalDateTime createdAt
    ) {}

    public record CreateProjectRequest(
            @NotBlank @Size(max = 20) String projectCode,
            @NotBlank @Size(max = 150) String projectName,
            String description
    ) {}

    public record ProjectSummary(
            Long id,
            String projectCode,
            String projectName
    ) {}
}