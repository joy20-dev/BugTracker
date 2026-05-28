package com.company.bugtracker1.sla.entity;

import com.company.bugtracker1.project.entity.Project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder.Default;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", nullable = false)
    private PriorityLevel priorityLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_type", nullable = false)
    private SLAType slaType;

    @Column(name = "sla_minutes", nullable = false)
    private Integer slaMinutes;

    @Column(name = "include_weekends", nullable = false)
    @Default
    private Boolean includeWeekends = true;

    @Column(name = "include_business_hours_only", nullable = false)
    @Default
    private Boolean includeBusinessHoursOnly = false;

    @Column(name = "business_hours_start", length = 5)
    @Default
    private String businessHoursStart = "09:00";

    @Column(name = "business_hours_end", length = 5)
    @Default
    private String businessHoursEnd = "18:00";

    @Column(name = "is_active", nullable = false)
    @Default
    private Boolean isActive = true;

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
