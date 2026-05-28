package com.company.bugtracker1.sla.service;

import com.company.bugtracker1.project.repository.ProjectRepository;
import com.company.bugtracker1.sla.dto.SLATrackingDto;
import com.company.bugtracker1.sla.entity.SLATracking;
import com.company.bugtracker1.sla.repository.SLABreachRepository;
import com.company.bugtracker1.sla.repository.SLATrackingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SLAMetricsService {

    private final SLATrackingRepository slaTrackingRepository;
    private final SLABreachRepository slaBreachRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public SLATrackingDto.SLAMetrics getAggregateMetrics() {
        List<SLATracking> allSLATrackings = slaTrackingRepository.findAll();
        return calculateMetrics(allSLATrackings);
    }

    public SLATrackingDto.SLAMetrics getMetricsForProject(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        Integer totalSLAs = slaTrackingRepository.countTotalSLAsByProjectId(projectId);
        Integer breachedSLAs = slaTrackingRepository.countBreachedSLAsByProjectId(projectId);

        Double breachPercentage = totalSLAs > 0 
                ? (breachedSLAs.doubleValue() / totalSLAs.doubleValue()) * 100 
                : 0.0;

        return SLATrackingDto.SLAMetrics.builder()
                .totalSLAs(totalSLAs)
                .breachedSLAs(breachedSLAs)
                .breachPercentage(breachPercentage)
                .build();
    }

    private SLATrackingDto.SLAMetrics calculateMetrics(List<SLATracking> slaTrackings) {
        int total = slaTrackings.size();
        int breached = (int) slaTrackings.stream().filter(SLATracking::getIsBreached).count();
        
        Double breachPercentage = total > 0 
                ? (breached * 100.0) / total 
                : 0.0;

        return SLATrackingDto.SLAMetrics.builder()
                .totalSLAs(total)
                .breachedSLAs(breached)
                .breachPercentage(breachPercentage)
                .build();
    }
}
