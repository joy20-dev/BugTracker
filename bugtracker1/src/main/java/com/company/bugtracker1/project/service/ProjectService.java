package com.company.bugtracker1.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.bugtracker1.exception.ConflictException;
import com.company.bugtracker1.exception.ResourceNotFoundException;
import com.company.bugtracker1.project.dto.ProjectDto;
import com.company.bugtracker1.project.entity.Project;
import com.company.bugtracker1.project.mapper.ProjectMapper;
import com.company.bugtracker1.project.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto.ProjectResponse getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(projectMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    @Transactional
    public ProjectDto.ProjectResponse createProject(ProjectDto.CreateProjectRequest request) {
        if (projectRepository.existsByProjectCode(request.projectCode().toUpperCase())) {
            throw new ConflictException("Project code already exists: " + request.projectCode());
        }
        Project project = Project.builder()
                .projectCode(request.projectCode().toUpperCase())
                .projectName(request.projectName())
                .description(request.description())
                .build();
        Project saved = projectRepository.save(project);
        log.info("Created project: {} ({})", saved.getProjectName(), saved.getProjectCode());
        return projectMapper.toResponse(saved);
    }
}