package com.company.bugtracker1.ticket.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.company.bugtracker1.ticket.dto.TicketDto;
import com.company.bugtracker1.ticket.entity.Priority;
import com.company.bugtracker1.ticket.entity.SupportLevel;
import com.company.bugtracker1.ticket.entity.TicketStatus;
import com.company.bugtracker1.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketDto.TicketResponse> createTicket(@Valid @RequestBody TicketDto.CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDto.TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.UpdateTicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto.TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping
    public ResponseEntity<Page<TicketDto.TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) SupportLevel supportLevel,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        TicketDto.TicketFilterRequest filter = new TicketDto.TicketFilterRequest(
                status, priority, assignedTo, projectId, supportLevel, fromDate, toDate
        );
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ticketService.getAllTickets(filter, pageable));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketDto.TicketResponse> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.AssignTicketRequest request) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketDto.TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.UpdateStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketDto.TicketResponse> addResolution(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.ResolutionRequest request) {
        return ResponseEntity.ok(ticketService.addResolution(id, request));
    }
}