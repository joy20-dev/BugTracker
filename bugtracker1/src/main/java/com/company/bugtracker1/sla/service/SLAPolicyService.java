package com.company.bugtracker1.sla.service;

import com.company.bugtracker1.exception.ResourceNotFoundException;
import com.company.bugtracker1.exception.ConflictException;
import com.company.bugtracker1.sla.entity.SLAPolicy;
import com.company.bugtracker1.sla.entity.SLAType;
import com.company.bugtracker1.sla.entity.PriorityLevel;
import com.company.bugtracker1.sla.dto.SLAPolicyDto;
import com.company.bugtracker1.sla.repository.SLAPolicyRepository;
import com.company.bugtracker1.sla.mapper.SLAPolicyMapper;
import com.company.bugtracker1.project.entity.Project;
import com.company.bugtracker1.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SLAPolicyService {

    private final SLAPolicyRepository slaPolicyRepository;
    private final ProjectRepository projectRepository;
    private final SLAPolicyMapper slaPolicyMapper;

    @Transactional
    public SLAPolicyDto.SLAPolicyResponse createPolicy(SLAPolicyDto.CreateSLAPolicyRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        SLAPolicy existingPolicy = slaPolicyRepository.findByProjectIdAndPriorityLevelAndSlaType(
                request.getProjectId(),
                request.getPriorityLevel(),
                request.getSlaType()
        ).orElse(null);

        if (existingPolicy != null) {
            throw new ConflictException("SLA policy already exists for this priority and type");
        }

        SLAPolicy slaPolicy = SLAPolicy.builder()
                .project(project)
                .priorityLevel(request.getPriorityLevel())
                .slaType(request.getSlaType())
                .slaMinutes(request.getSlaMinutes())
                .includeWeekends(request.getIncludeWeekends() != null ? request.getIncludeWeekends() : true)
                .includeBusinessHoursOnly(request.getIncludeBusinessHoursOnly() != null ? request.getIncludeBusinessHoursOnly() : false)
                .businessHoursStart(request.getBusinessHoursStart() != null ? request.getBusinessHoursStart() : "09:00")
                .businessHoursEnd(request.getBusinessHoursEnd() != null ? request.getBusinessHoursEnd() : "18:00")
                .isActive(true)
                .build();

        SLAPolicy savedPolicy = slaPolicyRepository.save(slaPolicy);
        log.info("SLA policy created for project: {}, priority: {}, type: {}", 
                request.getProjectId(), request.getPriorityLevel(), request.getSlaType());

        return slaPolicyMapper.toResponse(savedPolicy);
    }

    @Transactional(readOnly = true)
    public SLAPolicyDto.SLAPolicyResponse getPolicyById(Long id) {
        SLAPolicy slaPolicy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found with id: " + id));

        return slaPolicyMapper.toResponse(slaPolicy);
    }

    @Transactional(readOnly = true)
    public List<SLAPolicyDto.SLAPolicyResponse> getPoliciesByProjectId(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        return slaPolicyRepository.findByProjectId(projectId)
                .stream()
                .map(slaPolicyMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SLAPolicyDto.SLAPolicyResponse> getActivePoliciesByProjectId(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        return slaPolicyRepository.findByProjectIdAndIsActiveTrue(projectId)
                .stream()
                .map(slaPolicyMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SLAPolicyDto.SLAPolicyResponse updatePolicy(Long id, SLAPolicyDto.UpdateSLAPolicyRequest request) {
        SLAPolicy slaPolicy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found with id: " + id));

        if (request.getSlaMinutes() != null) {
            slaPolicy.setSlaMinutes(request.getSlaMinutes());
        }
        if (request.getIncludeWeekends() != null) {
            slaPolicy.setIncludeWeekends(request.getIncludeWeekends());
        }
        if (request.getIncludeBusinessHoursOnly() != null) {
            slaPolicy.setIncludeBusinessHoursOnly(request.getIncludeBusinessHoursOnly());
        }
        if (request.getBusinessHoursStart() != null) {
            slaPolicy.setBusinessHoursStart(request.getBusinessHoursStart());
        }
        if (request.getBusinessHoursEnd() != null) {
            slaPolicy.setBusinessHoursEnd(request.getBusinessHoursEnd());
        }
        if (request.getIsActive() != null) {
            slaPolicy.setIsActive(request.getIsActive());
        }

        SLAPolicy updatedPolicy = slaPolicyRepository.save(slaPolicy);
        log.info("SLA policy updated with id: {}", id);

        return slaPolicyMapper.toResponse(updatedPolicy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        SLAPolicy slaPolicy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found with id: " + id));

        slaPolicyRepository.delete(slaPolicy);
        log.info("SLA policy deleted with id: {}", id);
    }

    @Transactional
    public void initializeDefaultPolicies(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        for (PriorityLevel priority : PriorityLevel.values()) {
            createPolicyIfNotExists(project, priority, SLAType.RESPONSE);
            createPolicyIfNotExists(project, priority, SLAType.RESOLUTION);
        }

        log.info("Default SLA policies initialized for project: {}", projectId);
    }

    private void createPolicyIfNotExists(Project project, PriorityLevel priority, SLAType slaType) {
        boolean exists = slaPolicyRepository.findByProjectIdAndPriorityLevelAndSlaType(
                project.getId(),
                priority,
                slaType
        ).isPresent();

        if (!exists) {
            int slaMinutes = slaType == SLAType.RESPONSE 
                    ? priority.getResponseSlaMinutes() 
                    : priority.getResolutionSlaMinutes();

            SLAPolicy policy = SLAPolicy.builder()
                    .project(project)
                    .priorityLevel(priority)
                    .slaType(slaType)
                    .slaMinutes(slaMinutes)
                    .includeWeekends(true)
                    .includeBusinessHoursOnly(false)
                    .businessHoursStart("09:00")
                    .businessHoursEnd("18:00")
                    .isActive(true)
                    .build();

            slaPolicyRepository.save(policy);
        }
    }
}
