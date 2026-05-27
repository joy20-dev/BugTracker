package com.company.bugtracker1.sla.service;

import com.company.bugtracker1.exception.ResourceNotFoundException;
import com.company.bugtracker1.exception.ConflictException;
import com.company.bugtracker1.sla.entity.*;
import com.company.bugtracker1.sla.dto.SLATrackingDto;
import com.company.bugtracker1.sla.repository.SLATrackingRepository;
import com.company.bugtracker1.sla.repository.SLAPolicyRepository;
import com.company.bugtracker1.sla.repository.SLABreachRepository;
import com.company.bugtracker1.sla.mapper.SLATrackingMapper;
import com.company.bugtracker1.ticket.entity.Ticket;
import com.company.bugtracker1.ticket.repository.TicketRepository;
import com.company.bugtracker1.audit.service.AuditLogService;
import com.company.bugtracker1.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SLATrackingService {

    private final SLATrackingRepository slaTrackingRepository;
    private final SLAPolicyRepository slaPolicyRepository;
    private final SLABreachRepository slaBreachRepository;
    private final TicketRepository ticketRepository;
    private final SLATrackingMapper slaTrackingMapper;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @Transactional
    public void initializeSLAs(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        List<SLAPolicy> policies = slaPolicyRepository.findByProjectIdAndIsActiveTrue(ticket.getProject().getId());

        for (SLAPolicy policy : policies) {
            if (shouldInitializeSLA(ticket, policy)) {
                startSLA(ticket, policy.getSlaType());
            }
        }

        log.info("SLAs initialized for ticket: {}", ticketId);
    }

    @Transactional
    public boolean startSLA(Ticket ticket, SLAType slaType) {
        Optional<SLATracking> existingSLA = slaTrackingRepository.findByTicketIdAndSlaType(ticket.getId(), slaType);

        if (existingSLA.isPresent()) {
            log.warn("SLA already exists for ticket {} and type {}", ticket.getId(), slaType);
            return false;
        }

        SLAPolicy policy = getSLAPolicyForTicket(ticket, slaType);
        if (policy == null) {
            log.warn("No SLA policy found for ticket {} and type {}", ticket.getId(), slaType);
            return false;
        }

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = SLATimeCalculator.calculateSLAEndTime(
                startTime,
                policy.getSlaMinutes(),
                policy.getIncludeWeekends(),
                policy.getIncludeBusinessHoursOnly(),
                policy.getBusinessHoursStart(),
                policy.getBusinessHoursEnd()
        );

        SLATracking slaTracking = SLATracking.builder()
                .ticket(ticket)
                .slaType(slaType)
                .startTime(startTime)
                .endTime(endTime)
                .remainingMinutes(policy.getSlaMinutes().longValue())
                .status(SLAStatus.ACTIVE)
                .isBreached(false)
                .totalPausedDurationMinutes(0L)
                .build();

        slaTrackingRepository.save(slaTracking);
        auditLogService.logAction(ticket, "SLA_STARTED", slaType + " SLA started", "SLA_TRACKING", slaTracking.getId(), null, slaType.toString());
        log.info("SLA started for ticket {} with type: {}", ticket.getId(), slaType);
        return true;
    }

    @Transactional
    public void stopSLA(Long ticketId, SLAType slaType) {
        SLATracking slaTracking = slaTrackingRepository.findByTicketIdAndSlaType(ticketId, slaType)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found for ticket and type"));

        Ticket ticket = slaTracking.getTicket();
        slaTracking.setStatus(SLAStatus.COMPLETED);
        slaTrackingRepository.save(slaTracking);

        auditLogService.logAction(ticket, "SLA_STOPPED", slaType + " SLA stopped", "SLA_TRACKING", slaTracking.getId(), SLAStatus.ACTIVE.toString(), SLAStatus.COMPLETED.toString());
        log.info("SLA stopped for ticket {} with type: {}", ticketId, slaType);
    }

    @Transactional
    public void pauseSLA(Long ticketId, SLAType slaType, String reason) {
        SLATracking slaTracking = slaTrackingRepository.findByTicketIdAndSlaType(ticketId, slaType)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found for ticket and type"));

        if (!slaTracking.getStatus().equals(SLAStatus.ACTIVE)) {
            throw new ConflictException("Can only pause active SLAs");
        }

        slaTracking.setStatus(SLAStatus.PAUSED);
        slaTracking.setPausedAt(LocalDateTime.now());
        slaTrackingRepository.save(slaTracking);

        auditLogService.logAction(slaTracking.getTicket(), "SLA_PAUSED", reason, "SLA_TRACKING", slaTracking.getId(), SLAStatus.ACTIVE.toString(), SLAStatus.PAUSED.toString());
        log.info("SLA paused for ticket {} with type: {} - Reason: {}", ticketId, slaType, reason);
    }

    @Transactional
    public void resumeSLA(Long ticketId, SLAType slaType) {
        SLATracking slaTracking = slaTrackingRepository.findByTicketIdAndSlaType(ticketId, slaType)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found for ticket and type"));

        if (!slaTracking.getStatus().equals(SLAStatus.PAUSED)) {
            throw new ConflictException("Can only resume paused SLAs");
        }

        LocalDateTime pausedAt = slaTracking.getPausedAt();
        if (pausedAt == null) {
            throw new ConflictException("Cannot resume SLA: pause timestamp missing");
        }
        long pausedDuration = java.time.temporal.ChronoUnit.MINUTES.between(pausedAt, LocalDateTime.now());

        slaTracking.setStatus(SLAStatus.ACTIVE);
        slaTracking.setPausedAt(null);
        slaTracking.setTotalPausedDurationMinutes(slaTracking.getTotalPausedDurationMinutes() + pausedDuration);
        slaTracking.setEndTime(slaTracking.getEndTime().plusMinutes(pausedDuration));

        slaTrackingRepository.save(slaTracking);
        auditLogService.logAction(slaTracking.getTicket(), "SLA_RESUMED", "SLA resumed after pause", "SLA_TRACKING", slaTracking.getId(), SLAStatus.PAUSED.toString(), SLAStatus.ACTIVE.toString());
        log.info("SLA resumed for ticket {} with type: {}", ticketId, slaType);
    }

    @Transactional(readOnly = true)
    public SLATrackingDto.SLATrackingResponse getSLAStatus(Long ticketId, SLAType slaType) {
        SLATracking slaTracking = slaTrackingRepository.findByTicketIdAndSlaType(ticketId, slaType)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found for ticket and type"));

        return slaTrackingMapper.toResponse(slaTracking);
    }

    @Transactional(readOnly = true)
    public List<SLATrackingDto.SLATrackingResponse> getTicketSLAs(Long ticketId) {
        ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        return slaTrackingRepository.findByTicketId(ticketId)
            .stream()
            .map(slaTrackingMapper::toResponse)
            .collect(Collectors.toList());
    }

        @Transactional
        public boolean startSLA(Long ticketId, SLAType slaType) {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

            return startSLA(ticket, slaType);
        }

    @Transactional
    public void updateRemainingTime() {
        List<SLATracking> activeSLAs = slaTrackingRepository.findByStatus(SLAStatus.ACTIVE);

        for (SLATracking sla : activeSLAs) {
            long remainingMinutes = SLATimeCalculator.getRemainingMinutes(sla.getStartTime(), sla.getEndTime());
            sla.setRemainingMinutes(remainingMinutes);

            boolean isNowBreached = SLATimeCalculator.isBreached(sla.getEndTime());
            if (isNowBreached && !sla.getIsBreached()) {
                handleSLABreach(sla);
            }

            slaTrackingRepository.save(sla);
        }
    }

    @Transactional
    protected void handleSLABreach(SLATracking slaTracking) {
        slaTracking.setIsBreached(true);
        slaTracking.setBreachTimestamp(LocalDateTime.now());
        slaTracking.setStatus(SLAStatus.BREACHED);
        slaTrackingRepository.save(slaTracking);

        Ticket ticket = slaTracking.getTicket();
        createBreachRecord(slaTracking);
        updateTicketPriority(ticket);

        auditLogService.logAction(ticket, "SLA_BREACHED", slaTracking.getSlaType() + " SLA has been breached", 
                "SLA_TRACKING", slaTracking.getId(), "ACTIVE", "BREACHED");
        log.error("SLA BREACHED - Ticket ID: {}, SLA Type: {}, Breach Time: {}", ticket.getId(), slaTracking.getSlaType(), slaTracking.getBreachTimestamp());
    }

    private void createBreachRecord(SLATracking slaTracking) {
        SLABreach slaBreache = SLABreach.builder()
                .ticket(slaTracking.getTicket())
                .slaType(slaTracking.getSlaType())
                .breachTimestamp(LocalDateTime.now())
                .expectedTime(slaTracking.getEndTime())
                .breachMinutes(Math.abs(SLATimeCalculator.getRemainingMinutes(slaTracking.getStartTime(), slaTracking.getEndTime())))
                .isAcknowledged(false)
                .build();

        slaBreachRepository.save(slaBreache);
        log.info("Breach record created for ticket: {}", slaTracking.getTicket().getId());
    }

    private void updateTicketPriority(Ticket ticket) {
        ticket.setPriority(com.company.bugtracker1.ticket.entity.Priority.CRITICAL);
        ticketRepository.save(ticket);
        log.info("Ticket {} priority updated to CRITICAL due to SLA breach", ticket.getId());
    }

    private SLAPolicy getSLAPolicyForTicket(Ticket ticket, SLAType slaType) {
        // Convert Priority to PriorityLevel
        PriorityLevel priorityLevel = convertPriorityToPriorityLevel(ticket.getPriority());
        
        return slaPolicyRepository.findByProjectIdAndPriorityLevelAndSlaType(
                ticket.getProject().getId(),
                priorityLevel,
                slaType
        ).orElse(null);
    }

    private boolean shouldInitializeSLA(Ticket ticket, SLAPolicy policy) {
        PriorityLevel ticketPriority = convertPriorityToPriorityLevel(ticket.getPriority());
        return ticketPriority.equals(policy.getPriorityLevel());
    }

    private PriorityLevel convertPriorityToPriorityLevel(com.company.bugtracker1.ticket.entity.Priority priority) {
        return switch (priority) {
            case LOW -> PriorityLevel.P4;
            case MEDIUM -> PriorityLevel.P3;
            case HIGH -> PriorityLevel.P2;
            case CRITICAL -> PriorityLevel.P1;
        };
    }
}
