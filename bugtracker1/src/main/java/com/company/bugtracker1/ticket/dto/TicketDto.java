package com.company.bugtracker1.ticket.dto;

import java.time.LocalDateTime;

import com.company.bugtracker1.project.dto.ProjectDto;
import com.company.bugtracker1.ticket.entity.Priority;
import com.company.bugtracker1.ticket.entity.SupportLevel;
import com.company.bugtracker1.ticket.entity.TicketStatus;
import com.company.bugtracker1.user.dto.UserDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketDto {

    public record TicketResponse(
            Long id,
            String ticketId,
            ProjectDto.ProjectSummary project,
            String issueDescription,
            UserDto.UserSummary assignedTo,
            SupportLevel supportLevel,
            Priority priority,
            LocalDateTime generationDate,
            LocalDateTime responseDateTime,
            Long resolutionTime,
            TicketStatus currentStatus,
            String resolutionDetails,
            String remarks,
            UserDto.UserSummary createdBy,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record CreateTicketRequest(
            @NotNull Long projectId,
            @NotBlank String issueDescription,
            @NotNull SupportLevel supportLevel,
            @NotNull Priority priority,
            String remarks
    ) {}

    public record UpdateTicketRequest(
            String issueDescription,
            SupportLevel supportLevel,
            Priority priority,
            String remarks
    ) {}

    public record AssignTicketRequest(
            @NotNull Long assigneeId
    ) {}

    public record UpdateStatusRequest(
            @NotNull TicketStatus status
    ) {}

    public record ResolutionRequest(
            @NotBlank String resolutionDetails
    ) {}

    public record TicketFilterRequest(
            TicketStatus status,
            Priority priority,
            Long assignedTo,
            Long projectId,
            SupportLevel supportLevel,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {}
}