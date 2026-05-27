package com.company.bugtracker1.sla.entity;

import com.company.bugtracker1.ticket.entity.Ticket;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_tracking", indexes = {
        @Index(name = "idx_sla_tracking_ticket_id", columnList = "ticket_id"),
        @Index(name = "idx_sla_type", columnList = "sla_type"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_end_time", columnList = "end_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLATracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_type", nullable = false)
    private SLAType slaType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "remaining_minutes")
    private Long remainingMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SLAStatus status;

    @Column(name = "is_breached", nullable = false)
    private Boolean isBreached = false;

    @Column(name = "breach_timestamp")
    private LocalDateTime breachTimestamp;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "total_paused_duration_minutes")
    private Long totalPausedDurationMinutes = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
