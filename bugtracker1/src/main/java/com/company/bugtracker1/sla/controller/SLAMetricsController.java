package com.company.bugtracker1.sla.controller;

import com.company.bugtracker1.sla.dto.SLATrackingDto;
import com.company.bugtracker1.sla.service.SLAMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sla/metrics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class SLAMetricsController {

    private final SLAMetricsService slaMetricsService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<SLATrackingDto.SLAMetrics> getProjectMetrics(@PathVariable Long projectId) {
        SLATrackingDto.SLAMetrics metrics = slaMetricsService.getMetricsForProject(projectId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/aggregate")
    public ResponseEntity<SLATrackingDto.SLAMetrics> getAggregateMetrics() {
        SLATrackingDto.SLAMetrics metrics = slaMetricsService.getAggregateMetrics();
        return ResponseEntity.ok(metrics);
    }
}
