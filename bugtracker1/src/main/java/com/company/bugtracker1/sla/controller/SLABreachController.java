package com.company.bugtracker1.sla.controller;

import com.company.bugtracker1.sla.dto.SLABreachDto;
import com.company.bugtracker1.sla.service.SLABreachService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sla/breaches")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
public class SLABreachController {

    private final SLABreachService slaBreachService;

    @GetMapping("/{id}")
    public ResponseEntity<SLABreachDto.SLABreachResponse> getBreachById(@PathVariable Long id) {
        SLABreachDto.SLABreachResponse response = slaBreachService.getBreachById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<SLABreachDto.SLABreachResponse>> getBreachesByTicketId(
            @PathVariable Long ticketId) {
        List<SLABreachDto.SLABreachResponse> responses = slaBreachService.getBreachesByTicketId(ticketId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<List<SLABreachDto.SLABreachResponse>> getUnacknowledgedBreaches() {
        List<SLABreachDto.SLABreachResponse> responses = slaBreachService.getUnacknowledgedBreaches();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<SLABreachDto.SLABreachResponse>> getBreachesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<SLABreachDto.SLABreachResponse> responses = slaBreachService.getBreachesByDateRange(startTime, endTime);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{breachId}/acknowledge")
    public ResponseEntity<SLABreachDto.SLABreachResponse> acknowledgeBreache(
            @PathVariable Long breachId,
            @RequestBody SLABreachDto.AcknowledgeBreachRequest request) {
        SLABreachDto.SLABreachResponse response = slaBreachService.acknowledgeBreache(breachId, request);
        return ResponseEntity.ok(response);
    }
}
