package com.company.bugtracker1.sla.controller;

import com.company.bugtracker1.sla.dto.SLATrackingDto;
import com.company.bugtracker1.sla.service.SLATrackingService;
import com.company.bugtracker1.sla.entity.SLAType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sla/tracking")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
public class SLATrackingController {

    private final SLATrackingService slaTrackingService;

    @GetMapping("/ticket/{ticketId}/sla/{slaType}")
    public ResponseEntity<SLATrackingDto.SLATrackingResponse> getSLAStatus(
            @PathVariable Long ticketId,
            @PathVariable SLAType slaType) {
        SLATrackingDto.SLATrackingResponse response = slaTrackingService.getSLAStatus(ticketId, slaType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<SLATrackingDto.SLATrackingResponse>> getTicketSLAs(
            @PathVariable Long ticketId) {
        List<SLATrackingDto.SLATrackingResponse> slas = slaTrackingService.getTicketSLAs(ticketId);
        return ResponseEntity.ok(slas);
    }

    @PostMapping("/start")
    public ResponseEntity<Void> startSLA(@RequestBody SLATrackingDto.StartSLARequest request) {
        boolean started = slaTrackingService.startSLA(request.getTicketId(), request.getSlaType());
        if (!started) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopSLA(@RequestBody SLATrackingDto.StopSLARequest request) {
        slaTrackingService.stopSLA(request.getTicketId(), request.getSlaType());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pause")
    public ResponseEntity<Void> pauseSLA(@RequestBody SLATrackingDto.PauseSLARequest request) {
        slaTrackingService.pauseSLA(request.getTicketId(), request.getSlaType(), request.getReason());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resume")
    public ResponseEntity<Void> resumeSLA(@RequestBody SLATrackingDto.ResumeSLARequest request) {
        slaTrackingService.resumeSLA(request.getTicketId(), request.getSlaType());
        return ResponseEntity.ok().build();
    }
}
