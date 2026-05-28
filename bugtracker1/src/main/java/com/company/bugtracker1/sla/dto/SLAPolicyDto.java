package com.company.bugtracker1.sla.dto;

import com.company.bugtracker1.sla.entity.SLAType;
import com.company.bugtracker1.sla.entity.PriorityLevel;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

import java.time.LocalDateTime;

public class SLAPolicyDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SLAPolicyResponse {
        private Long id;

        @JsonProperty("project_id")
        private Long projectId;

        @JsonProperty("priority_level")
        private PriorityLevel priorityLevel;

        @JsonProperty("sla_type")
        private SLAType slaType;

        @JsonProperty("sla_minutes")
        private Integer slaMinutes;

        @JsonProperty("include_weekends")
        private Boolean includeWeekends;

        @JsonProperty("include_business_hours_only")
        private Boolean includeBusinessHoursOnly;

        @JsonProperty("business_hours_start")
        private String businessHoursStart;

        @JsonProperty("business_hours_end")
        private String businessHoursEnd;

        @JsonProperty("is_active")
        private Boolean isActive;

        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        @JsonProperty("updated_at")
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateSLAPolicyRequest {
        @JsonProperty("project_id")
        private Long projectId;

        @JsonProperty("priority_level")
        private PriorityLevel priorityLevel;

        @JsonProperty("sla_type")
        private SLAType slaType;

        @JsonProperty("sla_minutes")
        private Integer slaMinutes;

        @JsonProperty("include_weekends")
        @Default
        private Boolean includeWeekends = true;

        @JsonProperty("include_business_hours_only")
        @Default
        private Boolean includeBusinessHoursOnly = false;

        @JsonProperty("business_hours_start")
        @Default
        private String businessHoursStart = "09:00";

        @JsonProperty("business_hours_end")
        @Default
        private String businessHoursEnd = "18:00";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateSLAPolicyRequest {
        @JsonProperty("sla_minutes")
        private Integer slaMinutes;

        @JsonProperty("include_weekends")
        private Boolean includeWeekends;

        @JsonProperty("include_business_hours_only")
        private Boolean includeBusinessHoursOnly;

        @JsonProperty("business_hours_start")
        private String businessHoursStart;

        @JsonProperty("business_hours_end")
        private String businessHoursEnd;

        @JsonProperty("is_active")
        private Boolean isActive;
    }
}
