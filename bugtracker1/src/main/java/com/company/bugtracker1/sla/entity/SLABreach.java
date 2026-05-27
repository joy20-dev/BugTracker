package com.company.bugtracker1.sla.entity;

import com.company.bugtracker1.ticket.entity.Ticket;
import com.company.bugtracker1.user.entity.User;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_breaches", indexes = {
        @Index(name = "idx_sla_breaches_ticket_id", columnList = "ticket_id"),
        @Index(name = "idx_sla_type", columnList = "sla_type"),
        @Index(name = "idx_breach_time", columnList = "breach_timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLABreach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_type", nullable = false)
    private SLAType slaType;

    @Column(name = "breach_timestamp", nullable = false)
    private LocalDateTime breachTimestamp;

    @Column(name = "expected_time")
    private LocalDateTime expectedTime;

    @Column(name = "actual_breach_minutes", nullable = false)
    private Long breachMinutes;

    @Column(name = "is_acknowledged", nullable = false)
    private Boolean isAcknowledged = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acknowledged_by")
    private User acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledgment_notes", columnDefinition = "TEXT")
    private String acknowledgmentNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
