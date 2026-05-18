package com.company.bugtracker1.ticket.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.bugtracker1.exception.BadRequestException;
import com.company.bugtracker1.exception.ForbiddenException;
import com.company.bugtracker1.exception.ResourceNotFoundException;
import com.company.bugtracker1.project.entity.Project;
import com.company.bugtracker1.project.repository.ProjectRepository;
import com.company.bugtracker1.ticket.dto.TicketDto;
import com.company.bugtracker1.ticket.entity.Ticket;
import com.company.bugtracker1.ticket.entity.TicketStatus;
import com.company.bugtracker1.ticket.mapper.TicketMapper;
import com.company.bugtracker1.ticket.repository.TicketRepository;
import com.company.bugtracker1.ticket.repository.TicketSpecification;
import com.company.bugtracker1.user.entity.Role;
import com.company.bugtracker1.user.entity.User;
import com.company.bugtracker1.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;

    @Transactional
    public TicketDto.TicketResponse createTicket(TicketDto.CreateTicketRequest request) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.projectId()));

        String ticketId = generateTicketId(project.getProjectCode());

        Ticket ticket = Ticket.builder()
                .ticketId(ticketId)
                .project(project)
                .issueDescription(request.issueDescription())
                .supportLevel(request.supportLevel())
                .priority(request.priority())
                .remarks(request.remarks())
                .currentStatus(TicketStatus.OPEN)
                .createdBy(currentUser)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        log.info("Created ticket: {} by user: {}", saved.getTicketId(), currentUser.getEmail());
        return ticketMapper.toResponse(saved);
    }

    @Transactional
    public TicketDto.TicketResponse updateTicket(Long id, TicketDto.UpdateTicketRequest request) {
        Ticket ticket = getTicketEntity(id);
        checkNotClosed(ticket);

        if (request.issueDescription() != null) ticket.setIssueDescription(request.issueDescription());
        if (request.supportLevel() != null) ticket.setSupportLevel(request.supportLevel());
        if (request.priority() != null) ticket.setPriority(request.priority());
        if (request.remarks() != null) ticket.setRemarks(request.remarks());

        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public TicketDto.TicketResponse getTicketById(Long id) {
        Ticket ticket = getTicketEntity(id);
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.SUPPORT_ENGINEER) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Access denied to ticket: " + id);
            }
        }
        return ticketMapper.toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public Page<TicketDto.TicketResponse> getAllTickets(TicketDto.TicketFilterRequest filter, Pageable pageable) {
        User currentUser = getCurrentUser();
        boolean isEngineer = currentUser.getRole() == Role.SUPPORT_ENGINEER;

        Specification<Ticket> spec = TicketSpecification.withFilters(filter, isEngineer, currentUser.getId());
        return ticketRepository.findAll(spec, pageable).map(ticketMapper::toResponse);
    }

    @Transactional
    public TicketDto.TicketResponse assignTicket(Long id, TicketDto.AssignTicketRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.SUPPORT_ENGINEER) {
            throw new ForbiddenException("Support engineers cannot assign tickets");
        }

        Ticket ticket = getTicketEntity(id);
        User assignee = userRepository.findById(request.assigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.assigneeId()));

        if (ticket.getAssignedTo() == null) {
            ticket.setResponseDateTime(LocalDateTime.now());
        }

        ticket.setAssignedTo(assignee);
        log.info("Assigned ticket {} to {}", ticket.getTicketId(), assignee.getEmail());
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDto.TicketResponse updateStatus(Long id, TicketDto.UpdateStatusRequest request) {
        Ticket ticket = getTicketEntity(id);
        TicketStatus newStatus = request.status();

        if (!ticket.getCurrentStatus().canTransitionTo(newStatus)) {
            throw new BadRequestException(
                    String.format("Invalid status transition: %s → %s", ticket.getCurrentStatus(), newStatus)
            );
        }

        if (newStatus == TicketStatus.RESOLVED && ticket.getResolutionTime() == null) {
            long minutes = ChronoUnit.MINUTES.between(ticket.getGenerationDate(), LocalDateTime.now());
            ticket.setResolutionTime(minutes);
        }

        ticket.setCurrentStatus(newStatus);
        log.info("Ticket {} status changed to {}", ticket.getTicketId(), newStatus);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDto.TicketResponse addResolution(Long id, TicketDto.ResolutionRequest request) {
        Ticket ticket = getTicketEntity(id);

        if (ticket.getCurrentStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot update resolution on a closed ticket");
        }

        ticket.setResolutionDetails(request.resolutionDetails());

        if (ticket.getCurrentStatus() != TicketStatus.RESOLVED && ticket.getCurrentStatus() != TicketStatus.CLOSED) {
            if (ticket.getCurrentStatus().canTransitionTo(TicketStatus.RESOLVED)) {
                long minutes = ChronoUnit.MINUTES.between(ticket.getGenerationDate(), LocalDateTime.now());
                ticket.setResolutionTime(minutes);
                ticket.setCurrentStatus(TicketStatus.RESOLVED);
            }
        }

        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    private Ticket getTicketEntity(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private void checkNotClosed(Ticket ticket) {
        if (ticket.getCurrentStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot modify a closed ticket");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private synchronized String generateTicketId(String projectCode) {
        int year = LocalDateTime.now().getYear();
        long count = ticketRepository.countByProjectCodeAndYear(projectCode, year);
        return String.format("%s-%d-%04d", projectCode, year, count + 1);
    }
}