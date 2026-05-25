package com.company.bugtracker1.project.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.bugtracker1.exception.ConflictException;
import com.company.bugtracker1.exception.ForbiddenException;
import com.company.bugtracker1.exception.ResourceNotFoundException;
import com.company.bugtracker1.project.dto.ProjectDto;
import com.company.bugtracker1.project.entity.Project;
import com.company.bugtracker1.project.mapper.ProjectMapper;
import com.company.bugtracker1.project.repository.ProjectRepository;
import com.company.bugtracker1.user.entity.Role;
import com.company.bugtracker1.user.entity.User;
import com.company.bugtracker1.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getAllProjects() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return projectRepository.findAll().stream()
                    .map(projectMapper::toResponse)
                    .toList();
        }
        return projectRepository.findAllByUsers_Id(currentUser.getId()).stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto.ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !projectRepository.existsByIdAndUsers_Id(id, currentUser.getId())) {
            throw new ForbiddenException("Access denied to project: " + id);
        }
        return projectMapper.toResponse(project);
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

    @Transactional
    public ProjectDto.ProjectResponse assignUserToProject(Long projectId, Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.SUPPORT_ENGINEER) {
            throw new ForbiddenException("Support engineers cannot manage project membership");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (project.getUsers().add(user)) {
            user.getProjects().add(project);
            projectRepository.save(project);
        }

        return projectMapper.toResponse(project);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}