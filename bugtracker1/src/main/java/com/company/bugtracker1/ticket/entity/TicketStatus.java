package com.company.bugtracker1.ticket.entity;

import java.util.Set;

public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    WAITING_FOR_CUSTOMER,
    RESOLVED,
    CLOSED;

    public boolean canTransitionTo(TicketStatus next) {
        return switch (this) {
            case OPEN -> Set.of(IN_PROGRESS).contains(next);
            case IN_PROGRESS -> Set.of(WAITING_FOR_CUSTOMER, RESOLVED).contains(next);
            case WAITING_FOR_CUSTOMER -> Set.of(IN_PROGRESS, RESOLVED).contains(next);
            case RESOLVED -> Set.of(CLOSED).contains(next);
            case CLOSED -> false;
        };
    }
}