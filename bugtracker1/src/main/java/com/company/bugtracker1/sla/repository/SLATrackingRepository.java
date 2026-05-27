package com.company.bugtracker1.sla.repository;

import com.company.bugtracker1.sla.entity.SLATracking;
import com.company.bugtracker1.sla.entity.SLAType;
import com.company.bugtracker1.sla.entity.SLAStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SLATrackingRepository extends JpaRepository<SLATracking, Long> {

    Optional<SLATracking> findByTicketIdAndSlaType(Long ticketId, SLAType slaType);

    List<SLATracking> findByStatus(SLAStatus status);

    List<SLATracking> findByTicketId(Long ticketId);

    List<SLATracking> findByIsBreachedTrue();

    List<SLATracking> findByStatusAndEndTimeBeforeAndIsBreachedFalse(SLAStatus status, LocalDateTime endTime);

    @Query("SELECT st FROM SLATracking st WHERE st.ticket.project.id = :projectId AND st.status = :status")
    List<SLATracking> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") SLAStatus status);

    @Query("SELECT st FROM SLATracking st WHERE st.ticket.project.id = :projectId AND st.isBreached = true")
    List<SLATracking> findBreachedSLAsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(st) FROM SLATracking st WHERE st.ticket.project.id = :projectId AND st.isBreached = true")
    Integer countBreachedSLAsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(st) FROM SLATracking st WHERE st.ticket.project.id = :projectId")
    Integer countTotalSLAsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT st FROM SLATracking st WHERE st.status = 'ACTIVE' AND st.endTime < CURRENT_TIMESTAMP AND st.isBreached = false")
    List<SLATracking> findPotentialBreaches();
}
