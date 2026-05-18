package com.company.bugtracker1.ticket.repository;

import com.company.bugtracker1.ticket.dto.TicketDto;
import com.company.bugtracker1.ticket.entity.Ticket;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {

    public static Specification<Ticket> withFilters(
            TicketDto.TicketFilterRequest filter,
            boolean isEngineer,
            Long currentUserId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("currentStatus"), filter.status()));
            }
            if (filter.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.priority()));
            }
            if (filter.assignedTo() != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), filter.assignedTo()));
            }
            if (filter.projectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), filter.projectId()));
            }
            if (filter.supportLevel() != null) {
                predicates.add(cb.equal(root.get("supportLevel"), filter.supportLevel()));
            }
            if (filter.fromDate() != null && filter.toDate() != null) {
                predicates.add(cb.between(root.get("createdAt"), filter.fromDate(), filter.toDate()));
            } else if (filter.fromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.fromDate()));
            } else if (filter.toDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.toDate()));
            }
            if (isEngineer) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), currentUserId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}