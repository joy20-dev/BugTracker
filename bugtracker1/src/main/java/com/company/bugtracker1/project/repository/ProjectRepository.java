package com.company.bugtracker1.project.repository;

import java.util.Optional;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.company.bugtracker1.project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    boolean existsByProjectCode(String projectCode);
    List<Project> findAllByUsers_Id(Long userId);
    boolean existsByIdAndUsers_Id(Long projectId, Long userId);
}