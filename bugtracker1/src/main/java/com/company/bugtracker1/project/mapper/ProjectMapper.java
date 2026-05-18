package com.company.bugtracker1.project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.company.bugtracker1.project.dto.ProjectDto;
import com.company.bugtracker1.project.entity.Project;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProjectMapper {
    ProjectDto.ProjectResponse toResponse(Project project);
    ProjectDto.ProjectSummary toSummary(Project project);
}