package com.company.bugtracker1.project.repository;

import java.util.Optional;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.company.bugtracker1.project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    boolean existsByProjectCode(String projectCode);
    List<Project> findAllByUsers_Id(Long userId);
    boolean existsByIdAndUsers_Id(Long projectId, Long userId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO project_users(project_id, user_id) VALUES (:projectId, :userId)", nativeQuery = true)
    void addUserToProject(@Param("projectId") Long projectId, @Param("userId") Long userId);
}